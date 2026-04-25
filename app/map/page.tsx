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
import dynamic from "next/dynamic";

const AmapContainer = dynamic(() => import("@/components/amap-container"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-emerald-50/80 dark:bg-emerald-900/30 rounded-2xl">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-3 border-emerald-600 border-t-transparent rounded-full mx-auto mb-3" />
        <div className="text-sm text-emerald-700 dark:text-emerald-300">加载地图组件...</div>
      </div>
    </div>
  ),
});

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
                <div className="relative h-[600px]">
                  <AmapContainer
                    villages={allVillages}
                    selectedMarker={selectedMarker}
                    onMarkerClick={(id) => setSelectedMarker(id === selectedMarker ? null : id)}
                    locale={locale}
                    layersActive={Object.fromEntries(layers.map(l => [l.id, l.active]))}
                  />

                  {/* Search overlay */}
                  <div className="absolute top-4 left-4 right-16 z-10">
                    <div className="relative max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setShowPOI(e.target.value.length > 0); }}
                        placeholder={locale === "zh" ? "搜索地点、POI..." : "Search places, POI..."}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-border text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                      />
                      {showPOI && (
                        <motion.div
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute top-full mt-2 w-full bg-white dark:bg-gray-900 border border-border rounded-xl shadow-xl overflow-hidden z-20"
                        >
                          {poiResults.map((poi) => (
                            <button key={poi.name} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-left border-b border-border last:border-0" onClick={() => setShowPOI(false)}>
                              <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{locale === "zh" ? poi.name : poi.nameEn}</div>
                                <div className="text-xs text-muted-foreground">{locale === "zh" ? poi.type : poi.typeEn} · {poi.distance}</div>
                              </div>
                              <Navigation className="h-3 w-3 text-muted-foreground" />
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Weather overlay */}
                  {layers.find(l => l.id === "weather")?.active && (
                    <div className="absolute bottom-4 left-4 z-10 bg-white/90 dark:bg-black/70 backdrop-blur-sm rounded-xl p-3 shadow-lg border border-border">
                      <div className="flex items-center gap-2 mb-1">
                        <Cloud className="h-4 w-4 text-sky-500" />
                        <span className="text-sm font-medium">{weatherData.location}</span>
                        <span className="text-lg">{locale === "zh" ? weatherData.condition === "多云" ? "⛅" : "☀️" : "⛅"}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-xs">
                        <div className="flex items-center gap-1"><Thermometer className="h-3 w-3 text-red-400" />{weatherData.temp}</div>
                        <div className="flex items-center gap-1"><Droplets className="h-3 w-3 text-blue-400" />{weatherData.humidity}</div>
                        <div className="flex items-center gap-1"><Wind className="h-3 w-3 text-gray-400" />{locale === "zh" ? "3级" : "L3"}</div>
                      </div>
                    </div>
                  )}

                  {/* Geolocation button */}
                  <button
                    onClick={requestLocation}
                    disabled={locating}
                    className="absolute top-4 right-4 h-10 w-10 rounded-xl bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-border shadow-lg flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors z-10"
                    aria-label={locale === "zh" ? "定位" : "Locate me"}
                  >
                    <Locate className={`h-4.5 w-4.5 ${locating ? "animate-spin text-emerald-500" : userLocation ? "text-emerald-600" : "text-muted-foreground"}`} />
                  </button>
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
