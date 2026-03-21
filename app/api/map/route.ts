// ═══════════════════════════════════════════════════════════
// 高德地图 API 代理路由 — Amap API Proxy
// 统一入口，支持 geocode / poi / weather / route / ip 等操作
// Key 保留在服务端，前端不暴露
// ═══════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
  geocode,
  reverseGeocode,
  searchPOI,
  searchNearby,
  getWeather,
  drivingRoute,
  walkingRoute,
  ipLocation,
} from "@/lib/amap-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    if (!process.env.AMAP_WEB_KEY) {
      return NextResponse.json({ error: "AMAP_WEB_KEY not configured" }, { status: 500 });
    }

    switch (action) {
      // ── 地理编码 ──
      case "geocode": {
        const address = searchParams.get("address");
        if (!address) return NextResponse.json({ error: "address required" }, { status: 400 });
        const results = await geocode(address, searchParams.get("city") || undefined);
        return NextResponse.json({ success: true, data: results });
      }

      // ── 逆地理编码 ──
      case "regeo": {
        const lng = parseFloat(searchParams.get("lng") || "");
        const lat = parseFloat(searchParams.get("lat") || "");
        if (isNaN(lng) || isNaN(lat)) return NextResponse.json({ error: "lng,lat required" }, { status: 400 });
        const result = await reverseGeocode(lng, lat);
        return NextResponse.json({ success: true, data: result });
      }

      // ── POI 关键词搜索 ──
      case "poi": {
        const keywords = searchParams.get("keywords");
        if (!keywords) return NextResponse.json({ error: "keywords required" }, { status: 400 });
        const result = await searchPOI(keywords, {
          city: searchParams.get("city") || undefined,
          types: searchParams.get("types") || undefined,
          location: searchParams.get("location") || undefined,
          radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : undefined,
          page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : 1,
          pageSize: 20,
        });
        return NextResponse.json({ success: true, data: result });
      }

      // ── 周边搜索 ──
      case "nearby": {
        const lng = parseFloat(searchParams.get("lng") || "");
        const lat = parseFloat(searchParams.get("lat") || "");
        if (isNaN(lng) || isNaN(lat)) return NextResponse.json({ error: "lng,lat required" }, { status: 400 });
        const pois = await searchNearby(lng, lat, {
          keywords: searchParams.get("keywords") || undefined,
          types: searchParams.get("types") || undefined,
          radius: searchParams.get("radius") ? parseInt(searchParams.get("radius")!) : 3000,
        });
        return NextResponse.json({ success: true, data: pois });
      }

      // ── 天气 ──
      case "weather": {
        const city = searchParams.get("city") || "441802"; // 清远市清城区 adcode
        const type = (searchParams.get("type") as "base" | "all") || "base";
        const weather = await getWeather(city, type);
        return NextResponse.json({ success: true, data: weather });
      }

      // ── 驾车路线 ──
      case "driving": {
        const oLng = parseFloat(searchParams.get("olng") || "");
        const oLat = parseFloat(searchParams.get("olat") || "");
        const dLng = parseFloat(searchParams.get("dlng") || "");
        const dLat = parseFloat(searchParams.get("dlat") || "");
        if ([oLng, oLat, dLng, dLat].some(isNaN))
          return NextResponse.json({ error: "olng,olat,dlng,dlat required" }, { status: 400 });
        const route = await drivingRoute(oLng, oLat, dLng, dLat);
        return NextResponse.json({ success: true, data: route });
      }

      // ── 步行路线 ──
      case "walking": {
        const oLng = parseFloat(searchParams.get("olng") || "");
        const oLat = parseFloat(searchParams.get("olat") || "");
        const dLng = parseFloat(searchParams.get("dlng") || "");
        const dLat = parseFloat(searchParams.get("dlat") || "");
        if ([oLng, oLat, dLng, dLat].some(isNaN))
          return NextResponse.json({ error: "olng,olat,dlng,dlat required" }, { status: 400 });
        const route = await walkingRoute(oLng, oLat, dLng, dLat);
        return NextResponse.json({ success: true, data: route });
      }

      // ── IP 定位 ──
      case "ip": {
        const ip = searchParams.get("ip") || undefined;
        const loc = await ipLocation(ip);
        return NextResponse.json({ success: true, data: loc });
      }

      default:
        return NextResponse.json(
          { error: "Unknown action. Supported: geocode, regeo, poi, nearby, weather, driving, walking, ip" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("[Map API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Map API error" },
      { status: 500 }
    );
  }
}
