// Real HTTP client for the Player Application Server.
//
// 后端响应包是 { success, data, error, message }，
// 而前端引擎按 IDL 约定消费 { data, base_resp: { code, message } }。
// 这里做一层适配，保持 usePlayerEngine 与 mock 版本完全一致的调用契约。

const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '';
const BASE_URL = RAW_BASE.replace(/\/$/, '');
const TOKEN_STORAGE_KEY = 'ds_player_access_token';

let accessToken = readStoredToken();

function readStoredToken() {
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

function setAccessToken(token) {
  accessToken = token || '';
  try {
    if (accessToken) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // localStorage 不可用时仅保留内存态
  }
}

// 统一把后端响应适配成 { data, base_resp: { code, message } }
async function post(path, body, { auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body ?? {}),
    });
  } catch (networkError) {
    // 网络层失败：抛出让引擎走离线 / 失败分支
    throw new Error(`network error calling ${path}: ${networkError.message}`);
  }

  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }

  const ok = res.ok && payload && payload.success !== false;
  if (!ok) {
    const message = payload?.message || payload?.error || `HTTP ${res.status}`;
    return {
      data: payload?.data ?? null,
      base_resp: { code: res.status || 1, message },
    };
  }

  return {
    data: payload.data,
    base_resp: { code: 0, message: payload.message || 'success' },
  };
}

export async function RegisterPlayer(req) {
  const resp = await post('/api/v1/player/register', req, { auth: false });
  if (resp.base_resp.code === 0 && resp.data?.access_token) {
    setAccessToken(resp.data.access_token);
  }
  return resp;
}

export async function PullManifest(req) {
  return post('/api/v1/player/manifest/pull', req);
}

export async function BatchGetAssetUrl(req) {
  return post('/api/v1/assets/batch-url', req);
}

export async function Heartbeat(req) {
  return post('/api/v1/player/heartbeat', req);
}

export async function ReportPlayerEvents(req) {
  return post('/api/v1/player/events', req);
}

export async function CommandAck(req) {
  return post('/api/v1/player/commands/ack', req);
}
