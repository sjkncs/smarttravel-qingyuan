import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useShareAppMessage, usePullDownRefresh } from '@tarojs/taro';
import { getVillages } from '@/utils/api';
import './index.scss';

interface Village {
  id: string;
  slug: string;
  name: string;
  location: string;
  image?: string;
  rating: number;
  tags: string[];
  category: string;
  raiScore: number;
}

export default function IndexPage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);

  useShareAppMessage(() => ({
    title: '智游清远 — AI驱动的乡村旅行',
    path: '/pages/index/index',
  }));

  usePullDownRefresh(async () => {
    await loadData();
    Taro.stopPullDownRefresh();
  });

  const loadData = async () => {
    try {
      const res = await getVillages();
      setVillages(res.data || []);
    } catch (err) {
      console.error('加载村落失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const quickActions = [
    { icon: '🎫', label: '扫码购票', action: () => Taro.scanCode({}) },
    { icon: '🤖', label: 'AI规划', action: () => Taro.switchTab({ url: '/pages/ai/index' }) },
    { icon: '📍', label: '附近村落', action: () => Taro.switchTab({ url: '/pages/explore/index' }) },
    { icon: '🛒', label: '特产商城', action: () => Taro.navigateTo({ url: '/pages/shop/index' }) },
  ];

  const goToVillage = (slug: string) => {
    Taro.navigateTo({ url: `/pages/village/detail?slug=${slug}` });
  };

  return (
    <View className='index-page'>
      {/* Header */}
      <View className='header'>
        <View className='header-top'>
          <View>
            <Text className='greeting'>你好，旅行者 👋</Text>
            <Text className='weather'>清远 · 晴 28°C</Text>
          </View>
          <View className='header-bell' onClick={() => Taro.showToast({ title: '暂无新消息', icon: 'none' })}>
            🔔
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className='quick-actions'>
        {quickActions.map(item => (
          <View key={item.label} className='action-item' onClick={item.action}>
            <View className='action-icon'>{item.icon}</View>
            <Text className='action-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Banner */}
      <View className='banner'>
        <View className='banner-content'>
          <Text className='banner-title'>🏔️ 清远乡村旅行</Text>
          <Text className='banner-desc'>AI智能推荐 · 瑶族文化 · 田园风光</Text>
          <View className='banner-btn' onClick={() => Taro.switchTab({ url: '/pages/ai/index' })}>
            <Text className='banner-btn-text'>AI规划行程 →</Text>
          </View>
        </View>
      </View>

      {/* Nearby Recommendations */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>附近推荐</Text>
          <Text className='section-more' onClick={() => Taro.switchTab({ url: '/pages/explore/index' })}>
            查看全部 →
          </Text>
        </View>

        {loading ? (
          <View className='loading'>
            <Text>加载中...</Text>
          </View>
        ) : (
          <ScrollView scrollX className='village-scroll'>
            {villages.slice(0, 6).map(village => (
              <View key={village.id} className='village-card' onClick={() => goToVillage(village.slug)}>
                <View className='village-img-wrap'>
                  {village.image ? (
                    <Image src={village.image} className='village-img' mode='aspectFill' />
                  ) : (
                    <View className='village-img-placeholder'>🏘️</View>
                  )}
                  <View className='village-rai'>RAI {village.raiScore}</View>
                </View>
                <View className='village-info'>
                  <Text className='village-name'>{village.name}</Text>
                  <View className='village-meta'>
                    <Text className='village-rating'>⭐ {village.rating}</Text>
                    <Text className='village-location'>📍 {village.location}</Text>
                  </View>
                  <View className='village-tags'>
                    {village.tags.slice(0, 2).map(tag => (
                      <Text key={tag} className='tag'>{tag}</Text>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Hot Posts */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>热门讨论</Text>
          <Text className='section-more' onClick={() => Taro.switchTab({ url: '/pages/forum/index' })}>
            更多 →
          </Text>
        </View>
        <View className='hot-posts'>
          {[
            { title: '千年瑶寨盘王节体验记', author: '旅行达人', comments: 28 },
            { title: '英西峰林最佳自驾路线分享', author: '自驾老司机', comments: 15 },
            { title: '积庆里茶园采茶全攻略', author: '茶香小筑', comments: 12 },
          ].map((post, i) => (
            <View key={i} className='post-item' onClick={() => Taro.switchTab({ url: '/pages/forum/index' })}>
              <View className='post-rank'>{i + 1}</View>
              <View className='post-content'>
                <Text className='post-title'>{post.title}</Text>
                <Text className='post-meta'>{post.author} · {post.comments}条评论</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
