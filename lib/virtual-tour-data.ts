/**
 * 虚拟旅游数据配置
 * 支持全国范围动态扩展，每个乡村作为一个独立的配置包
 */

// ─── 多语言介绍 ───────────────────────────────────────────────
export interface I18nText {
  zh: string;
  en?: string;
  yue?: string;
  miao?: string;
}

// ─── AR 导览点 ────────────────────────────────────────────────
export interface ARWaypoint {
  id: string;
  name: I18nText;
  position: [number, number, number];
  rotation?: [number, number, number];
  description: I18nText;
  mediaUrl?: string;
  type: 'cultural' | 'scenic' | 'food' | 'craft' | 'nav';
  icon?: string;
}

// ─── 全景热点 ─────────────────────────────────────────────────
export interface PanoramaHotspot {
  id: string;
  position: [number, number, number];
  label: I18nText;
  description?: I18nText;
  targetId?: string;
  type: 'info' | 'nav';
  mediaUrl?: string;
}

// ─── 单个全景节点 ─────────────────────────────────────────────
export interface PanoramaNode {
  id: string;
  name: I18nText;
  imageUrl: string;
  thumbnailUrl?: string;
  hotspots: PanoramaHotspot[];
  audioGuideUrl?: string;
}

// ─── 3DGS 场景配置 ────────────────────────────────────────────
export interface GSSceneConfig {
  enabled: boolean;
  modelPath: string;
  fallbackImageUrl?: string;
  boundingBox?: {
    min: [number, number, number];
    max: [number, number, number];
  };
}

// ─── AR 导览配置 ──────────────────────────────────────────────
export interface ARGuideConfig {
  enabled: boolean;
  guideModelUrl?: string;
  waypoints: ARWaypoint[];
}

// ─── 核心接口：VillageConfig ──────────────────────────────────
export interface VillageConfig {
  id: string;
  slug: string;
  province: string;
  provinceCode: string;
  village: string;
  villageCode: string;
  name: I18nText;
  tagline: I18nText;
  description: I18nText;
  tags: string[];
  coverImage: string;
  galleryImages?: string[];
  coordinates: { lat: number; lng: number; altitude?: number };
  panoramas: PanoramaNode[];
  defaultPanoramaId?: string;
  gsScene: GSSceneConfig;
  arGuide: ARGuideConfig;
  visitDuration?: number;
  bestSeason?: string;
  culturalHeritage?: string;
  publishedAt?: string;
}

export type VirtualTourConfig = VillageConfig;

