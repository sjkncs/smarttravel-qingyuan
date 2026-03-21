import type { SupportKBEntry } from "../knowledge-base";
export const TECHNICAL_KB: SupportKBEntry[] = [
  { id: "tec-001", category: "technical", subcategory: "页面异常", priority: 9, question: "页面打不开/白屏怎么办？", answer: "1.强制刷新（Ctrl+Shift+R）2.清除浏览器缓存（Ctrl+Shift+Del）3.换浏览器（推荐Chrome/Edge最新版）4.检查网络连接 5.关闭广告拦截插件 6.若仍无法访问请联系客服并告知操作系统和浏览器版本。", keywords: ["白屏", "打不开", "页面错误", "无法访问", "崩溃", "加载失败"] },
  { id: "tec-002", category: "technical", subcategory: "手机兼容", priority: 8, question: "手机上访问有问题怎么办？", answer: "推荐浏览器：iOS使用Safari，Android使用Chrome。问题排查：1.更新浏览器到最新版 2.开启JavaScript 3.关闭阅读模式 4.检查是否开启了省流量模式（可能阻止图片）5.重启浏览器", keywords: ["手机", "移动端", "手机版", "iOS", "Android", "Safari", "手机无法使用"] },
  { id: "tec-003", category: "technical", subcategory: "图片上传", priority: 7, question: "上传头像/图片失败怎么办？", answer: "图片要求：JPG/PNG/WebP格式，单张最大5MB，建议分辨率200x200以上。失败原因：文件过大（压缩后重试）、格式不支持（转换为JPG）、网络超时（换WiFi重试）。", keywords: ["上传图片", "上传失败", "头像上传", "图片", "上传"] },
  { id: "tec-004", category: "technical", subcategory: "桌面版", priority: 8, question: "桌面版EXE安装失败怎么办？", answer: "1.右键「以管理员身份运行」安装包 2.临时关闭杀毒软件（安装后重新开启）3.确保磁盘空间≥500MB 4.下载Setup版而非Portable版 5.若提示\"Windows已保护您的电脑\"，点击「更多信息」→「仍要运行」", keywords: ["安装失败", "桌面版", "EXE", "安装", "Windows", "客户端安装"] },
  { id: "tec-005", category: "technical", subcategory: "桌面版", priority: 8, question: "桌面版启动后没有响应/空白？", answer: "1.等待30秒（首次启动需加载Next.js服务器）2.检查端口3000是否被占用（关闭其他使用3000端口的应用）3.右键任务栏图标→「退出」，重新启动 4.查看是否有防火墙阻止 5.联系客服发送安装目录下的日志文件", keywords: ["桌面版没反应", "空白", "无响应", "启动失败", "卡住"] },
  { id: "tec-006", category: "technical", subcategory: "AI功能", priority: 7, question: "AI客服/小智无法回复怎么办？", answer: "1. 检查网络连接是否正常\n2. 刷新页面后重试\n3. 如AI无法回复，系统会使用知识库自动匹配答案\n4. 您随时可以输入「转人工」切换到人工客服\n\n💡 AI助手可在「行程规划」页面和右下角「智能客服」中使用。", keywords: ["AI不回复", "小智", "客服无响应", "AI失效", "聊天不回"] },
];
