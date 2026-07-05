// 播放器 API 入口：根据环境变量在真实后端与本地 Mock 之间切换。
//
// - 设置了 VITE_API_BASE_URL（例如 http://localhost:3000）时，走真实 Player Application Server。
// - 未设置时，回退到本地 Mock，保证脱离后端也能独立演示。
//
// 两个实现暴露完全相同的函数签名与响应结构（{ data, base_resp }），
// 因此 usePlayerEngine 与所有 UI 组件无需关心当前用的是哪一套。

import * as mockApi from './mockPlayerApi';
import * as realApi from './realPlayerApi';

const useReal = Boolean(import.meta.env.VITE_API_BASE_URL);
const api = useReal ? realApi : mockApi;

export const API_MODE = useReal ? 'real' : 'mock';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const RegisterPlayer = api.RegisterPlayer;
export const PullManifest = api.PullManifest;
export const BatchGetAssetUrl = api.BatchGetAssetUrl;
export const Heartbeat = api.Heartbeat;
export const ReportPlayerEvents = api.ReportPlayerEvents;
export const CommandAck = api.CommandAck;
