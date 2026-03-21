// ═══════════════════════════════════════════════════════════
// 高德地图 Web Service — Amap API Service
// 封装地理编码、POI搜索、天气查询、路线规划、IP定位等功能
// ═══════════════════════════════════════════════════════════

const AMAP_KEY = process.env.AMAP_WEB_KEY || "";
const BASE_URL = "https://restapi.amap.com/v3";

// ── 通用请求 ──
async function amapRequest<T = Record<string, unknown>>(
  path: string,
  params: Record<string, string>
): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("key", AMAP_KEY);
  url.searchParams.set("output", "JSON");
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Amap API error: ${res.status}`);
  const data = await res.json();
  if (data.status === "0") throw new Error(`Amap: ${data.info || "unknown error"}`);
  return data as T;
}

// ── 类型定义 ──
export type AmapGeocode = {
  formatted_address: string;
  location: string; // "lng,lat"
  province: string;
  city: string;
  district: string;
  adcode: string;
  level: string;
};

export type AmapPOI = {
  id: string;
  name: string;
  type: string;
  typecode: string;
  address: string;
  location: string; // "lng,lat"
  tel: string;
  distance?: string;
  photos?: { url: string }[];
};

export type AmapWeather = {
  province: string;
  city: string;
  weather: string;
  temperature: string;
  winddirection: string;
  windpower: string;
  humidity: string;
  reporttime: string;
};

export type AmapWeatherForecast = {
  date: string;
  week: string;
  dayweather: string;
  nightweather: string;
  daytemp: string;
  nighttemp: string;
  daywind: string;
  nightwind: string;
  daypower: string;
  nightpower: string;
};

export type AmapRoute = {
  origin: string;
  destination: string;
  distance: string; // meters
  duration: string; // seconds
  strategy: string;
  steps: {
    instruction: string;
    road: string;
    distance: string;
    duration: string;
    polyline: string;
  }[];
};

export type AmapIPLocation = {
  province: string;
  city: string;
  adcode: string;
  rectangle: string; // "lng1,lat1;lng2,lat2"
  center?: { lng: number; lat: number };
};

// ── 1. 地理编码：地址 → 经纬度 ──
export async function geocode(address: string, city?: string): Promise<AmapGeocode[]> {
  const params: Record<string, string> = { address };
  if (city) params.city = city;
  const data = await amapRequest<{ geocodes: AmapGeocode[] }>("/geocode/geo", params);
  return data.geocodes || [];
}

// ── 2. 逆地理编码：经纬度 → 地址 ──
export async function reverseGeocode(
  lng: number,
  lat: number
): Promise<{ formatted_address: string; province: string; city: string; district: string; township: string }> {
  const data = await amapRequest<{ regeocode: { formatted_address: string; addressComponent: Record<string, string> } }>(
    "/geocode/regeo",
    { location: `${lng},${lat}`, extensions: "base" }
  );
  const comp = data.regeocode.addressComponent || {};
  return {
    formatted_address: data.regeocode.formatted_address,
    province: comp.province || "",
    city: comp.city || "",
    district: comp.district || "",
    township: comp.township || "",
  };
}

// ── 3. POI搜索（关键词） ──
export async function searchPOI(
  keywords: string,
  options?: { city?: string; types?: string; page?: number; pageSize?: number; location?: string; radius?: number }
): Promise<{ pois: AmapPOI[]; count: string }> {
  const params: Record<string, string> = { keywords };
  if (options?.city) params.city = options.city;
  if (options?.types) params.types = options.types;
  if (options?.location) params.location = options.location;
  if (options?.radius) params.radius = String(options.radius);
  if (options?.page) params.page = String(options.page);
  params.offset = String(options?.pageSize || 20);
  params.extensions = "all";

  const data = await amapRequest<{ pois: AmapPOI[]; count: string }>("/place/text", params);
  return { pois: data.pois || [], count: data.count || "0" };
}

// ── 4. 周边搜索 ──
export async function searchNearby(
  lng: number,
  lat: number,
  options?: { keywords?: string; types?: string; radius?: number; pageSize?: number }
): Promise<AmapPOI[]> {
  const params: Record<string, string> = {
    location: `${lng},${lat}`,
    radius: String(options?.radius || 3000),
    offset: String(options?.pageSize || 20),
    extensions: "all",
  };
  if (options?.keywords) params.keywords = options.keywords;
  if (options?.types) params.types = options.types;

  const data = await amapRequest<{ pois: AmapPOI[] }>("/place/around", params);
  return data.pois || [];
}

// ── 5. 天气查询 ──
export async function getWeather(
  city: string,
  type: "base" | "all" = "base"
): Promise<{ live?: AmapWeather; forecasts?: AmapWeatherForecast[] }> {
  const params: Record<string, string> = { city, extensions: type };
  const data = await amapRequest<{ lives?: AmapWeather[]; forecasts?: { casts: AmapWeatherForecast[] }[] }>(
    "/weather/weatherInfo",
    params
  );

  if (type === "base") {
    return { live: data.lives?.[0] };
  }
  return { forecasts: data.forecasts?.[0]?.casts || [] };
}

// ── 6. 驾车路线规划 ──
export async function drivingRoute(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number,
  strategy: number = 0
): Promise<AmapRoute | null> {
  const params: Record<string, string> = {
    origin: `${originLng},${originLat}`,
    destination: `${destLng},${destLat}`,
    strategy: String(strategy),
    extensions: "all",
  };
  const data = await amapRequest<{ route: { origin: string; destination: string; paths: AmapRoute[] } }>(
    "/direction/driving",
    params
  );
  const path = data.route?.paths?.[0];
  if (!path) return null;
  return {
    origin: data.route.origin,
    destination: data.route.destination,
    distance: path.distance,
    duration: path.duration,
    strategy: String(strategy),
    steps: (path as unknown as { steps: AmapRoute["steps"] }).steps || [],
  };
}

// ── 7. 步行路线规划 ──
export async function walkingRoute(
  originLng: number,
  originLat: number,
  destLng: number,
  destLat: number
): Promise<AmapRoute | null> {
  const params: Record<string, string> = {
    origin: `${originLng},${originLat}`,
    destination: `${destLng},${destLat}`,
  };
  const data = await amapRequest<{ route: { origin: string; destination: string; paths: AmapRoute[] } }>(
    "/direction/walking",
    params
  );
  const path = data.route?.paths?.[0];
  if (!path) return null;
  return {
    origin: data.route.origin,
    destination: data.route.destination,
    distance: path.distance,
    duration: path.duration,
    strategy: "walk",
    steps: (path as unknown as { steps: AmapRoute["steps"] }).steps || [],
  };
}

// ── 8. IP 定位 ──
export async function ipLocation(ip?: string): Promise<AmapIPLocation> {
  const params: Record<string, string> = {};
  if (ip) params.ip = ip;
  const data = await amapRequest<AmapIPLocation>("/ip", params);
  // Parse center from rectangle
  if (data.rectangle && typeof data.rectangle === "string") {
    const parts = data.rectangle.split(";");
    if (parts.length === 2) {
      const [lng1, lat1] = parts[0].split(",").map(Number);
      const [lng2, lat2] = parts[1].split(",").map(Number);
      data.center = { lng: (lng1 + lng2) / 2, lat: (lat1 + lat2) / 2 };
    }
  }
  return data;
}

// ── 9. 行政区域查询 ──
export async function districtSearch(
  keywords: string,
  options?: { subdistrict?: number; extensions?: "base" | "all" }
): Promise<{ name: string; center: string; level: string; adcode: string; districts?: unknown[] }[]> {
  const params: Record<string, string> = {
    keywords,
    subdistrict: String(options?.subdistrict ?? 1),
    extensions: options?.extensions || "base",
  };
  const data = await amapRequest<{ districts: { name: string; center: string; level: string; adcode: string; districts?: unknown[] }[] }>(
    "/config/district",
    params
  );
  return data.districts || [];
}
