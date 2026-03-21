import { useEffect, useState } from 'react';
import { View, Text, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { getUserProfile, wxLogin, setToken, getToken } from '@/utils/api';
import { MENU_ICONS, DEFAULT_AVATAR } from '@/utils/icons';
import './index.scss';

interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
  phone?: string;
  role: string;
}

const menuItems = [
  { icon: MENU_ICONS.order, label: '我的订单', url: '/pages/shop/index' },
  { icon: MENU_ICONS.trip, label: '我的行程', url: '/pages/planner/index' },
  { icon: MENU_ICONS.location, label: '地图导航', url: '/pages/map/index' },
  { icon: MENU_ICONS.heart, label: '我的收藏', url: '' },
  { icon: MENU_ICONS.support, label: '在线客服', url: '/pages/support/index' },
  { icon: MENU_ICONS.post, label: '我的帖子', url: '' },
  { icon: MENU_ICONS.settings, label: '设置', url: '' },
];

export default function ProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (token) {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getUserProfile();
      if (res.user) setUser(res.user);
    } catch (err) {
      console.error('加载用户信息失败:', err);
    }
  };

  const handleWxLogin = async () => {
    setLoading(true);
    try {
      const res = await wxLogin();
      if (res.token) {
        setToken(res.token);
        setUser(res.user);
        Taro.showToast({ title: '登录成功！', icon: 'success' });
      }
    } catch (err) {
      Taro.showToast({ title: '登录失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          setToken('');
          setUser(null);
          Taro.showToast({ title: '已退出登录', icon: 'none' });
        }
      },
    });
  };

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (item.url) {
      Taro.navigateTo({ url: item.url });
    } else {
      Taro.showToast({ title: '功能开发中...', icon: 'none' });
    }
  };

  return (
    <View className='profile-page'>
      {/* User Card */}
      <View className='user-card'>
        {user ? (
          <View className='user-info'>
            <View className='avatar'>
              <Image src={user.avatar || DEFAULT_AVATAR} className='avatar-img' />
            </View>
            <View className='user-detail'>
              <Text className='user-name'>{user.name}</Text>
              <Text className='user-role'>Lv.5 探索达人</Text>
            </View>
          </View>
        ) : (
          <View className='login-section'>
            <View className='avatar'>
              <Image src={MENU_ICONS.user} className='avatar-img' />
            </View>
            <View className='user-detail'>
              <Text className='user-name'>未登录</Text>
              <Text className='user-role'>登录后享受完整体验</Text>
            </View>
          </View>
        )}
      </View>

      {/* Stats */}
      <View className='stats-row'>
        {[
          { value: user ? '12' : '-', label: '足迹' },
          { value: user ? '28' : '-', label: '收藏' },
          { value: user ? '6' : '-', label: '勋章' },
          { value: user ? '3' : '-', label: '行程' },
        ].map(stat => (
          <View key={stat.label} className='stat-item'>
            <Text className='stat-value'>{stat.value}</Text>
            <Text className='stat-label'>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Login Button */}
      {!user && (
        <View className='login-area'>
          <Button className='wx-login-btn' openType='getPhoneNumber' onClick={handleWxLogin} loading={loading}>
            微信一键登录
          </Button>
        </View>
      )}

      {/* Menu */}
      <View className='menu-list'>
        {menuItems.map((item, i) => (
          <View key={i} className='menu-item' onClick={() => handleMenuClick(item)}>
            <View className='menu-left'>
              <Image src={item.icon} className='menu-icon-img' />
              <Text className='menu-label'>{item.label}</Text>
            </View>
            <Text className='menu-arrow'>›</Text>
          </View>
        ))}
      </View>

      {/* About */}
      <View className='about-section'>
        <View className='about-item' onClick={() => Taro.showToast({ title: '当前版本 v1.0.0', icon: 'none' })}>
          <Text>关于智游清远</Text>
          <Text className='about-version'>v1.0.0</Text>
        </View>
        <View className='about-item' onClick={() => Taro.navigateTo({ url: '' })}>
          <Text>社区准则</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
        <View className='about-item' onClick={() => Taro.navigateTo({ url: '' })}>
          <Text>隐私政策</Text>
          <Text className='menu-arrow'>›</Text>
        </View>
      </View>

      {/* Logout */}
      {user && (
        <View className='logout-area'>
          <View className='logout-btn' onClick={handleLogout}>
            <Text className='logout-text'>退出登录</Text>
          </View>
        </View>
      )}
    </View>
  );
}
