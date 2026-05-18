# 视频播放器 MVP HTTP API 文档

本文档对应 `video_player_mvp_hertz.thrift`。

---

# 1. 注册设备启动

## HTTP

```http
POST /api/v1/player/register
```

## Thrift

```thrift
RegisterPlayerResponse RegisterPlayer(1: RegisterPlayerRequest req) (api.post = '/api/v1/player/register')
```

## Request

```thrift
struct RegisterPlayerRequest {
    1: string device_sn
    2: string activation_code
    3: string device_name
    4: PlatformType platform
    5: string app_version
    6: string os_version
    7: string screen_resolution
    8: string timezone
    9: string ip_address
    10: RuntimeCapabilities capabilities
}
```

## Response

```thrift
struct RegisterPlayerResponse {
    1: RegisterPlayerData data
    2: CommonBaseResp base_resp
}
```

---

# 2. Manifest 拉取

## HTTP

```http
POST /api/v1/player/manifest/pull
```

## Thrift

```thrift
PullManifestResponse PullManifest(1: PullManifestRequest req) (api.post = '/api/v1/player/manifest/pull')
```

## Request

```thrift
struct PullManifestRequest {
    1: string device_id
    2: string tenant_id
    3: string location_id
    4: string current_manifest_id
    5: i64 current_manifest_version
    6: string app_version
    7: PlatformType platform
    8: string screen_resolution
    9: i64 last_success_sync_at
}
```

## Response

```thrift
struct PullManifestResponse {
    1: PullManifestData data
    2: CommonBaseResp base_resp
}
```

---

# 3. 获取资源下载地址

## HTTP

```http
POST /api/v1/assets/batch-url
```

## Thrift

```thrift
BatchGetAssetUrlResponse BatchGetAssetUrl(1: BatchGetAssetUrlRequest req) (api.post = '/api/v1/assets/batch-url')
```

---

# 4. 心跳上报与监控

## HTTP

```http
POST /api/v1/player/heartbeat
```

## Thrift

```thrift
HeartbeatResponse Heartbeat(1: HeartbeatRequest req) (api.post = '/api/v1/player/heartbeat')
```

说明：

MVP 阶段，远程命令通过 `HeartbeatResponse.data.commands` 返回。

---

# 5. 事件上报

## HTTP

```http
POST /api/v1/player/events
```

## Thrift

```thrift
ReportPlayerEventsResponse ReportPlayerEvents(1: ReportPlayerEventsRequest req) (api.post = '/api/v1/player/events')
```

---

# 6. 远程命令 ACK

## HTTP

```http
POST /api/v1/player/commands/ack
```

## Thrift

```thrift
CommandAckResponse CommandAck(1: CommandAckRequest req) (api.post = '/api/v1/player/commands/ack')
```
