import { useEffect, useState } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import { getVillageDetail } from '@/utils/api';
import { getVillageImage } from '@/utils/images';
import { DETAIL_ICONS, ACTION_ICONS } from '@/utils/icons';
import './detail.scss';

interface VillageData {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  location: string;
  image?: string;
  rating: number;
  tags: string[];
  description: string;
  raiScore: number;
  cpiScore: number;
  vsiScore: number;
  season: string;
  category: string;
  visitors: number;
  reviewCount: number;
  detail?: {
    activities: string[];
    bestTime: string;
    transport: string;
    tips: string;
  };
}

export default function VillageDetailPage() {
  const router = useRouter();
  const slug = router.params.slug || '';
  const [village, setVillage] = useState<VillageData | null>(null);
  const [loading, setLoading] = useState(true);

  useShareAppMessage(() => ({
    title: village ? `${village.name} — 智游清远` : '智游清远',
    path: `/pages/village/detail?slug=${slug}`,
  }));

  useEffect(() => {
    if (slug) loadVillage();
  }, [slug]);

  const loadVillage = async () => {
    try {
      const res = await getVillageDetail(slug);
      setVillage(res.data || null);
      if (res.data?.name) {
        Taro.setNavigationBarTitle({ title: res.data.name });
      }
    } catch (err) {
      console.error('加载村落详情失败:', err);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View className='loading'><Text>加载中...</Text></View>;
  }

  if (!village) {
    return <View className='empty'><Text>村落不存在</Text></View>;
  }

  return (
    <View className='detail-page'>
      {/* Hero Image */}
      <View className='hero'>
        <Image src={getVillageImage(village.slug)} className='hero-img' mode='aspectFill' />
        <View className='hero-overlay'>
          <Text className='hero-name'>{village.name}</Text>
          <Text className='hero-name-en'>{village.nameEn}</Text>
          <View className='hero-location-row'>
            <Image src={ACTION_ICONS.mapPin} className='detail-icon-sm' />
            <Text className='hero-location'>{village.location}</Text>
          </View>
        </View>
      </View>

      {/* Scores */}
      <View className='scores-card'>
        <View className='score-item'>
          <Text className='score-value rai'>{village.raiScore}</Text>
          <Text className='score-label'>可达性 RAI</Text>
        </View>
        <View className='score-divider' />
        <View className='score-item'>
          <Text className='score-value cpi'>{village.cpiScore}</Text>
          <Text className='score-label'>文化保护 CPI</Text>
        </View>
        <View className='score-divider' />
        <View className='score-item'>
          <Text className='score-value vsi'>{village.vsiScore}</Text>
          <Text className='score-label'>安全指数 VSI</Text>
        </View>
      </View>

      {/* Info */}
      <View className='info-card'>
        <View className='info-row'>
          <View className='info-label-row'><Image src={DETAIL_ICONS.star} className='detail-icon' /><Text className='info-label'>评分</Text></View>
          <Text className='info-value'>{village.rating} / 5.0（{village.reviewCount}条评价）</Text>
        </View>
        <View className='info-row'>
          <View className='info-label-row'><Image src={DETAIL_ICONS.calendar} className='detail-icon' /><Text className='info-label'>最佳季节</Text></View>
          <Text className='info-value'>{village.season}</Text>
        </View>
        <View className='info-row'>
          <View className='info-label-row'><Image src={DETAIL_ICONS.visitors} className='detail-icon' /><Text className='info-label'>累计游客</Text></View>
          <Text className='info-value'>{village.visitors.toLocaleString()}人</Text>
        </View>
      </View>

      {/* Description */}
      <View className='section-card'>
        <View className='section-title-row'><Image src={DETAIL_ICONS.book} className='detail-icon' /><Text className='section-title'>村落简介</Text></View>
        <Text className='section-text'>{village.description}</Text>
        <View className='tags-wrap'>
          {village.tags.map(tag => (
            <Text key={tag} className='tag'>{tag}</Text>
          ))}
        </View>
      </View>

      {/* Activities */}
      {village.detail?.activities && (
        <View className='section-card'>
          <View className='section-title-row'><Image src={DETAIL_ICONS.target} className='detail-icon' /><Text className='section-title'>推荐活动</Text></View>
          <View className='activities'>
            {village.detail.activities.map((act, i) => (
              <View key={i} className='activity-item'>
                <Text className='activity-dot'>•</Text>
                <Text className='activity-text'>{act}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Transport & Tips */}
      {village.detail && (
        <View className='section-card'>
          <View className='section-title-row'><Image src={DETAIL_ICONS.transport} className='detail-icon' /><Text className='section-title'>交通指南</Text></View>
          <Text className='section-text'>{village.detail.transport}</Text>
          <View className='section-title-row tips-title'><Image src={DETAIL_ICONS.tip} className='detail-icon' /><Text className='section-title'>温馨提示</Text></View>
          <Text className='section-text'>{village.detail.tips}</Text>
        </View>
      )}

      {/* Actions */}
      <View className='action-bar'>
        <View className='action-btn secondary' onClick={() => Taro.showToast({ title: '已收藏', icon: 'success' })}>
          <View className='action-btn-inner'><Image src={DETAIL_ICONS.heartFill} className='detail-icon-sm' /><Text>收藏</Text></View>
        </View>
        <View className='action-btn primary' onClick={() => Taro.switchTab({ url: '/pages/ai/index' })}>
          <View className='action-btn-inner'><Image src={DETAIL_ICONS.aiPlan} className='detail-icon-sm' /><Text>AI规划行程</Text></View>
        </View>
      </View>
    </View>
  );
}
