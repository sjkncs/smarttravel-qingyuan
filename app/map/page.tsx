"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Layers, Cloud, Shield, Search, Navigation, Thermometer, Wind,
  Eye, Droplets, AlertTriangle, CheckCircle, Locate, Mountain, ArrowRight,
  Route, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/page-header";
import Footer from "@/components/footer";
import { useI18n } from "@/lib/i18n";
import { getVillages, getNearbyVillages, haversineDistance, getElevationProfile } from "@/lib/data/villages";
import type { Village, ElevationPoint } from "@/lib/data/villages";
import ElevationProfile from "@/components/elevation-profile";
import AmapContainer from "@/components/amap-container";
import type { AmapMarkerData } from "@/components/amap-container";

const mapLayers = [
  { id: "villages", label: "村落标注", labelEn: "Villages", icon: MapPin, color: "emerald", active: true },
  { id: "poi", label: "POI兴趣点", labelEn: "POI Points", icon: Search, color: "sky", active: true },
  { id: "weather", label: "天气覆盖", labelEn: "Weather", icon: Cloud, color: "amber", active: true },
  { id: "traffic", label: "路况信息", labelEn: "Traffic", icon: Navigation, color: "red", active: false },
  { id: "heatmap", label: "人流热力", labelEn: "Heatmap", icon: Eye, color: "orange", active: false },
  { id: "safety", label: "安全指数", labelEn: "Safety Index", icon: Shield, color: "green", active: true },
  { id: "terrain", label: "地形图层", labelEn: "Terrain", icon: Layers, color: "stone", active: false },
  { id: "elevation", label: "海拔剖面", labelEn: "Elevation", icon: Mountain, color: "violet", active: false },
];

const weatherData = {
  location: "清远市",
  temp: "26°C",
  humidity: "72%",
  wind: "东南风 3级",
  windEn: "SE Wind Level 3",
  condition: "多云",
  conditionEn: "Cloudy",
  aqi: 42,
  forecast: [
    { day: "今天", dayEn: "Today", temp: "26°C", icon: "⛅" },
    { day: "明天", dayEn: "Tomorrow", temp: "28°C", icon: "☀️" },
    { day: "后天", dayEn: "Day 3", temp: "24°C", icon: "⛈" },
  ],
};

const terrainLabels: Record<string, { zh: string; en: string; icon: string }> = {
  mountain: { zh: "山地", en: "Mountain", icon: "⛰️" },
  hill: { zh: "丘陵", en: "Hill", icon: "🌿" },
  plain: { zh: "平原", en: "Plain", icon: "🌾" },
  valley: { zh: "谷地", en: "Valley", icon: "🌄" },
};

const poiResults = [
  { name: "瑶族博物馆", nameEn: "Yao Museum", type: "文化", typeEn: "Culture", distance: "0.8km" },
  { name: "峰林温泉度假村", nameEn: "Fenglin Hot Springs", type: "休闲", typeEn: "Leisure", distance: "1.2km" },
  { name: "瑶山农家菜馆", nameEn: "Yaoshan Restaurant", type: "餐饮", typeEn: "Dining", distance: "0.5km" },
  { name: "古寨停车场", nameEn: "Village Parking", type: "交通", typeEn: "Transport", distance: "0.3km" },
];

