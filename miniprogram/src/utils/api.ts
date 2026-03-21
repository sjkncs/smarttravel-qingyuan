import Taro from '@tarojs/taro';

// API 基础配置 — 与 Next.js 后端共享
const BASE_URL = 'https://smarttravel-qingyuan.vercel.app'; // 生产环境
// const BASE_URL = 'http://localhost:3000'; // 开发环境

let authToken = '';

export function setToken(token: string) {
  authToken = token;
  Taro.setStorageSync('token', token);
}

export function getToken(): string {
  if (!authToken) {
    authToken = Taro.getStorageSync('token') || '';
  }
  return authToken;
}

async function request<T = any>(url: string, options: Taro.request.Option & { showLoading?: boolean } = {} as any): Promise<T> {
  const token = getToken();
  const { showLoading = false, ...restOptions } = options;

  if (showLoading) {
    Taro.showLoading({ title: '加载中...' });
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      ...restOptions,
      header: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(restOptions.header || {}),
      },
    });

    if (showLoading) Taro.hideLoading();

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T;
    }

    // 401 未授权 → 跳转登录
    if (res.statusCode === 401) {
      setToken('');
      Taro.navigateTo({ url: '/pages/profile/index' });
    }

    throw new Error(res.data?.error || `请求失败: ${res.statusCode}`);
  } catch (err) {
    if (showLoading) Taro.hideLoading();
    throw err;
  }
}

// ── 村落 API ──
export async function getVillages(category?: string) {
  const params = category && category !== 'all' ? `?category=${category}` : '';
  return request(`/api/villages${params}`);
}

export async function getVillageDetail(slug: string) {
  return request(`/api/villages/${slug}`);
}

// ── 论坛 API ──
export async function getForumPosts(category?: string) {
  const params = category ? `?category=${category}` : '';
  return request(`/api/forum${params}`);
}

export async function createForumPost(data: {
  type: string; title: string; content: string;
  tags?: string[]; images?: string[];
}) {
  return request('/api/forum', {
    method: 'POST',
    data,
    showLoading: true,
  } as any);
}

// ── AI API ──
export async function getAISummary(title: string, content: string, comments: string[] = []) {
  return request('/api/forum/ai', {
    method: 'POST',
    data: { action: 'summary', title, content, comments },
  } as any);
}

export async function chatWithAI(message: string, history: { role: string; content: string }[] = []) {
  return request('/api/ai/recommend', {
    method: 'POST',
    data: { message, history },
  } as any);
}

// ── 内容审核 API ──
export async function moderateContent(content: string, title?: string) {
  return request('/api/ai/moderation', {
    method: 'POST',
    data: { action: 'check', content, title },
  } as any);
}

// ── 用户 API ──
export async function loginWithPhone(phone: string, code: string) {
  return request('/api/auth/login', {
    method: 'POST',
    data: { phone, code },
    showLoading: true,
  } as any);
}

export async function sendSmsCode(phone: string) {
  return request('/api/auth/send-code', {
    method: 'POST',
    data: { phone, type: 'SMS' },
  } as any);
}

export async function getUserProfile() {
  return request('/api/auth/me');
}

// ── 微信登录 ──
export async function wxLogin() {
  const { code } = await Taro.login();
  return request('/api/auth/wechat', {
    method: 'POST',
    data: { code },
    showLoading: true,
  } as any);
}

export default {
  getVillages,
  getVillageDetail,
  getForumPosts,
  createForumPost,
  getAISummary,
  chatWithAI,
  moderateContent,
  loginWithPhone,
  sendSmsCode,
  getUserProfile,
  wxLogin,
  setToken,
  getToken,
};
