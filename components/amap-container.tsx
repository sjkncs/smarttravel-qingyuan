"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Village } from "@/lib/data/villages";

// Amap type declarations
declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode: string };
    AMap?: any;
  }
}

interface AmapContainerProps {
  villages: Village[];
  selectedMarker: string | null;
  onMarkerClick: (id: string | null) => void;
  locale: string;
  layersActive: Record<string, boolean>;
}

export default function AmapContainer({
  villages,
  selectedMarker,
  onMarkerClick,
  locale,
  layersActive,
}: AmapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);
  const trafficLayerRef = useRef<any>(null);
  const satelliteLayerRef = useRef<any>(null);
  const heatmapLayerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const jsKey = process.env.NEXT_PUBLIC_AMAP_JS_KEY;
    const secKey = process.env.NEXT_PUBLIC_AMAP_SECURITY_KEY;

    if (!jsKey) {
      setLoadError("高德地图 API Key 未配置");
      return;
    }

    // Set security config
    if (secKey) {
      window._AMapSecurityConfig = { securityJsCode: secKey };
    }

    // Dynamic import to avoid SSR issues
    import("@amap/amap-jsapi-loader")
      .then((AMapLoader) => {
        return AMapLoader.default.load({
          key: jsKey,
          version: "2.0",
          plugins: [
            "AMap.Scale",
            "AMap.ToolBar",
            "AMap.Geolocation",
            "AMap.PlaceSearch",
            "AMap.Weather",
            "AMap.HeatMap",
          ],
        });
      })
      .then((AMap: any) => {
        const map = new AMap.Map(mapRef.current, {
          zoom: 9,
          center: [113.06, 23.68], // Qingyuan city center
          mapStyle: "amap://styles/fresh",
          viewMode: "3D",
        });

        // Add controls
        map.addControl(new AMap.Scale({ position: "LB" }));
        map.addControl(
          new AMap.ToolBar({ position: { top: "80px", right: "20px" } })
        );

        mapInstanceRef.current = map;

        // Pre-create traffic layer
        trafficLayerRef.current = new AMap.TileLayer.Traffic({ autoRefresh: true, interval: 180 });

        // Pre-create satellite layer
        satelliteLayerRef.current = new AMap.TileLayer.Satellite();

        // Create heatmap with village crowd simulation data
        const heatmapData = villages.flatMap((v) => {
          const points: { lng: number; lat: number; count: number }[] = [];
          const base = v.highlights.vsi;
          for (let i = 0; i < 30; i++) {
            points.push({
              lng: v.longitude + (Math.random() - 0.5) * 0.02,
              lat: v.latitude + (Math.random() - 0.5) * 0.02,
              count: Math.round(base * (0.5 + Math.random() * 0.8)),
            });
          }
          return points;
        });

        try {
          const heatmap = new AMap.HeatMap(map, {
            radius: 25,
            opacity: [0, 0.8],
            gradient: { 0.4: "blue", 0.6: "cyan", 0.7: "lime", 0.8: "yellow", 1.0: "red" },
          });
          heatmap.setDataSet({ data: heatmapData, max: 100 });
          heatmap.hide();
          heatmapLayerRef.current = heatmap;
        } catch (e) {
          console.warn("[Amap] HeatMap plugin not available", e);
        }

        // Signal ready AFTER all layer refs are created
        setMapReady(true);
      })
      .catch((err: any) => {
        console.error("[Amap] Load failed:", err);
        setLoadError(`地图加载失败: ${err?.message || err}`);
      });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Toggle traffic layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !trafficLayerRef.current) return;
    if (layersActive.traffic) {
      trafficLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      trafficLayerRef.current.setMap(null);
    }
  }, [mapReady, layersActive.traffic]);

  // Toggle terrain/satellite layer
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !satelliteLayerRef.current) return;
    if (layersActive.terrain) {
      satelliteLayerRef.current.setMap(mapInstanceRef.current);
    } else {
      satelliteLayerRef.current.setMap(null);
    }
  }, [mapReady, layersActive.terrain]);

  // Toggle heatmap layer
  useEffect(() => {
    if (!mapReady || !heatmapLayerRef.current) return;
    if (layersActive.heatmap) {
      heatmapLayerRef.current.show();
    } else {
      heatmapLayerRef.current.hide();
    }
  }, [mapReady, layersActive.heatmap]);

  // Add village markers
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const AMap = window.AMap;
    if (!AMap) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (!layersActive.villages) return;

    villages.forEach((v) => {
      const vsi = v.highlights.vsi;
      const color = vsi >= 90 ? "#059669" : vsi >= 80 ? "#d97706" : "#dc2626";

      const markerContent = document.createElement("div");
      markerContent.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
          <div style="width:32px;height:32px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid white;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div style="margin-top:4px;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,0.95);font-size:11px;font-weight:600;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,0.15);">
            ${locale === "zh" ? v.name : v.nameEn}
          </div>
          ${
            layersActive.safety
              ? `<div style="font-size:10px;font-weight:700;color:${color};margin-top:1px;">VSI: ${vsi}</div>`
              : ""
          }
        </div>
      `;

      const marker = new AMap.Marker({
        position: [v.longitude, v.latitude],
        content: markerContent,
        offset: new AMap.Pixel(-16, -40),
        extData: { id: v.id, village: v },
      });

      marker.on("click", () => {
        onMarkerClick(v.id);
        showInfoWindow(AMap, v);
      });

      marker.setMap(mapInstanceRef.current);
      markersRef.current.push(marker);
    });
  }, [mapReady, villages, locale, layersActive.villages, layersActive.safety, onMarkerClick]);

  // Show info window for selected marker
  const showInfoWindow = useCallback(
    (AMap: any, v: Village) => {
      if (!mapInstanceRef.current) return;
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      const vsi = v.highlights.vsi;
      const content = `
      <div style="padding:12px;min-width:200px;font-family:system-ui,-apple-system,sans-serif;">
        <div style="font-size:14px;font-weight:700;margin-bottom:4px;">${locale === "zh" ? v.name : v.nameEn}</div>
        <div style="font-size:10px;color:#888;margin-bottom:8px;">${v.latitude.toFixed(4)}°N, ${v.longitude.toFixed(4)}°E</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px;margin-bottom:8px;">
          <div>🛡️ VSI: <b style="color:${vsi >= 90 ? "#059669" : "#d97706"}">${vsi}</b></div>
          <div>⛰️ ${v.elevation ?? "--"}m</div>
          ${v.terrain ? `<div>🌍 ${locale === "zh" ? v.terrain : v.terrain}</div>` : ""}
        </div>
        <div style="font-size:11px;color:#666;line-height:1.4;">${locale === "zh" ? v.description.slice(0, 60) + "..." : (v.descEn || "").slice(0, 80) + "..."}</div>
      </div>
    `;

      const infoWindow = new AMap.InfoWindow({
        content,
        offset: new AMap.Pixel(0, -45),
        isCustom: false,
      });

      infoWindow.open(mapInstanceRef.current, [v.longitude, v.latitude]);
      infoWindowRef.current = infoWindow;

      mapInstanceRef.current.setCenter([v.longitude, v.latitude]);
    },
    [locale]
  );

  // Handle selectedMarker change from outside
  useEffect(() => {
    if (!mapReady || !selectedMarker) return;
    const AMap = window.AMap;
    if (!AMap) return;

    const village = villages.find((v) => v.id === selectedMarker);
    if (village) {
      showInfoWindow(AMap, village);
    }
  }, [selectedMarker, mapReady, villages, showInfoWindow]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50 dark:bg-red-900/20 rounded-2xl">
        <div className="text-center p-8">
          <div className="text-3xl mb-3">🗺️</div>
          <div className="text-sm font-medium text-red-600 dark:text-red-400">
            {loadError}
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            请检查 NEXT_PUBLIC_AMAP_JS_KEY 配置
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-2xl" />
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-emerald-50/80 dark:bg-emerald-900/30 rounded-2xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
            <div className="text-sm text-emerald-700 dark:text-emerald-300">
              加载高德地图...
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