// ─── 试点数据：连南千年瑶寨 ────────────────────────────────────
export const LIANNAN_YAOZHAI: VillageConfig = {
  id: 'liannan-yaozhai',
  slug: 'liannan-yaozhai',
  province: '广东',
  provinceCode: 'guangdong',
  village: '瑶寨',
  villageCode: 'yaozhai',
  name: {
    zh: '连南千年瑶寨',
    en: 'Liannan Millennium Yao Village',
  },
  tagline: {
    zh: '世界瑶族第一寨，千年古韵传今朝',
    en: "World's Premier Yao Village, Millennium Heritage",
  },
  description: {
    zh: '连南千年瑶寨位于广东省清远市连南瑶族自治县，是中国历史文化名村，被誉为世界瑶族第一寨。寨内保存有完好的明清古建筑群，瑶族耕作梯田、传统民俗与独特服饰文化在此延续千年，是感受南岭民族走廊多元文化的绝佳目的地。',
    en: 'Liannan Millennium Yao Village in Qingyuan, Guangdong, is a nationally recognized historic and cultural village. Its well-preserved Ming and Qing dynasty architecture, terraced rice fields, and living Yao traditions make it a gateway to the diverse cultures of the Nanling Mountain Corridor.',
  },
  tags: ['民族文化', '古建筑', '梯田', '瑶族', '国家级历史文化名村', '广东'],
  coverImage: '/tours/guangdong/liannan-yaozhai/cover.jpg',
  galleryImages: [
    '/tours/guangdong/liannan-yaozhai/gallery-1.jpg',
    '/tours/guangdong/liannan-yaozhai/gallery-2.jpg',
    '/tours/guangdong/liannan-yaozhai/gallery-3.jpg',
  ],
  coordinates: { lat: 24.7232, lng: 112.2856, altitude: 680 },
  defaultPanoramaId: 'main-gate',
  panoramas: [
    {
      id: 'main-gate',
      name: { zh: '寨门全景', en: 'Main Gate Panorama' },
      imageUrl: '/tours/guangdong/liannan-yaozhai/pano-main-gate.jpg',
      thumbnailUrl: '/tours/guangdong/liannan-yaozhai/thumb-main-gate.jpg',
      audioGuideUrl: '/tours/guangdong/liannan-yaozhai/audio-main-gate.mp3',
      hotspots: [
        {
          id: 'hs-museum',
          position: [-5, 2, -8],
          label: { zh: '瑶族博物馆', en: 'Yao Museum' },
          description: { zh: '展示瑶族千年迁徙历史与独特民俗文化的核心展馆。', en: 'The core exhibition hall showcasing the millennium migration history and unique folk culture of the Yao people.' },
          targetId: 'museum',
          type: 'nav',
        },
        {
          id: 'hs-terrace',
          position: [8, -1, -6],
          label: { zh: '梯田观景台', en: 'Terrace Viewpoint' },
          description: { zh: '俯瞰千亩连片梯田，感受大地艺术之美。', en: 'Overlook thousands of acres of terraced fields and experience the beauty of land art.' },
          targetId: 'terrace',
          type: 'nav',
        },
      ],
    },
    {
      id: 'museum',
      name: { zh: '瑶族博物馆', en: 'Yao Museum' },
      imageUrl: '/tours/guangdong/liannan-yaozhai/pano-museum.jpg',
      thumbnailUrl: '/tours/guangdong/liannan-yaozhai/thumb-museum.jpg',
      hotspots: [
        {
          id: 'hs-back-gate',
          position: [10, 0, 0],
          label: { zh: '返回寨门', en: 'Back to Main Gate' },
          targetId: 'main-gate',
          type: 'nav',
        },
      ],
    },
    {
      id: 'terrace',
      name: { zh: '梯田观景台', en: 'Terrace Viewpoint' },
      imageUrl: '/tours/guangdong/liannan-yaozhai/pano-terrace.jpg',
      thumbnailUrl: '/tours/guangdong/liannan-yaozhai/thumb-terrace.jpg',
      hotspots: [],
    },
  ],
  gsScene: {
    enabled: true,
    modelPath: '/tours/guangdong/liannan-yaozhai/scene.splat',
    fallbackImageUrl: '/tours/guangdong/liannan-yaozhai/gs-fallback.jpg',
    boundingBox: { min: [-50, -10, -50], max: [50, 30, 50] },
  },
  arGuide: {
    enabled: true,
    guideModelUrl: '/models/guide-yao.glb',
    waypoints: [
      {
        id: 'wp-gate',
        name: { zh: '寨门', en: 'Village Gate' },
        position: [0, 0, -5],
        description: { zh: '这座古朴的寨门建于明代，是整个瑶寨的标志性入口，历经数百年风雨依然屹立。', en: 'This ancient gate, built in the Ming Dynasty, is the iconic entrance to the Yao Village, standing firm through centuries.' },
        type: 'cultural',
        mediaUrl: '/tours/guangdong/liannan-yaozhai/media-gate.jpg',
      },
      {
        id: 'wp-drum-tower',
        name: { zh: '鼓楼广场', en: 'Drum Tower Square' },
        position: [5, 0, -10],
        description: { zh: '瑶寨节庆活动的中心，每逢耍歌堂节，鼓声响彻山谷，数千瑶民在此共庆丰收。', en: 'The center of Yao Village festivals. During the Shua Ge Tang Festival, drum beats echo through the valley as thousands celebrate the harvest.' },
        type: 'cultural',
        mediaUrl: '/tours/guangdong/liannan-yaozhai/media-drum.jpg',
      },
      {
        id: 'wp-craft-workshop',
        name: { zh: '织锦工坊', en: 'Brocade Workshop' },
        position: [-3, 0, -8],
        description: { zh: '非物质文化遗产瑶族织锦的传承地，工匠们以传统腰机织出精美图案，每件作品需耗时数月。', en: 'Home to the intangible cultural heritage of Yao Brocade. Artisans use traditional waist looms to create intricate patterns, each piece taking months to complete.' },
        type: 'craft',
        mediaUrl: '/tours/guangdong/liannan-yaozhai/media-craft.jpg',
      },
      {
        id: 'wp-terrace-food',
        name: { zh: '梯田稻米', en: 'Terrace Rice' },
        position: [10, -2, -15],
        description: { zh: '瑶族先民开凿的千年梯田，种植的高山糯米是制作传统美食竹筒饭的核心食材。', en: 'Millennium terraces carved by Yao ancestors, where highland glutinous rice — the key ingredient for traditional bamboo tube rice — is cultivated.' },
        type: 'food',
        mediaUrl: '/tours/guangdong/liannan-yaozhai/media-rice.jpg',
      },
    ],
  },
  visitDuration: 180,
  bestSeason: '3月-5月（梯田春耕）、9月-11月（金秋丰收）',
  culturalHeritage: '国家级历史文化名村',
  publishedAt: '2024-01-15',
};

