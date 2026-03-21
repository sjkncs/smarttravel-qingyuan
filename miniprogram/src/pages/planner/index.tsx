import { useState } from 'react';
import { View, Text, Input, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { chatWithAI } from '@/utils/api';
import { getVillageImage, ACTIVITY_IMAGES } from '@/utils/images';
import { PLANNER_ICONS, SOCIAL_ICONS, DETAIL_ICONS, MENU_ICONS } from '@/utils/icons';
import './index.scss';

const presets = [
  { label: '亲子游', days: 2, budget: 1500, icon: PLANNER_ICONS.family },
  { label: '情侣游', days: 3, budget: 2000, icon: PLANNER_ICONS.couple },
  { label: '摄影游', days: 2, budget: 1200, icon: PLANNER_ICONS.camera },
  { label: '文化游', days: 3, budget: 1800, icon: PLANNER_ICONS.culture },
  { label: '养生游', days: 2, budget: 2500, icon: PLANNER_ICONS.spa },
  { label: '自驾游', days: 3, budget: 3000, icon: PLANNER_ICONS.drive },
];

const hotRoutes = [
  {
    title: '峰林温泉2日游',
    desc: '英西峰林徒步 → 温泉度假 → 田园采摘',
    days: 2, price: '¥680起',
    img: 'fenglin',
    tags: ['热门', '亲子'],
  },
  {
    title: '瑶族文化3日深度游',
    desc: '南岗瑶寨 → 油岭歌舞 → 连南梯田',
    days: 3, price: '¥1280起',
    img: 'nangang',
    tags: ['文化', '非遗'],
  },
  {
    title: '古村茶园2日游',
    desc: '上岳古村 → 积庆里茶园 → 品茗体验',
    days: 2, price: '¥580起',
    img: 'jiqingli',
    tags: ['休闲', '美食'],
  },
];

export default function PlannerPage() {
  const [days, setDays] = useState('2');
  const [budget, setBudget] = useState('');
  const [travelers, setTravelers] = useState('2');
  const [interests, setInterests] = useState('');
  const [plan, setPlan] = useState('');
  const [loading, setLoading] = useState(false);

  const generatePlan = async (prompt?: string) => {
    const msg = prompt || `帮我规划一个${days}天的清远旅行，${travelers}人出行${budget ? `，预算${budget}元` : ''}${interests ? `，偏好: ${interests}` : ''}。请推荐具体的村落、活动和路线。`;

    setLoading(true);
    setPlan('');
    try {
      const res = await chatWithAI(msg, []);
      setPlan(res.reply || res.recommendation || '暂时无法生成行程，请稍后重试。');
    } catch {
      Taro.showToast({ title: '生成失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const usePreset = (preset: typeof presets[0]) => {
    setDays(String(preset.days));
    setBudget(String(preset.budget));
    generatePlan(`帮我规划一个${preset.days}天的清远${preset.label}，2人出行，预算${preset.budget}元。请推荐具体的村落、活动和路线。`);
  };

  return (
    <View className='planner-page'>
      <ScrollView scrollY className='planner-scroll'>
        {/* Header */}
        <View className='planner-header'>
          <Image src={ACTIVITY_IMAGES.hiking} className='header-bg' mode='aspectFill' />
          <View className='header-overlay'>
            <Text className='header-title'>AI行程规划</Text>
            <Text className='header-desc'>输入偏好，AI为你定制专属清远之旅</Text>
          </View>
        </View>

        {/* Quick Presets */}
        <View className='section'>
          <Text className='section-title'>快速选择</Text>
          <View className='preset-grid'>
            {presets.map(p => (
              <View key={p.label} className='preset-card' onClick={() => usePreset(p)}>
                <Image src={p.icon} className='preset-icon-img' />
                <Text className='preset-label'>{p.label}</Text>
                <Text className='preset-info'>{p.days}天·¥{p.budget}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Custom Form */}
        <View className='section'>
          <Text className='section-title'>自定义规划</Text>
          <View className='form-card'>
            <View className='form-row'>
              <Text className='form-label'>天数</Text>
              <View className='stepper'>
                <View className='stepper-btn' onClick={() => setDays(String(Math.max(1, Number(days) - 1)))}>
                  <Text>−</Text>
                </View>
                <Text className='stepper-value'>{days}天</Text>
                <View className='stepper-btn' onClick={() => setDays(String(Math.min(7, Number(days) + 1)))}>
                  <Text>+</Text>
                </View>
              </View>
            </View>
            <View className='form-row'>
              <Text className='form-label'>人数</Text>
              <View className='stepper'>
                <View className='stepper-btn' onClick={() => setTravelers(String(Math.max(1, Number(travelers) - 1)))}>
                  <Text>−</Text>
                </View>
                <Text className='stepper-value'>{travelers}人</Text>
                <View className='stepper-btn' onClick={() => setTravelers(String(Math.min(20, Number(travelers) + 1)))}>
                  <Text>+</Text>
                </View>
              </View>
            </View>
            <View className='form-row'>
              <Text className='form-label'>预算</Text>
              <Input
                className='form-input'
                type='number'
                placeholder='选填，如: 2000'
                value={budget}
                onInput={e => setBudget(e.detail.value)}
              />
            </View>
            <View className='form-row'>
              <Text className='form-label'>偏好</Text>
              <Input
                className='form-input'
                placeholder='如: 瑶族文化、温泉、亲子'
                value={interests}
                onInput={e => setInterests(e.detail.value)}
              />
            </View>
            <View
              className={`generate-btn ${loading ? 'loading' : ''}`}
              onClick={() => !loading && generatePlan()}
            >
              <View className='btn-inner'>
                <Image src={SOCIAL_ICONS.robot} className='btn-icon' />
                <Text className='btn-text'>{loading ? 'AI生成中...' : '生成行程'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* AI Generated Plan */}
        {plan && (
          <View className='section'>
            <View className='section-title-row'>
              <Image src={DETAIL_ICONS.calendar} className='section-icon' />
              <Text className='section-title'>AI推荐行程</Text>
            </View>
            <View className='plan-card'>
              <Text className='plan-text'>{plan}</Text>
              <View className='plan-actions'>
                <View className='plan-btn share' onClick={() => {
                  Taro.setClipboardData({ data: plan });
                  Taro.showToast({ title: '行程已复制', icon: 'success' });
                }}>
                  <View className='plan-btn-inner'><Image src={MENU_ICONS.order} className='plan-btn-icon' /><Text>复制</Text></View>
                </View>
                <View className='plan-btn save' onClick={() => Taro.showToast({ title: '已保存到我的行程', icon: 'success' })}>
                  <View className='plan-btn-inner'><Image src={MENU_ICONS.heart} className='plan-btn-icon' /><Text>保存</Text></View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Hot Routes */}
        {!plan && (
          <View className='section'>
            <Text className='section-title'>热门路线</Text>
            {hotRoutes.map((route, i) => (
              <View key={i} className='route-card' onClick={() => generatePlan(`详细规划一下"${route.title}"的行程: ${route.desc}`)}>
                <Image src={getVillageImage(route.img)} className='route-img' mode='aspectFill' />
                <View className='route-info'>
                  <Text className='route-title'>{route.title}</Text>
                  <Text className='route-desc'>{route.desc}</Text>
                  <View className='route-meta'>
                    <Text className='route-days'>{route.days}天</Text>
                    <Text className='route-price'>{route.price}</Text>
                  </View>
                  <View className='route-tags'>
                    {route.tags.map(t => <Text key={t} className='route-tag'>{t}</Text>)}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