export default function MapPage() {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [layers, setLayers] = useState(mapLayers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [showPOI, setShowPOI] = useState(false);

  // GIS state
  const allVillages = getVillages();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [nearbyList, setNearbyList] = useState<(Village & { distance: number })[]>([]);
  const [elevFrom, setElevFrom] = useState<string>("");
  const [elevTo, setElevTo] = useState<string>("");
  const [elevData, setElevData] = useState<ElevationPoint[]>([]);
  const [elevStats, setElevStats] = useState<{ maxElevation: number; minElevation: number; totalDistance: number; elevationGain: number } | null>(null);

  // Amap state
  const [amapAvailable, setAmapAvailable] = useState(!!process.env.NEXT_PUBLIC_AMAP_JS_KEY);
  const [liveWeather, setLiveWeather] = useState<{ weather: string; temperature: string; humidity: string; winddirection: string; windpower: string } | null>(null);
  const [poiSearchResults, setPoiSearchResults] = useState<{ name: string; type: string; distance?: string; location: string }[]>([]);
  const mapRef = useRef<AMap.Map | null>(null);
  const trafficLayerRef = useRef<AMap.TileLayer.Traffic | null>(null);
  const satelliteLayerRef = useRef<AMap.TileLayer.Satellite | null>(null);
  const heatmapRef = useRef<AMap.HeatMap | null>(null);
  const safetyMarkersRef = useRef<AMap.CircleMarker[]>([]);

  // ── 选中地点详情 ──
  type PlaceDetail = {
    name: string;
    address: string;
    lng: number;
    lat: number;
    province: string;
    city: string;
    district: string;
    adcode?: string;
    weather?: { weather: string; temperature: string; humidity: string; winddirection: string; windpower: string };
    nearbyPOI: { name: string; type: string; distance?: string; address: string; category: string }[];
    route?: { distance: string; duration: string; strategy?: string };
    loading: boolean;
  };
  const [placeDetail, setPlaceDetail] = useState<PlaceDetail | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);

  // 村落标记数据 → AmapContainer markers
  const villageMarkers: AmapMarkerData[] = allVillages.map((v) => {
    const vsi = v.highlights.vsi;
    const vsiColor = vsi >= 90 ? "#059669" : vsi >= 80 ? "#d97706" : "#dc2626";
    const vsiLabel = vsi >= 90 ? "安全" : vsi >= 80 ? "注意" : "警告";
    const terrainInfo = v.terrain ? terrainLabels[v.terrain] : null;
    return {
      id: v.id,
      name: locale === "zh" ? v.name : v.nameEn,
      lng: v.longitude,
      lat: v.latitude,
      label: locale === "zh" ? v.name : v.nameEn,
      infoContent: `<div style="padding:12px;min-width:220px;font-family:system-ui,sans-serif">
        <div style="font-weight:700;font-size:15px;margin-bottom:6px">${locale === "zh" ? v.name : v.nameEn}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
          <span style="background:${vsiColor};color:#fff;font-size:11px;padding:2px 8px;border-radius:10px;font-weight:600">VSI ${vsi} · ${vsiLabel}</span>
          ${terrainInfo ? `<span style="font-size:12px">${terrainInfo.icon} ${locale === "zh" ? terrainInfo.zh : terrainInfo.en}</span>` : ""}
        </div>
        <div style="font-size:12px;color:#666;margin-bottom:4px">📍 ${v.location}</div>
        <div style="font-size:11px;color:#999;margin-bottom:8px">
          ${v.latitude.toFixed(4)}°N, ${v.longitude.toFixed(4)}°E · 🏔 ${v.elevation ?? "--"}m
        </div>
        <div style="display:flex;gap:6px">
          <a href="/villages/${v.id}" style="flex:1;text-align:center;padding:6px 0;background:#059669;color:#fff;border-radius:8px;font-size:12px;text-decoration:none;font-weight:600">查看详情</a>
          <a href="/planner?village=${v.id}" style="flex:1;text-align:center;padding:6px 0;background:#f0fdf4;color:#059669;border:1px solid #059669;border-radius:8px;font-size:12px;text-decoration:none;font-weight:600">规划路线</a>
        </div>
      </div>`,
    };
  });

  // 获取实时天气 + 预报（通过后端代理）— 动态跟随选中地区
  const [liveForecast, setLiveForecast] = useState<{ date: string; dayweather: string; nightweather: string; daytemp: string; nighttemp: string }[]>([]);
  const [weatherCity, setWeatherCity] = useState("441802"); // 默认清远清城区
  const [weatherCityName, setWeatherCityName] = useState("清远市");
  const fetchWeatherForCity = useCallback((adcode: string, cityName?: string) => {
    setWeatherCity(adcode);
    if (cityName) setWeatherCityName(cityName);
    fetch(`/api/map?action=weather&city=${adcode}`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data?.live) setLiveWeather(d.data.live); })
      .catch(() => {});
    fetch(`/api/map?action=weather&city=${adcode}&type=all`)
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data?.forecasts) setLiveForecast(d.data.forecasts.slice(0, 3)); })
      .catch(() => {});
  }, []);
  useEffect(() => { fetchWeatherForCity("441802", "清远市"); }, [fetchWeatherForCity]);

  // ── 点击地图/搜索结果 → 获取地点详情 ──
  const fetchPlaceDetail = useCallback(async (lng: number, lat: number) => {
    setPlaceLoading(true);
    setPlaceDetail({ name: "加载中...", address: "", lng, lat, province: "", city: "", district: "", nearbyPOI: [], loading: true });
    try {
      // 1. 逆地理编码
      const regeoRes = await fetch(`/api/map?action=regeo&lng=${lng}&lat=${lat}`).then((r) => r.json());
      const geo = regeoRes.data || {};
      const placeName = geo.district || geo.city || geo.province || geo.formatted_address || "未知地点";
      const adcode = geo.adcode || weatherCity;

      // 2. 并行获取：天气 + 附近餐饮 + 附近酒店 + 附近景点 + 驾车路线
      const loc = `${lng},${lat}`;
      const [weatherRes, foodRes, hotelRes, scenicRes, routeRes] = await Promise.allSettled([
        fetch(`/api/map?action=weather&city=${adcode}`).then((r) => r.json()),
        fetch(`/api/map?action=nearby&lng=${lng}&lat=${lat}&types=050000&radius=5000`).then((r) => r.json()),
        fetch(`/api/map?action=nearby&lng=${lng}&lat=${lat}&types=100000&radius=5000`).then((r) => r.json()),
        fetch(`/api/map?action=nearby&lng=${lng}&lat=${lat}&types=110000&radius=5000`).then((r) => r.json()),
        userLocation
          ? fetch(`/api/map?action=driving&olng=${userLocation.lng}&olat=${userLocation.lat}&dlng=${lng}&dlat=${lat}`).then((r) => r.json())
          : Promise.resolve(null),
      ]);

      const weather = weatherRes.status === "fulfilled" && weatherRes.value?.data?.live ? weatherRes.value.data.live : undefined;
      const foods = foodRes.status === "fulfilled" && foodRes.value?.data ? foodRes.value.data.slice(0, 3) : [];
      const hotels = hotelRes.status === "fulfilled" && hotelRes.value?.data ? hotelRes.value.data.slice(0, 3) : [];
      const scenics = scenicRes.status === "fulfilled" && scenicRes.value?.data ? scenicRes.value.data.slice(0, 3) : [];
      const route = routeRes.status === "fulfilled" && routeRes.value?.data ? routeRes.value.data : null;

      const nearbyPOI = [
        ...foods.map((p: { name: string; type: string; distance?: string; address?: string }) => ({ ...p, address: p.address || "", category: "餐饮" })),
        ...hotels.map((p: { name: string; type: string; distance?: string; address?: string }) => ({ ...p, address: p.address || "", category: "住宿" })),
        ...scenics.map((p: { name: string; type: string; distance?: string; address?: string }) => ({ ...p, address: p.address || "", category: "景点" })),
      ];

      setPlaceDetail({
        name: placeName,
        address: geo.formatted_address || "",
        lng, lat,
        province: geo.province || "",
        city: geo.city || "",
        district: geo.district || "",
        adcode,
        weather,
        nearbyPOI,
        route: route ? { distance: route.distance, duration: route.duration } : undefined,
        loading: false,
      });

      // 同步更新天气面板到该地区
      fetchWeatherForCity(adcode, geo.city || geo.district || placeName);
    } catch {
      setPlaceDetail(null);
    }
    setPlaceLoading(false);
  }, [userLocation, weatherCity, fetchWeatherForCity]);

  // ── 地图点击处理 ──
  const handleMapClick = useCallback((lng: number, lat: number) => {
    // 移动地图到点击位置
    mapRef.current?.setCenter([lng, lat]);
    mapRef.current?.setZoom(13);
    fetchPlaceDetail(lng, lat);
  }, [fetchPlaceDetail]);

  // ── 搜索结果点击 → 自动定位 + 获取详情 ──
  const handlePOIClick = useCallback((poi: { name: string; location: string }) => {
    setShowPOI(false);
    setSearchQuery(poi.name);
    if (poi.location) {
      const [lng, lat] = poi.location.split(",").map(Number);
      if (!isNaN(lng) && !isNaN(lat)) {
        mapRef.current?.setCenter([lng, lat]);
        mapRef.current?.setZoom(15);
        fetchPlaceDetail(lng, lat);
      }
    }
  }, [fetchPlaceDetail]);

  // POI 搜索（通过后端代理，避免前端暴露 key）
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setPoiSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/map?action=poi&keywords=${encodeURIComponent(searchQuery)}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.data?.pois) {
            setPoiSearchResults(d.data.pois.slice(0, 6).map((p: { name: string; type: string; distance?: string; location: string }) => ({
              name: p.name, type: p.type, distance: p.distance, location: p.location,
            })));
          }
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, active: !l.active } : l));
  };

  const activeCount = layers.filter((l) => l.active).length;

  // ── 图层联动：监听 layers 变化，同步到 Amap 实例 ──
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !window.AMap) return;

    const isActive = (id: string) => layers.find((l) => l.id === id)?.active ?? false;

    // 路况信息
    if (isActive("traffic")) {
      if (!trafficLayerRef.current) {
        trafficLayerRef.current = new window.AMap.TileLayer.Traffic({ autoRefresh: true, interval: 180 });
        trafficLayerRef.current.setMap(map);
      }
      trafficLayerRef.current.show();
    } else {
      trafficLayerRef.current?.hide();
    }

    // 卫星/地形图层
    if (isActive("terrain")) {
      if (!satelliteLayerRef.current) {
        satelliteLayerRef.current = new window.AMap.TileLayer.Satellite();
        satelliteLayerRef.current.setMap(map);
      }
      satelliteLayerRef.current.show();
    } else {
      satelliteLayerRef.current?.hide();
    }

    // 人流热力图（用村落数据模拟热力点）
    if (isActive("heatmap")) {
      if (!heatmapRef.current) {
        heatmapRef.current = new window.AMap.HeatMap(map, {
          radius: 35,
          opacity: [0, 0.8],
          gradient: { 0.4: "blue", 0.6: "cyan", 0.7: "lime", 0.9: "yellow", 1.0: "red" },
        });
        const heatData = allVillages.map((v) => ({
          lng: v.longitude,
          lat: v.latitude,
          count: Math.round(v.highlights.vsi * (Math.random() * 0.5 + 0.75)),
        }));
        heatmapRef.current.setDataSet({ data: heatData, max: 100 });
      }
      heatmapRef.current.show();
    } else {
      heatmapRef.current?.hide();
    }

    // 安全指数（VSI 彩色圆圈覆盖）
    if (isActive("safety")) {
      if (safetyMarkersRef.current.length === 0) {
        allVillages.forEach((v) => {
          const vsi = v.highlights.vsi;
          const color = vsi >= 90 ? "#059669" : vsi >= 80 ? "#d97706" : "#dc2626";
          const cm = new window.AMap.CircleMarker({
            center: [v.longitude, v.latitude],
            radius: 18,
            strokeColor: color,
            strokeWeight: 2,
            strokeOpacity: 0.8,
            fillColor: color,
            fillOpacity: 0.25,
            zIndex: 5,
          });
          cm.setMap(map);
          safetyMarkersRef.current.push(cm);
        });
      }
      safetyMarkersRef.current.forEach((cm) => cm.show());
    } else {
      safetyMarkersRef.current.forEach((cm) => cm.hide());
    }

    // 地图样式：地形开启时用卫星样式，否则恢复白色
    if (isActive("terrain")) {
      map.setMapStyle("amap://styles/normal");
    } else {
      map.setMapStyle("amap://styles/whitesmoke");
    }
  }, [layers, allVillages]);

  // Geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        setNearbyList(getNearbyVillages(loc.lat, loc.lng, 300));
        setLocating(false);
      },
      () => {
        // Default to Qingyuan city center if geolocation fails
        const fallback = { lat: 23.68, lng: 113.06 };
        setUserLocation(fallback);
        setNearbyList(getNearbyVillages(fallback.lat, fallback.lng, 300));
        setLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  }, []);

  // Elevation profile
  const loadElevation = useCallback(() => {
    if (!elevFrom || !elevTo || elevFrom === elevTo) return;
    const profile = getElevationProfile(elevFrom, elevTo);
    setElevData(profile);
    if (profile.length > 0) {
      const maxE = Math.max(...profile.map((p) => p.elevation));
      const minE = Math.min(...profile.map((p) => p.elevation));
      const totalD = profile[profile.length - 1]?.distance || 0;
      const gain = profile.reduce((acc, p, i) => {
        if (i === 0) return 0;
        const diff = p.elevation - profile[i - 1].elevation;
        return acc + (diff > 0 ? diff : 0);
      }, 0);
      setElevStats({ maxElevation: maxE, minElevation: minE, totalDistance: totalD, elevationGain: gain });
    }
  }, [elevFrom, elevTo]);

  useEffect(() => { loadElevation(); }, [loadElevation]);

  return (
    <main className="flex flex-col min-h-dvh">
      <PageHeader
        title={t("page.map.title")}
        description={t("page.map.desc")}
        gradient="from-amber-500 to-orange-500"
      />

      <section className="flex-1 py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm overflow-hidden">
                <div className="relative h-[500px]">
                  {/* 高德地图实例 — 有 Key 时渲染真实地图，否则 fallback SVG */}
                  {amapAvailable ? (
                    <AmapContainer
                      className="w-full h-full"
                      style={{ width: "100%", height: "100%" }}
                      center={[113.06, 23.68]}
                      zoom={10}
                      markers={villageMarkers}
                      showGeolocation
                      onMapReady={(map) => { mapRef.current = map; }}
                      onMarkerClick={(marker) => setSelectedMarker(marker.id)}
                      onMapClick={handleMapClick}
                      onLocationSuccess={(lng, lat, addr) => {
                        setUserLocation({ lat, lng });
                        setNearbyList(getNearbyVillages(lat, lng, 300));
                      }}
                      onError={() => setAmapAvailable(false)}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-100 via-emerald-50 to-sky-50 dark:from-emerald-900/30 dark:via-emerald-800/20 dark:to-sky-900/20 flex items-center justify-center">
                      <div className="relative w-full h-full">
                        <svg viewBox="0 0 800 500" className="w-full h-full opacity-20">
                          <path d="M100,200 Q200,100 300,180 Q400,260 500,150 Q600,40 700,120" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-600" />
                          <path d="M50,300 Q150,250 250,320 Q350,390 450,280 Q550,170 650,250 Q750,330 800,290" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400" />
                          <path d="M0,400 Q100,350 200,380 Q300,410 400,360 Q500,310 600,370 Q700,430 800,390" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-300" />
                        </svg>
                        {allVillages.map((v) => {
                          const x = ((v.longitude - 112) * 400 + 100);
                          const y = ((25 - v.latitude) * 400 + 50);
                          const vsi = v.highlights.vsi;
                          const status = vsi >= 85 ? "safe" : "caution";
                          return (
                            <motion.div
                              key={v.id}
                              className="absolute cursor-pointer"
                              style={{ left: `${Math.min(Math.max(x / 8, 5), 90)}%`, top: `${Math.min(Math.max(y / 5, 10), 85)}%` }}
                              whileHover={{ scale: 1.2 }}
                              onClick={() => setSelectedMarker(selectedMarker === v.id ? null : v.id)}
                            >
                              <div className={`flex flex-col items-center ${selectedMarker === v.id ? "z-20" : "z-10"}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center shadow-lg ${status === "safe" ? "bg-emerald-600" : "bg-amber-500"}`}>
                                  <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div className="mt-1 px-2 py-0.5 rounded bg-white/90 dark:bg-black/70 backdrop-blur-sm text-xs font-medium whitespace-nowrap shadow-sm">
                                  {locale === "zh" ? v.name : v.nameEn}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 搜索框覆盖层 */}
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowPOI(e.target.value.length > 0); }}
                        placeholder={locale === "zh" ? "搜索地点、POI..." : "Search places, POI..."}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-border text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      {showPOI && (poiSearchResults.length > 0 || poiResults.length > 0) && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-border rounded-xl shadow-xl overflow-hidden z-20"
                        >
                          {(poiSearchResults.length > 0 ? poiSearchResults : poiResults).map((poi, idx) => (
                            <button key={`${poi.name}-${idx}`} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left border-b border-border last:border-0" onClick={() => handlePOIClick(poi as { name: string; location: string })}>
                              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{poi.name}</div>
                                <div className="text-xs text-muted-foreground">{poi.type}{poi.distance ? ` · ${poi.distance}m` : ""}</div>
                              </div>
                              <Navigation className="h-3 w-3 text-emerald-600" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* 天气覆盖层 — 优先使用高德实时天气数据 */}
                  {layers.find(l => l.id === "weather")?.active && (
                    <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border z-10">
                      <div className="flex items-center gap-2 mb-1">
                        <Cloud className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-medium">{liveWeather ? weatherCityName : weatherData.location}</span>
                        <span className="text-lg">{liveWeather ? (liveWeather.weather.includes("晴") ? "☀️" : liveWeather.weather.includes("雨") ? "🌧" : "⛅") : "⛅"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-red-400" />{liveWeather ? `${liveWeather.temperature}°C` : weatherData.temp}</div>
                        <div className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-400" />{liveWeather ? `${liveWeather.humidity}%` : weatherData.humidity}</div>
                        <div className="flex items-center gap-1"><Wind className="h-3 w-3 text-gray-400" />{liveWeather ? `${liveWeather.winddirection}${liveWeather.windpower}级` : (locale === "zh" ? "3级" : "L3")}</div>
                      </div>
                      {liveWeather && <div className="text-[10px] text-emerald-600 mt-1 font-medium">● {locale === "zh" ? "高德实时数据" : "Amap Live"}</div>}
                    </div>
                  )}

                  {/* 定位按钮（无高德 Key 时 fallback） */}
                  {!amapAvailable && (
                    <button
                      onClick={requestLocation}
                      disabled={locating}
                      className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors z-10"
                      aria-label={locale === "zh" ? "定位" : "Locate me"}
                    >
                      <Locate className={`h-4.5 w-4.5 ${locating ? "animate-spin text-emerald-500" : userLocation ? "text-emerald-600" : "text-muted-foreground"}`} />
                    </button>
                  )}

                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground bg-white/70 dark:bg-black/50 px-2 py-1 rounded z-10">
                    {userLocation
                      ? `${userLocation.lat.toFixed(2)}°N, ${userLocation.lng.toFixed(2)}°E`
                      : (locale === "zh" ? "高德地图 · GIS增强" : "Amap · GIS Enhanced")
                    }
                  </div>
                </div>
              </div>

              {/* ── 地点详情面板 ── */}
              <AnimatePresence>
                {placeDetail && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-card/80 backdrop-blur-sm overflow-hidden mt-4"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                            {placeDetail.name}
                          </h3>
                          {placeDetail.address && (
                            <p className="text-xs text-muted-foreground mt-1">📍 {placeDetail.address}</p>
                          )}
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {placeDetail.lat.toFixed(4)}°N, {placeDetail.lng.toFixed(4)}°E
                          </p>
                        </div>
                        <button onClick={() => setPlaceDetail(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
                          <span className="text-muted-foreground text-lg leading-none">&times;</span>
                        </button>
                      </div>

                      {placeDetail.loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <span className="ml-2 text-sm text-muted-foreground">正在获取当地信息...</span>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* 当地天气 */}
                          {placeDetail.weather && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800">
                              <span className="text-2xl">
                                {placeDetail.weather.weather.includes("晴") ? "☀️" : placeDetail.weather.weather.includes("雨") ? "🌧" : placeDetail.weather.weather.includes("阴") ? "☁️" : "⛅"}
                              </span>
                              <div className="flex-1">
                                <div className="text-sm font-semibold">{placeDetail.weather.weather} {placeDetail.weather.temperature}°C</div>
                                <div className="text-xs text-muted-foreground">
                                  湿度 {placeDetail.weather.humidity}% · {placeDetail.weather.winddirection}风{placeDetail.weather.windpower}级
                                </div>
                              </div>
                              <Cloud className="h-4 w-4 text-sky-500" />
                            </div>
                          )}

                          {/* 驾车路线 */}
                          {placeDetail.route && (
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                              <Route className="h-5 w-5 text-emerald-600" />
                              <div className="flex-1">
                                <div className="text-sm font-semibold">
                                  驾车 {(Number(placeDetail.route.distance) / 1000).toFixed(1)}km · 约{Math.round(Number(placeDetail.route.duration) / 60)}分钟
                                </div>
                                <div className="text-xs text-muted-foreground">从当前位置出发 · 实时路线规划</div>
                              </div>
                              <Navigation className="h-4 w-4 text-emerald-500" />
                            </div>
                          )}

                          {/* 附近推荐 */}
                          {placeDetail.nearbyPOI.length > 0 && (
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                                <Search className="h-3.5 w-3.5 text-amber-500" />
                                附近推荐
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {["餐饮", "住宿", "景点"].map((cat) => {
                                  const items = placeDetail.nearbyPOI.filter((p) => p.category === cat);
                                  if (items.length === 0) return null;
                                  const catIcon = cat === "餐饮" ? "🍽️" : cat === "住宿" ? "🏨" : "🎯";
                                  const catColor = cat === "餐饮" ? "text-orange-600" : cat === "住宿" ? "text-blue-600" : "text-purple-600";
                                  return (
                                    <div key={cat} className="p-2.5 rounded-lg bg-muted/50 border border-border">
                                      <div className={`text-xs font-semibold mb-1.5 ${catColor}`}>{catIcon} {cat}</div>
                                      {items.map((p, i) => (
                                        <div key={`${p.name}-${i}`} className="text-xs mb-1 last:mb-0">
                                          <div className="font-medium truncate">{p.name}</div>
                                          {p.distance && <span className="text-muted-foreground">{(Number(p.distance) / 1000).toFixed(1)}km</span>}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {placeDetail.nearbyPOI.length === 0 && !placeDetail.route && !placeDetail.weather && (
                            <p className="text-xs text-muted-foreground text-center py-4">该地点暂无详细信息</p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-emerald-600" />
                  {locale === "zh" ? `图层控制 (${activeCount}/16)` : `Layers (${activeCount}/16)`}
                </h3>
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <button
                      key={layer.id}
                      onClick={() => toggleLayer(layer.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                        layer.active
                          ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-foreground"
                          : "bg-card border border-border text-muted-foreground hover:border-emerald-300 dark:hover:border-emerald-700"
                      }`}
                    >
                      <layer.icon className={`h-3.5 w-3.5 ${layer.active ? "text-emerald-600" : ""}`} />
                      <span className="flex-1 text-left text-xs">{locale === "zh" ? layer.label : layer.labelEn}</span>
                      <div className={`h-4 w-8 rounded-full transition-colors ${layer.active ? "bg-emerald-600" : "bg-muted"}`}>
                        <div className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${layer.active ? "translate-x-4" : "translate-x-0"}`}></div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Cloud className="h-4 w-4 text-sky-500" />
                  {locale === "zh" ? "天气预报" : "Weather"}
                  {liveForecast.length > 0 && <span className="text-[10px] text-emerald-600 font-medium ml-auto">● 实时</span>}
                </h3>
                <div className="flex gap-2">
                  {liveForecast.length > 0 ? liveForecast.map((day, i) => {
                    const w = day.dayweather;
                    const icon = w.includes("晴") ? "☀️" : w.includes("雨") ? "🌧" : w.includes("阴") ? "☁️" : "⛅";
                    const label = i === 0 ? (locale === "zh" ? "今天" : "Today") : i === 1 ? (locale === "zh" ? "明天" : "Tomorrow") : (locale === "zh" ? "后天" : "Day 3");
                    return (
                      <div key={day.date} className="flex-1 text-center p-2 rounded-lg bg-card border border-border">
                        <div className="text-xs text-muted-foreground">{label}</div>
                        <div className="text-xl my-1">{icon}</div>
                        <div className="text-xs font-medium">{day.daytemp}°C</div>
                      </div>
                    );
                  }) : weatherData.forecast.map((day) => (
                    <div key={day.day} className="flex-1 text-center p-2 rounded-lg bg-card border border-border">
                      <div className="text-xs text-muted-foreground">{locale === "zh" ? day.day : day.dayEn}</div>
                      <div className="text-xl my-1">{day.icon}</div>
                      <div className="text-xs font-medium">{day.temp}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  {locale === "zh" ? "村落安全指数(VSI)" : "Village Safety Index"}
                </h3>
                <div className="space-y-2">
                  {allVillages.map((v) => (
                    <div key={v.id} className="flex items-center gap-2 text-xs">
                      <span className="flex-1 truncate">{locale === "zh" ? v.name : v.nameEn}</span>
                      <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className={`h-full rounded-full ${v.highlights.vsi >= 90 ? "bg-emerald-500" : v.highlights.vsi >= 80 ? "bg-amber-500" : "bg-red-500"}`} style={{ width: `${v.highlights.vsi}%` }}></div>
                      </div>
                      <span className={`font-bold w-6 text-right ${v.highlights.vsi >= 90 ? "text-emerald-600" : "text-amber-600"}`}>{v.highlights.vsi}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nearby Villages (GIS) */}
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-sky-500" />
                  {locale === "zh" ? "附近村落" : "Nearby Villages"}
                </h3>
                {nearbyList.length > 0 ? (
                  <div className="space-y-2">
                    {nearbyList.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => { setSelectedMarker(v.id); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left"
                      >
                        <span className="text-base">{v.image}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{locale === "zh" ? v.name : v.nameEn}</div>
                          <div className="text-muted-foreground">
                            {v.elevation ?? "--"}m {v.terrain ? (locale === "zh" ? terrainLabels[v.terrain]?.zh : terrainLabels[v.terrain]?.en) : ""}
                          </div>
                        </div>
                        <span className="text-emerald-600 font-bold whitespace-nowrap">{Math.round(v.distance)}km</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <button
                    onClick={requestLocation}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-emerald-300 text-sm text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-colors"
                  >
                    <Locate className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
                    {locating
                      ? (locale === "zh" ? "定位中..." : "Locating...")
                      : (locale === "zh" ? "点击定位查看附近村落" : "Tap to find nearby villages")
                    }
                  </button>
                )}
              </div>

              {/* Elevation Profile Selector (GIS) */}
              <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Mountain className="h-4 w-4 text-violet-500" />
                  {locale === "zh" ? "海拔剖面图" : "Elevation Profile"}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <select
                    value={elevFrom}
                    onChange={(e) => setElevFrom(e.target.value)}
                    title={locale === "zh" ? "选择起点村落" : "Select start village"}
                    aria-label={locale === "zh" ? "选择起点村落" : "Select start village"}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">{locale === "zh" ? "起点" : "From"}</option>
                    {allVillages.map((v) => (
                      <option key={v.id} value={v.id}>{locale === "zh" ? v.name : v.nameEn}</option>
                    ))}
                  </select>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <select
                    value={elevTo}
                    onChange={(e) => setElevTo(e.target.value)}
                    title={locale === "zh" ? "选择终点村落" : "Select end village"}
                    aria-label={locale === "zh" ? "选择终点村落" : "Select end village"}
                    className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-border bg-card focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">{locale === "zh" ? "终点" : "To"}</option>
                    {allVillages.filter((v) => v.id !== elevFrom).map((v) => (
                      <option key={v.id} value={v.id}>{locale === "zh" ? v.name : v.nameEn}</option>
                    ))}
                  </select>
                </div>
                {elevData.length > 0 && elevStats ? (
                  <ElevationProfile data={elevData} stats={elevStats} locale={locale} />
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {locale === "zh" ? "选择起终点查看海拔剖面" : "Select start/end to view elevation"}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
