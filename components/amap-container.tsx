"use client";

// ═══════════════════════════════════════════════════════════
// 高德地图容器组件 — Amap JS API Container
// 加载高德 JS API 2.0，提供地图实例、标记、信息窗口等功能
// ═══════════════════════════════════════════════════════════

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    AMap: typeof AMap;
    _AMapSecurityConfig?: { securityJsCode: string };
  }
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace AMap {
    class Map {
      constructor(container: string | HTMLElement, opts?: Record<string, unknown>);
      destroy(): void;
      setCenter(lnglat: [number, number]): void;
      setZoom(zoom: number): void;
      setFitView(markers?: unknown[]): void;
      getCenter(): { getLng(): number; getLat(): number };
      getZoom(): number;
      on(event: string, handler: (...args: unknown[]) => void): void;
      add(overlay: unknown): void;
      remove(overlay: unknown): void;
      clearMap(): void;
      plugin(plugins: string[], callback: () => void): void;
    }
    class Marker {
      constructor(opts?: Record<string, unknown>);
      setMap(map: Map | null): void;
      getPosition(): { getLng(): number; getLat(): number };
      on(event: string, handler: (...args: unknown[]) => void): void;
      setLabel(opts: Record<string, unknown>): void;
    }
    class InfoWindow {
      constructor(opts?: Record<string, unknown>);
      open(map: Map, position: [number, number]): void;
      close(): void;
      setContent(content: string | HTMLElement): void;
    }
    class Geolocation {
      getCurrentPosition(callback: (status: string, result: { position: { getLng(): number; getLat(): number }; formattedAddress: string }) => void): void;
    }
    class CircleMarker {
      constructor(opts?: Record<string, unknown>);
      setMap(map: Map | null): void;
    }
  }
}

// 加载高德 JS API 脚本
function loadAmapScript(key: string, securityCode?: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      resolve();
      return;
    }

    // 安全密钥配置
    if (securityCode) {
      window._AMapSecurityConfig = { securityJsCode: securityCode };
    }

    const script = document.createElement("script");
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${key}&plugin=AMap.Geolocation,AMap.PlaceSearch,AMap.Geocoder,AMap.Weather,AMap.Driving,AMap.Walking`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Amap JS API"));
    document.head.appendChild(script);
  });
}

export type AmapMarkerData = {
  id: string;
  name: string;
  lng: number;
  lat: number;
  label?: string;
  icon?: string;
  infoContent?: string;
};

type AmapContainerProps = {
  className?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: AmapMarkerData[];
  showGeolocation?: boolean;
  onMapReady?: (map: AMap.Map) => void;
  onMarkerClick?: (marker: AmapMarkerData) => void;
  onLocationSuccess?: (lng: number, lat: number, address: string) => void;
  style?: React.CSSProperties;
};

export default function AmapContainer({
  className = "",
  center = [113.06, 23.68], // 清远市中心
  zoom = 10,
  markers = [],
  showGeolocation = true,
  onMapReady,
  onMarkerClick,
  onLocationSuccess,
  style,
}: AmapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<AMap.Map | null>(null);
  const markersRef = useRef<AMap.Marker[]>([]);
  const infoWindowRef = useRef<AMap.InfoWindow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const jsKey = process.env.NEXT_PUBLIC_AMAP_JS_KEY || "";
  const securityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_CODE || "";

  // 初始化地图
  useEffect(() => {
    if (!jsKey) {
      setError("NEXT_PUBLIC_AMAP_JS_KEY 未配置");
      setLoading(false);
      return;
    }

    let destroyed = false;

    loadAmapScript(jsKey, securityCode)
      .then(() => {
        if (destroyed || !containerRef.current) return;

        const map = new window.AMap.Map(containerRef.current, {
          zoom,
          center,
          resizeEnable: true,
          viewMode: "2D",
          mapStyle: "amap://styles/whitesmoke",
        });

        mapRef.current = map;
        infoWindowRef.current = new window.AMap.InfoWindow({
          offset: [0, -30],
          closeWhenClickMap: true,
        });

        setLoading(false);
        onMapReady?.(map);
      })
      .catch((err) => {
        if (!destroyed) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsKey]);

  // 更新标记
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 清除旧标记
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // 添加新标记
    markers.forEach((data) => {
      const marker = new window.AMap.Marker({
        position: [data.lng, data.lat],
        title: data.name,
        label: data.label
          ? { content: data.label, direction: "top", offset: [0, -5] }
          : undefined,
      });

      marker.on("click", () => {
        onMarkerClick?.(data);
        if (data.infoContent && infoWindowRef.current) {
          infoWindowRef.current.setContent(data.infoContent);
          infoWindowRef.current.open(map, [data.lng, data.lat]);
        }
      });

      marker.setMap(map);
      markersRef.current.push(marker);
    });

    // 自适应视野
    if (markers.length > 0) {
      map.setFitView(markersRef.current);
    }
  }, [markers, onMarkerClick]);

  // 定位
  const locate = useCallback(() => {
    const map = mapRef.current;
    if (!map || !window.AMap) return;

    map.plugin(["AMap.Geolocation"], () => {
      const geolocation = new window.AMap.Geolocation();
      geolocation.getCurrentPosition((status: string, result) => {
        if (status === "complete") {
          const lng = result.position.getLng();
          const lat = result.position.getLat();
          map.setCenter([lng, lat]);
          map.setZoom(14);
          onLocationSuccess?.(lng, lat, result.formattedAddress);
        }
      });
    });
  }, [onLocationSuccess]);

  // 如果开启自动定位
  useEffect(() => {
    if (showGeolocation && mapRef.current && !loading) {
      // 不自动定位，用户点击按钮触发
    }
  }, [showGeolocation, loading]);

  return (
    <div className={`relative ${className}`} style={style}>
      <div ref={containerRef} className="w-full h-full rounded-xl" />

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm text-muted-foreground">加载地图中...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-xl">
          <div className="text-center p-4">
            <p className="text-sm text-destructive font-medium">{error}</p>
            <p className="text-xs text-muted-foreground mt-1">请检查高德地图 JS API Key 配置</p>
          </div>
        </div>
      )}

      {showGeolocation && !loading && !error && (
        <button
          onClick={locate}
          className="absolute bottom-4 right-4 z-10 p-2.5 rounded-full bg-background/90 border border-border shadow-lg hover:bg-accent transition-colors"
          title="定位我的位置"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      )}
    </div>
  );
}
