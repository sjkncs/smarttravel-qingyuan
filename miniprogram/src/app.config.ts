export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/explore/index',
    'pages/ai/index',
    'pages/forum/index',
    'pages/profile/index',
    'pages/village/detail',
    'pages/shop/index',
  ],
  tabBar: {
    color: '#999999',
    selectedColor: '#059669',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '首页', iconPath: 'assets/tab-home.png', selectedIconPath: 'assets/tab-home-active.png' },
      { pagePath: 'pages/explore/index', text: '发现', iconPath: 'assets/tab-explore.png', selectedIconPath: 'assets/tab-explore-active.png' },
      { pagePath: 'pages/ai/index', text: 'AI助手', iconPath: 'assets/tab-ai.png', selectedIconPath: 'assets/tab-ai-active.png' },
      { pagePath: 'pages/forum/index', text: '社区', iconPath: 'assets/tab-forum.png', selectedIconPath: 'assets/tab-forum-active.png' },
      { pagePath: 'pages/profile/index', text: '我的', iconPath: 'assets/tab-profile.png', selectedIconPath: 'assets/tab-profile-active.png' },
    ],
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#059669',
    navigationBarTitleText: '智游清远',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f5f5',
  },
  permission: {
    'scope.userLocation': { desc: '你的位置信息将用于推荐附近村落和导航' },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
});
