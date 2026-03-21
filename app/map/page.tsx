"use client";

import { useState, useEffect, useCallback } from "react";
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
  const hasAmapKey = !!process.env.NEXT_PUBLIC_AMAP_JS_KEY;
  const [liveWeather, setLiveWeather] = useState<{ weather: string; temperature: string; humidity: string; winddirection: string; windpower: string } | null>(null);
  const [poiSearchResults, setPoiSearchResults] = useState<{ name: string; type: string; distance?: string; location: string }[]>([]);
  const [mapInstance, setMapInstance] = useState<unknown>(null);

  // 村落标记数据 → AmapContainer markers
  const villageMarkers: AmapMarkerData[] = allVillages.map((v) => ({
    id: v.id,
    name: locale === "zh" ? v.name : v.nameEn,
    lng: v.longitude,
    lat: v.latitude,
    label: locale === "zh" ? v.name : v.nameEn,
    infoContent: `<div style="padding:8px;min-width:180px">
      <div style="font-weight:bold;margin-bottom:4px">${locale === "zh" ? v.name : v.nameEn}</div>
      <div style="font-size:12px;color:#666;margin-bottom:6px">${v.location} · VSI: ${v.highlights.vsi}</div>
      <div style="font-size:11px;color:#888">${v.latitude.toFixed(4)}°N, ${v.longitude.toFixed(4)}°E · ${v.elevation ?? "--"}m</div>
    </div>`,
  }));

  // 获取实时天气（通过后端代理）
  useEffect(() => {
    fetch("/api/map?action=weather&city=441802")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data?.live) setLiveWeather(d.data.live); })
      .catch(() => {});
  }, []);

  // POI 搜索（通过后端代理，避免前端暴露 key）
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setPoiSearchResults([]); return; }
    const timer = setTimeout(() => {
      fetch(`/api/map?action=poi&keywords=${encodeURIComponent(searchQuery)}&city=清远`)
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
                  {hasAmapKey ? (
                    <AmapContainer
                      className="w-full h-full"
                      style={{ width: "100%", height: "100%" }}
                      center={[113.06, 23.68]}
                      zoom={10}
                      markers={villageMarkers}
                      showGeolocation
                      onMapReady={(map) => setMapInstance(map)}
                      onMarkerClick={(marker) => setSelectedMarker(marker.id)}
                      onLocationSuccess={(lng, lat, addr) => {
                        setUserLocation({ lat, lng });
                        setNearbyList(getNearbyVillages(lat, lng, 300));
                      }}
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
                            <button key={`${poi.name}-${idx}`} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left border-b border-border last:border-0" onClick={() => setShowPOI(false)}>
                              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{poi.name}</div>
                                <div className="text-xs text-muted-foreground">{poi.type}{poi.distance ? ` · ${poi.distance}m` : ""}</div>
                              </div>
                              <Navigation className="h-3 w-3 text-muted-foreground" />
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
                        <span className="text-sm font-medium">{liveWeather ? (locale === "zh" ? "清远市" : "Qingyuan") : weatherData.location}</span>
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
                  {!hasAmapKey && (
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
                </h3>
                <div className="flex gap-2">
                  {weatherData.forecast.map((day) => (
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
