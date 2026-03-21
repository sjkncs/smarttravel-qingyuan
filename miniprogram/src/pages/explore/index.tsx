import { useEffect, useState } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
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
  cpiScore: number;
  vsiScore: number;
  description: string;
}

const categories = [
  { id: 'all', label: '全部' },
  { id: 'nature', label: '自然风光' },
  { id: 'culture', label: '民族文化' },
  { id: 'heritage', label: '田园体验' },
  { id: 'wellness', label: '温泉养生' },
];

export default function ExplorePage() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  usePullDownRefresh(async () => {
    await loadData();
    Taro.stopPullDownRefresh();
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const cat = activeCategory !== 'all' ? activeCategory : undefined;
      const res = await getVillages(cat);
      setVillages(res.data || []);
    } catch (err) {
      console.error('加载村落失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [activeCategory]);

  const filtered = searchQuery
    ? villages.filter(v => v.name.includes(searchQuery) || v.location.includes(searchQuery) || v.tags.some(t => t.includes(searchQuery)))
    : villages;

  return (
    <View className='explore-page'>
      {/* Search */}
      <View className='search-bar'>
        <Text className='search-icon'>🔍</Text>
        <Input
          className='search-input'
          placeholder='搜索村落、景点、活动...'
          value={searchQuery}
          onInput={(e) => setSearchQuery(e.detail.value)}
        />
      </View>

      {/* Categories */}
      <ScrollView scrollX className='categories'>
        {categories.map(cat => (
          <View
            key={cat.id}
            className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <Text>{cat.label}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Village List */}
      {loading ? (
        <View className='loading'><Text>加载中...</Text></View>
      ) : (
        <View className='village-list'>
          {filtered.map(village => (
            <View
              key={village.id}
              className='village-card'
              onClick={() => Taro.navigateTo({ url: `/pages/village/detail?slug=${village.slug}` })}
            >
              <View className='card-img-wrap'>
                {village.image ? (
                  <Image src={village.image} className='card-img' mode='aspectFill' />
                ) : (
                  <View className='card-img-placeholder'>🏘️</View>
                )}
              </View>
              <View className='card-body'>
                <View className='card-header'>
                  <Text className='card-name'>{village.name}</Text>
                  <View className='card-rating'>
                    <Text>⭐ {village.rating}</Text>
                  </View>
                </View>
                <Text className='card-location'>📍 {village.location}</Text>
                <Text className='card-desc'>{village.description.slice(0, 50)}...</Text>
                <View className='card-scores'>
                  <View className='score-badge rai'>RAI {village.raiScore}</View>
                  <View className='score-badge cpi'>CPI {village.cpiScore}</View>
                  <View className='score-badge vsi'>VSI {village.vsiScore}</View>
                </View>
                <View className='card-tags'>
                  {village.tags.slice(0, 3).map(tag => (
                    <Text key={tag} className='tag'>{tag}</Text>
                  ))}
                </View>
              </View>
            </View>
          ))}

          {filtered.length === 0 && !loading && (
            <View className='empty'>
              <Text>暂无匹配的村落，换个关键词试试</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