// ─── 试点数据：贵州西江千户苗寨 ──────────────────────────────────
export const GUIZHOU_XIJIANG: VillageConfig = {
  id: 'guizhou-xijiang',
  slug: 'guizhou-xijiang',
  province: '贵州',
  provinceCode: 'guizhou',
  village: '西江千户苗寨',
  villageCode: 'xijiang',
  name: {
    zh: '西江千户苗寨',
    en: 'Xijiang Thousand-Household Miao Village',
    miao: 'Ghab Hmub Qab Liangx',
  },
  tagline: {
    zh: '世界最大苗族聚居村寨，苗族文化活态博物馆',
    en: "World's Largest Miao Settlement, Living Museum of Miao Culture",
  },
  description: {
    zh: '西江千户苗寨位于贵州省黔东南苗族侗族自治州雷山县，是目前全球规模最大的苗族聚居村寨，拥有1300余户、6000余人。依山傍水的吊脚楼群层叠而上，形成壮观的山地景观。苗族银饰、芦笙舞、苗绣等非物质文化遗产在此活态传承，是感受苗族文化最完整的窗口。',
    en: "Xijiang Thousand-Household Miao Village in Leishan County, Guizhou, is the world's largest Miao settlement with over 1,300 households and 6,000 residents. The stilt houses cascade up the hillsides in a spectacular mountain landscape. Miao silver jewelry, lusheng dance, and embroidery — all intangible cultural heritage — are kept alive here, making it the most complete window into Miao culture.",
    miao: 'Ghab Hmub Qab Liangx jox Guizhou...',
  },
  tags: ['苗族文化', '吊脚楼', '非遗', '银饰', '芦笙', '贵州', '世界最大苗寨'],
  coverImage: '/tours/guizhou/xijiang/cover.jpg',
  galleryImages: [
    '/tours/guizhou/xijiang/gallery-1.jpg',
    '/tours/guizhou/xijiang/gallery-2.jpg',
    '/tours/guizhou/xijiang/gallery-3.jpg',
    '/tours/guizhou/xijiang/gallery-4.jpg',
  ],
  coordinates: { lat: 26.4697, lng: 108.0534, altitude: 860 },
  defaultPanoramaId: 'observation-deck',
  panoramas: [
    {
      id: 'observation-deck',
      name: { zh: '观景台全景', en: 'Observation Deck Panorama' },
      imageUrl: '/tours/guizhou/xijiang/pano-observation.jpg',
      thumbnailUrl: '/tours/guizhou/xijiang/thumb-observation.jpg',
      audioGuideUrl: '/tours/guizhou/xijiang/audio-observation.mp3',
      hotspots: [
        {
          id: 'hs-stilt-houses',
          position: [3, 1, -10],
          label: { zh: '吊脚楼群', en: 'Stilt House Cluster' },
          description: { zh: '层叠而上的木质吊脚楼，是苗族建筑智慧的结晶，依山就势、通风防潮。', en: 'Cascading wooden stilt houses represent the architectural wisdom of the Miao people, designed to follow terrain and resist moisture.' },
          targetId: 'stilt-village',
          type: 'nav',
        },
        {
          id: 'hs-lusheng-square',
          position: [-6, 0, -8],
          label: { zh: '芦笙广场', en: 'Lusheng Square' },
          description: { zh: '苗族芦笙舞表演的核心场地，每逢节庆人山人海，笙声悠扬。', en: 'The central stage for Miao Lusheng dance performances, packed with crowds during festivals as the melodious pipe music fills the air.' },
          targetId: 'lusheng-square',
          type: 'nav',
        },
      ],
    },
    {
      id: 'stilt-village',
      name: { zh: '吊脚楼群', en: 'Stilt House Cluster' },
      imageUrl: '/tours/guizhou/xijiang/pano-stilt.jpg',
      thumbnailUrl: '/tours/guizhou/xijiang/thumb-stilt.jpg',
      hotspots: [
        {
          id: 'hs-silver-shop',
          position: [4, 0, -6],
          label: { zh: '苗银工坊', en: 'Miao Silver Workshop' },
          description: { zh: '国家级非遗苗族银饰锻造技艺的传承工坊，可观看匠人手工錾刻银饰全程。', en: 'A workshop preserving the national intangible heritage of Miao silver forging. Watch artisans hand-engrave silver ornaments from start to finish.' },
          type: 'info',
          mediaUrl: '/tours/guizhou/xijiang/media-silver.jpg',
        },
        {
          id: 'hs-back-deck',
          position: [-8, 1, 0],
          label: { zh: '返回观景台', en: 'Back to Observation Deck' },
          targetId: 'observation-deck',
          type: 'nav',
        },
      ],
    },
    {
      id: 'lusheng-square',
      name: { zh: '芦笙广场', en: 'Lusheng Square' },
      imageUrl: '/tours/guizhou/xijiang/pano-lusheng.jpg',
      thumbnailUrl: '/tours/guizhou/xijiang/thumb-lusheng.jpg',
      hotspots: [],
    },
  ],
  gsScene: {
    enabled: true,
    modelPath: '/tours/guizhou/xijiang/scene.splat',
    fallbackImageUrl: '/tours/guizhou/xijiang/gs-fallback.jpg',
    boundingBox: { min: [-80, -15, -80], max: [80, 50, 80] },
  },
  arGuide: {
    enabled: true,
    guideModelUrl: '/models/guide-miao.glb',
    waypoints: [
      {
        id: 'wp-village-entrance',
        name: { zh: '寨门迎宾', en: 'Village Entrance Welcome' },
        position: [0, 0, -3],
        description: { zh: '苗族以"拦门酒"迎接贵客，十二道拦门酒象征着最高礼遇，每一杯都饱含苗家深情。', en: 'The Miao welcome guests with "barrier wine" — twelve cups symbolizing the highest honor, each filled with heartfelt Miao hospitality.' },
        type: 'cultural',
        mediaUrl: '/tours/guizhou/xijiang/media-welcome.jpg',
      },
      {
        id: 'wp-silver-culture',
        name: { zh: '苗族银饰文化', en: 'Miao Silver Culture' },
        position: [6, 0, -12],
        description: { zh: '苗族银饰是身份与财富的象征，一套完整的盛装银饰重达数公斤，包含头饰、项圈、手镯等数十件。', en: 'Miao silver ornaments symbolize identity and wealth. A complete ceremonial set weighs several kilograms, comprising dozens of pieces including headdresses, collars, and bracelets.' },
        type: 'craft',
        mediaUrl: '/tours/guizhou/xijiang/media-silver-culture.jpg',
      },
      {
        id: 'wp-embroidery',
        name: { zh: '苗绣传承', en: 'Miao Embroidery Heritage' },
        position: [-4, 0, -9],
        description: { zh: '苗绣被誉为"穿在身上的史书"，每一针每一线都记录着苗族迁徙与生活的历史，是国家级非物质文化遗产。', en: 'Miao embroidery is called "history written on cloth" — every stitch records the migration and life history of the Miao people, recognized as national intangible cultural heritage.' },
        type: 'craft',
        mediaUrl: '/tours/guizhou/xijiang/media-embroidery.jpg',
      },
      {
        id: 'wp-lusheng-dance',
        name: { zh: '芦笙舞', en: 'Lusheng Dance' },
        position: [2, 0, -18],
        description: { zh: '芦笙舞是苗族最重要的传统舞蹈，以芦笙为伴奏，男女老少共舞，是苗族节庆文化的核心表达。', en: 'Lusheng dance is the most important traditional Miao dance, performed to the sound of the lusheng pipe by people of all ages, forming the core of Miao festival culture.' },
        type: 'cultural',
        mediaUrl: '/tours/guizhou/xijiang/media-dance.jpg',
      },
    ],
  },
  visitDuration: 240,
  bestSeason: '4月-10月，苗年（农历十月）为最佳节庆时机',
  culturalHeritage: '中国历史文化名村、世界最大苗族聚居村寨',
  publishedAt: '2024-02-01',
};

// ─── 导出所有试点乡村 ─────────────────────────────────────────
export const SAMPLE_TOURS: VillageConfig[] = [
  LIANNAN_YAOZHAI,
  GUIZHOU_XIJIANG,
];

/**
 * 根据省份代码和乡村代码获取虚拟旅游配置
 * 生产环境中应通过 CDN/API 动态加载
 */
export async function getTourConfig(
  provinceCode: string,
  villageCode: string
): Promise<VillageConfig | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const tour = SAMPLE_TOURS.find(
        (t) => t.provinceCode === provinceCode && t.villageCode === villageCode
      );
      resolve(tour ?? null);
    }, 300);
  });
}

/**
 * 获取所有已发布的乡村列表（用于首页展示）
 */
export function getAllTours(): VillageConfig[] {
  return SAMPLE_TOURS;
}
