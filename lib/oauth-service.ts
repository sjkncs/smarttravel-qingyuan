/**
 * OAuth Service — WeChat + QQ Login Integration
 *
 * WeChat Open Platform: https://open.weixin.qq.com
 *   1. Register developer account
 *   2. Create Web App → get AppID + AppSecret
 *   3. Set redirect URI: https://yourdomain.com/api/auth/oauth/wechat/callback
 *
 * QQ Connect: https://connect.qq.com
 *   1. Register developer account
 *   2. Create Web App → get AppID + AppKey
 *   3. Set redirect URI: https://yourdomain.com/api/auth/oauth/qq/callback
 *
 * Environment Variables:
 *   WECHAT_APP_ID, WECHAT_APP_SECRET
 *   QQ_APP_ID, QQ_APP_KEY
 *   NEXT_PUBLIC_BASE_URL (e.g. https://yourdomain.com)
 */

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ═══════════════════════════════════
// WeChat OAuth 2.0
// ═══════════════════════════════════

const WECHAT_APP_ID = process.env.WECHAT_OAUTH_APP_ID || "";
const WECHAT_APP_SECRET = process.env.WECHAT_OAUTH_APP_SECRET || "";

export function getWechatAuthUrl(state: string): string {
  const redirectUri = encodeURIComponent(`${BASE_URL}/api/auth/oauth/wechat/callback`);
  return `https://open.weixin.qq.com/connect/qrconnect?appid=${WECHAT_APP_ID}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
}

export async function getWechatAccessToken(code: string): Promise<{
  access_token: string;
  openid: string;
  unionid?: string;
} | null> {
  try {
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${WECHAT_APP_ID}&secret=${WECHAT_APP_SECRET}&code=${code}&grant_type=authorization_code`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.errcode) {
      console.error("[WeChat OAuth] Token error:", data);
      return null;
    }
    return { access_token: data.access_token, openid: data.openid, unionid: data.unionid };
  } catch (error) {
    console.error("[WeChat OAuth] Token fetch error:", error);
    return null;
  }
}

export async function getWechatUserInfo(accessToken: string, openid: string): Promise<{
  openid: string;
  nickname: string;
  headimgurl: string;
  unionid?: string;
} | null> {
  try {
    const url = `https://api.weixin.qq.com/sns/userinfo?access_token=${accessToken}&openid=${openid}&lang=zh_CN`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.errcode) {
      console.error("[WeChat OAuth] UserInfo error:", data);
      return null;
    }
    return { openid: data.openid, nickname: data.nickname, headimgurl: data.headimgurl, unionid: data.unionid };
  } catch (error) {
    console.error("[WeChat OAuth] UserInfo fetch error:", error);
    return null;
  }
}

// ═══════════════════════════════════
// QQ OAuth 2.0
// ═══════════════════════════════════

const QQ_APP_ID = process.env.QQ_APP_ID || "";
const QQ_APP_KEY = process.env.QQ_APP_KEY || "";

export function getQQAuthUrl(state: string): string {
  const redirectUri = encodeURIComponent(`${BASE_URL}/api/auth/oauth/qq/callback`);
  return `https://graph.qq.com/oauth2.0/authorize?response_type=code&client_id=${QQ_APP_ID}&redirect_uri=${redirectUri}&state=${state}&scope=get_user_info`;
}

export async function getQQAccessToken(code: string): Promise<{ access_token: string } | null> {
  try {
    const redirectUri = encodeURIComponent(`${BASE_URL}/api/auth/oauth/qq/callback`);
    const url = `https://graph.qq.com/oauth2.0/token?grant_type=authorization_code&client_id=${QQ_APP_ID}&client_secret=${QQ_APP_KEY}&code=${code}&redirect_uri=${redirectUri}&fmt=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error("[QQ OAuth] Token error:", data);
      return null;
    }
    return { access_token: data.access_token };
  } catch (error) {
    console.error("[QQ OAuth] Token fetch error:", error);
    return null;
  }
}

export async function getQQOpenId(accessToken: string): Promise<{ openid: string } | null> {
  try {
    const url = `https://graph.qq.com/oauth2.0/me?access_token=${accessToken}&fmt=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.error) {
      console.error("[QQ OAuth] OpenID error:", data);
      return null;
    }
    return { openid: data.openid };
  } catch (error) {
    console.error("[QQ OAuth] OpenID fetch error:", error);
    return null;
  }
}

export async function getQQUserInfo(accessToken: string, openid: string): Promise<{
  nickname: string;
  figureurl_qq_2: string;
} | null> {
  try {
    const url = `https://graph.qq.com/user/get_user_info?access_token=${accessToken}&oauth_consumer_key=${QQ_APP_ID}&openid=${openid}&fmt=json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.ret !== 0) {
      console.error("[QQ OAuth] UserInfo error:", data);
      return null;
    }
    return { nickname: data.nickname, figureurl_qq_2: data.figureurl_qq_2 };
  } catch (error) {
    console.error("[QQ OAuth] UserInfo fetch error:", error);
    return null;
  }
}

// ═══════════════════════════════════
// HELPER: Check if OAuth is configured
// ═══════════════════════════════════

export function isWechatConfigured(): boolean {
  return !!(WECHAT_APP_ID && WECHAT_APP_SECRET);
}

export function isQQConfigured(): boolean {
  return !!(QQ_APP_ID && QQ_APP_KEY);
}
