import { useState, useEffect } from 'react';
import { View, Text, Map, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getVillages } from '@/utils/api';
import { getVillageImage } from '@/utils/images';
import { ACTION_ICONS, DETAIL_ICONS, NAV_ICONS } from '@/utils/icons';
import './index.scss';

interface Village {
  id: string;
  slug: string;
  name: string;
  location: string;
  rating: number;
  tags: string[];
  category: string;
  raiScore: number;
  latitude?: number;
  longitude?: number;
}

interface Marker {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  iconPath: string;
  width: number;
  height: number;
  callout: {
    content: string;
    display: string;
    borderRadius: number;
    padding: number;
    fontSize: number;
    bgColor: string;
    color: string;
  };
}

// 清远各村落坐标
const VILLAGE_COORDS: Record<string, { lat: number; lng: number }> = {
  fenglin: { lat: 24.1800, lng: 112.3200 },
  nangang: { lat: 24.7200, lng: 112.3800 },
  shangyue: { lat: 23.8700, lng: 113.5300 },
  youling: { lat: 24.6800, lng: 112.2800 },
  jiqingli: { lat: 24.1500, lng: 113.3800 },
};

export default function MapPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [centerLat, setCenterLat] = useState(24.18);
  const [centerLng, setCenterLng] = useState(112.58);

  useEffect(() => {
    loadVillages();
  }, []);

  const loadVillages = async () => {
    try {
      const res = await getVillages();
      const list = res.data || [];
      setVillages(list);

      // Build markers
      const mkrs: Marker[] = list.map((v: Village, i: number) => {
        const coord = VILLAGE_COORDS[v.slug || v.id] || { lat: 24.18 + i * 0.1, lng: 112.5 + i * 0.1 };
        return {
          id: i,
          latitude: v.latitude || coord.lat,
          longitude: v.longitude || coord.lng,
          title: v.name,
          iconPath: '',
          width: 30,
          height: 30,
          callout: {
            content: `${v.name}\n${v.rating} · RAI ${v.raiScore}`,
            display: 'ALWAYS',
            borderRadius: 8,
            padding: 8,
            fontSize: 12,
            bgColor: '#059669',
            color: '#ffffff',
          },
        };
      });
      setMarkers(mkrs);
    } catch (err) {
      console.error('加载地图数据失败:', err);
    }
  };

  const handleMarkerTap = (e: any) => {
    const idx = e.detail?.markerId ?? e.markerId;
    if (idx !== undefined && villages[idx]) {
      setSelectedVillage(villages[idx]);
    }
  };

  const navigateTo = (village: Village) => {
    const coord = VILLAGE_COORDS[village.slug || village.id];
    if (coord) {
      Taro.openLocation({
        latitude: coord.lat,
        longitude: coord.lng,
        name: village.name,
        address: village.location,
        scale: 14,
      });
    }
  };

  const goToDetail = (slug: string) => {
    Taro.navigateTo({ url: `/pages/village/detail?slug=${slug}` });
  };

  return (
    <View className='map-page'>
      {/* Map */}
      <Map
        className='map-view'
        latitude={centerLat}
        longitude={centerLng}
        scale={9}
        markers={markers}
        showLocation
        enableZoom
        enableScroll
        enableRotate
        onMarkerTap={handleMarkerTap}
      />

      {/* Village List Bottom Sheet */}
      <View className='bottom-sheet'>
        <View className='sheet-handle' />
        <View className='sheet-title-row'>
          <Image src={ACTION_ICONS.mapPin} className='map-icon' />
          <Text className='sheet-title'>清远村落</Text>
        </View>

        <ScrollView scrollX className='village-chips'>
          {villages.map(v => (
            <View
              key={v.id}
              className={`chip ${selectedVillage?.id === v.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedVillage(v);
                const coord = VILLAGE_COORDS[v.slug || v.id];
                if (coord) {
                  setCenterLat(coord.lat);
                  setCenterLng(coord.lng);
                }
              }}
            >
              <Text className='chip-text'>{v.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Selected Village Card */}
        {selectedVillage && (
          <View className='village-detail-card'>
            <Image
              src={getVillageImage(selectedVillage.slug || selectedVillage.id)}
              className='detail-img'
              mode='aspectFill'
            />
            <View className='detail-info'>
              <Text className='detail-name'>{selectedVillage.name}</Text>
              <View className='detail-location-row'>
                <Image src={ACTION_ICONS.mapPin} className='map-icon-sm' />
                <Text className='detail-location'>{selectedVillage.location}</Text>
              </View>
              <View className='detail-meta'>
                <View className='detail-rating'><Image src={DETAIL_ICONS.star} className='map-icon-sm' /><Text>{selectedVillage.rating}</Text></View>
                <Text className='detail-rai'>RAI {selectedVillage.raiScore}</Text>
              </View>
              <View className='detail-tags'>
                {selectedVillage.tags.slice(0, 3).map(t => (
                  <Text key={t} className='detail-tag'>{t}</Text>
                ))}
              </View>
              <View className='detail-actions'>
                <View className='action-btn nav' onClick={() => navigateTo(selectedVillage)}>
                  <View className='action-btn-inner'><Image src={NAV_ICONS.compass} className='map-icon-sm' /><Text>导航</Text></View>
                </View>
                <View className='action-btn view' onClick={() => goToDetail(selectedVillage.slug)}>
                  <View className='action-btn-inner'><Image src={NAV_ICONS.detail} className='map-icon-sm' /><Text>详情</Text></View>
                </View>
                <View className='action-btn plan' onClick={() => Taro.navigateTo({ url: '/pages/planner/index' })}>
                  <View className='action-btn-inner'><Image src={NAV_ICONS.plan} className='map-icon-sm' /><Text>规划</Text></View>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
