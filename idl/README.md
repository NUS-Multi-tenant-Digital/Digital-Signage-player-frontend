# Digital Signage Player MVP

本项目将接口 IDL 和前端播放器工程拆分存放：

1. `idl/`：Hertz Thrift IDL、HTTP API 文档、接口摘要。
2. `frontend/`：React + JavaScript + Vite 前端播放器 MVP。

## 文件结构

```text
video_player_mvp/
├── idl/
│   ├── video_player_mvp_hertz.thrift
│   ├── HTTP_API.md
│   └── API_ENDPOINT_SUMMARY.md
├── frontend/
│   ├── package.json
│   ├── index.html
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── styles.css
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── README 可按需补充
└── README.md
```

## React Player MVP 运行方式

前端技术栈为 React + JavaScript + Vite。

```bash
cd frontend
npm install
npm run dev
```

然后打开 Vite 输出的本地地址即可查看播放器。

## 前端 MVP 能力

1. 使用 Mock API 模拟 `RegisterPlayer`、`PullManifest`、`BatchGetAssetUrl`、`Heartbeat`、`ReportPlayerEvents`、`CommandAck`。
2. 使用 `localStorage` 模拟 last good manifest、本地资源缓存索引、离线事件队列。
3. 支持固定 Template + SlotBinding 的播放方式，包括主视觉 Carousel、右侧图片区、底部 Marquee、Logo 和 Clock。
4. 支持模拟离线播放、恢复后自动补报事件、手动 Manifest 同步、清缓存、远程 `SYNC_NOW` 和紧急覆盖内容。
5. 后续接入真实后端时，优先替换 `frontend/src/services/mockPlayerApi.js` 内的 Mock 函数为 HTTP 请求。

## IDL 核心说明

`idl/` 中的 IDL 满足以下要求：

1. 使用 Thrift 协议定义 HTTP 接口。
2. 所有接口统一收敛到 `VideoPlayerAPIService`。
3. 使用 Hertz 风格 annotation：

```thrift
(api.post = '/api/v1/player/register')
```

4. 每个接口都有中文注释。
5. 每个字段都有中文注释。
6. Response 统一为：

```thrift
struct XxxResponse {
    1: XxxData data
    2: CommonBaseResp base_resp
}
```

7. `CommonBaseResp` 使用 `code` 和 `message` 作为通用响应信息：

```thrift
struct CommonBaseResp {
    1: i32 code
    2: string message
}
```

## IDL 接口范围

| 功能 | Method | Path | Service Method |
|---|---|---|---|
| 注册设备启动 | POST | `/api/v1/player/register` | `RegisterPlayer` |
| Manifest 拉取 | POST | `/api/v1/player/manifest/pull` | `PullManifest` |
| 下载资源地址 | POST | `/api/v1/assets/batch-url` | `BatchGetAssetUrl` |
| 心跳上报与监控 | POST | `/api/v1/player/heartbeat` | `Heartbeat` |
| 事件上报 | POST | `/api/v1/player/events` | `ReportPlayerEvents` |
| 远程命令 ACK | POST | `/api/v1/player/commands/ack` | `CommandAck` |

## MVP 设计边界

MVP 不支持：

1. 后端下发 Layout DSL
2. 自定义 LayoutZone 坐标
3. LayoutElement 多层嵌套
4. 动态 HTML / JS 执行
5. WebSocket / MQTT 实时命令
6. 每个 zone 独立 fallback

MVP 支持：

1. 前端固定 Template
2. 后端下发 slot 内容绑定
3. Manifest 拉取
4. 资源下载地址获取
5. 本地缓存与离线播放
6. 心跳监控
7. Heartbeat Response 返回远程命令
8. 命令 ACK
9. 播放失败 fallback
