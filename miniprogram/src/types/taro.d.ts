// Taro global type declarations
// These functions are provided by @tarojs/taro at build time
// This file ensures TypeScript resolves them without installing node_modules

declare function defineAppConfig(config: {
  pages: string[];
  tabBar?: {
    color?: string;
    selectedColor?: string;
    backgroundColor?: string;
    borderStyle?: string;
    list: {
      pagePath: string;
      text: string;
      iconPath?: string;
      selectedIconPath?: string;
    }[];
  };
  window?: {
    backgroundTextStyle?: string;
    navigationBarBackgroundColor?: string;
    navigationBarTitleText?: string;
    navigationBarTextStyle?: string;
    backgroundColor?: string;
  };
  permission?: Record<string, { desc: string }>;
  requiredPrivateInfos?: string[];
  [key: string]: unknown;
}): unknown;

declare function definePageConfig(config: {
  navigationBarTitleText?: string;
  enablePullDownRefresh?: boolean;
  [key: string]: unknown;
}): unknown;
