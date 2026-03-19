import type { SupportKBEntry } from "../knowledge-base";
export const MAP_KB: SupportKBEntry[] = [
  { id: "map-001", category: "map", subcategory: "使用", priority: 9, question: "地图功能怎么用？", answer: "进入导航栏「地图」页面，支持8个图层切换：村落标注、POI兴趣点、天气覆盖、路况信息、人流热力、安全指数、地形图层、海拔剖面。\n\n点击村落标记可查看详情（VSI安全评分、距离等），还可以搜索附近POI、查看天气和海拔剖面信息。", keywords: ["地图", "怎么用", "地图功能", "图层"] },
  { id: "map-002", category: "map", subcategory: "导航", priority: 8, question: "如何导航到村落？", answer: "在地图页面点击村落标记，可查看村落位置和周边信息。\n\n如需导航，建议复制村落名称到手机地图App（高德/腾讯/百度地图）进行导航。地图页面提供了各村落的距离和路线参考信息。", keywords: ["导航", "怎么去", "路线", "导航到"] },
  { id: "map-003", category: "map", subcategory: "定位", priority: 7, question: "地图无法定位我的位置怎么办？", answer: "1. 允许浏览器访问位置权限（地址栏左侧锁图标 → 位置 → 允许）\n2. 确认GPS信号（室内可能较弱）\n3. 推荐使用Chrome/Edge浏览器\n4. 检查系统设置中位置服务是否开启", keywords: ["定位", "GPS", "位置", "无法定位", "权限"] },
  { id: "map-004", category: "map", subcategory: "离线", priority: 5, question: "地图能离线使用吗？", answer: "目前地图需要联网使用。建议出发前在WiFi环境下浏览目标区域，并截图保存关键信息。瑶寨山区信号较弱，建议提前做好准备。", keywords: ["离线", "没网", "缓存", "山区信号"] },
];
