# API Endpoint Summary

| 功能 | HTTP Method | HTTP Path | Thrift Method | Request | Response |
|---|---|---|---|---|---|
| 注册设备启动 | POST | `/api/v1/player/register` | `RegisterPlayer` | `RegisterPlayerRequest` | `RegisterPlayerResponse` |
| Manifest 拉取 | POST | `/api/v1/player/manifest/pull` | `PullManifest` | `PullManifestRequest` | `PullManifestResponse` |
| 获取资源下载地址 | POST | `/api/v1/assets/batch-url` | `BatchGetAssetUrl` | `BatchGetAssetUrlRequest` | `BatchGetAssetUrlResponse` |
| 心跳上报与监控 | POST | `/api/v1/player/heartbeat` | `Heartbeat` | `HeartbeatRequest` | `HeartbeatResponse` |
| 事件上报 | POST | `/api/v1/player/events` | `ReportPlayerEvents` | `ReportPlayerEventsRequest` | `ReportPlayerEventsResponse` |
| 远程命令 ACK | POST | `/api/v1/player/commands/ack` | `CommandAck` | `CommandAckRequest` | `CommandAckResponse` |

## 统一 Response 格式

```thrift
struct XxxResponse {
    1: XxxData data
    2: CommonBaseResp base_resp
}
```

## 通用响应

```thrift
struct CommonBaseResp {
    1: i32 code      // 0 表示成功，非 0 表示失败
    2: string message
}
```
