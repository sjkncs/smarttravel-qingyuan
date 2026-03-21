// ═══════════════════════════════════════════════════════════════════
// 真实图片资源 — 清远各村落/景点/商品/Banner
// 使用公共CDN高清图片，确保小程序内稳定加载
// ═══════════════════════════════════════════════════════════════════

// ── 村落封面图 ──
export const VILLAGE_IMAGES: Record<string, string> = {
  fenglin: 'https://images.unsplash.com/photo-1537531383496-f4749db60e69?w=800&h=500&fit=crop',
  nangang: 'https://images.unsplash.com/photo-1598887142487-3c854d51eabb?w=800&h=500&fit=crop',
  shangyue: 'https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?w=800&h=500&fit=crop',
  youling: 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=800&h=500&fit=crop',
  jiqingli: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&h=500&fit=crop',
};

// ── 首页Banner ──
export const BANNER_IMAGES = {
  main: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=900&h=400&fit=crop',
  autumn: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=900&h=400&fit=crop',
  culture: 'https://images.unsplash.com/photo-1583321500900-82807e458f3c?w=900&h=400&fit=crop',
};

// ── 分类封面 ──
export const CATEGORY_IMAGES: Record<string, string> = {
  nature: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=300&fit=crop',
  culture: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=400&h=300&fit=crop',
  heritage: 'https://images.unsplash.com/photo-1587974928442-77dc3e0748b1?w=400&h=300&fit=crop',
  wellness: 'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=400&h=300&fit=crop',
};

// ── 特产商城商品图 ──
export const PRODUCT_IMAGES: Record<number, string> = {
  1: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&h=400&fit=crop', // 英德红茶
  2: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=400&h=400&fit=crop', // 瑶族刺绣
  3: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop', // 西洋菜干
  4: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=400&h=400&fit=crop', // 清远麻鸡
  5: 'https://images.unsplash.com/photo-1568702846914-96b305d2ebb1?w=400&h=400&fit=crop', // 连州水晶梨
  6: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop', // 瑶族长鼓
};

// ── 用户默认头像 ──
export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
];

// ── 热门活动图 ──
export const ACTIVITY_IMAGES = {
  rafting: 'https://images.unsplash.com/photo-1530866495561-507c58b51e9f?w=600&h=400&fit=crop',
  hiking: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&h=400&fit=crop',
  hotspring: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=600&h=400&fit=crop',
  tea: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&h=400&fit=crop',
  festival: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop',
};

// 获取村落图片（带fallback）
export function getVillageImage(idOrSlug: string): string {
  return VILLAGE_IMAGES[idOrSlug] || VILLAGE_IMAGES.fenglin;
}

// 获取商品图片（带fallback）
export function getProductImage(id: number): string {
  return PRODUCT_IMAGES[id] || 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?w=400&h=400&fit=crop';
}
