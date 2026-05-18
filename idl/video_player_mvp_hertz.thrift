namespace go video_player.mvp
namespace java com.example.videoplayer.mvp
namespace py video_player.mvp

/**
 * 视频播放器 MVP 版本 HTTP API Thrift IDL
 *
 * 说明：
 * 1. 本 IDL 面向 Hertz HTTP API 使用。
 * 2. 所有接口统一收敛到 VideoPlayerAPIService。
 * 3. 接口 annotation 使用 api.post = '/path' 的方式声明 HTTP Path。
 * 4. Response 统一结构为 data + base_resp。
 * 5. CommonBaseResp 使用 code + message 表达通用处理结果。
 * 6. MVP 阶段不支持 Layout DSL，采用前端固定 Template + 后端 SlotBinding。
 */


// ============================================================
// 1. Request 定义
// ============================================================

/**
 * 注册设备请求。
 *
 * 使用场景：
 * 设备首次启动时，本地没有 device_id 和 access_token，需要向服务端注册。
 */
struct RegisterPlayerRequest {
    1: string device_sn                         // 设备唯一序列号；优先使用硬件 SN，没有则由安装程序生成
    2: string activation_code                   // 激活码；用于绑定租户、门店或点位
    3: string device_name                       // 设备名称，例如 "Lobby-TV-01"
    4: PlatformType platform                    // 设备平台类型
    5: string app_version                       // 当前 Player App 版本，例如 "1.0.0"
    6: string os_version                        // 操作系统版本，例如 "Windows 11" 或 "Android 12"
    7: string screen_resolution                 // 屏幕分辨率，例如 "1920x1080"
    8: string timezone                          // 设备时区，例如 "Asia/Singapore"
    9: string ip_address                        // 当前局域网 IP 地址
    10: RuntimeCapabilities capabilities        // 当前设备运行能力
}

/**
 * 拉取 Manifest 请求。
 *
 * 使用场景：
 * Player 启动后、定时同步或收到 SYNC_NOW 命令时，调用该接口拉取最新播放计划。
 */
struct PullManifestRequest {
    1: string device_id                         // 设备 ID，注册后由服务端生成
    2: string tenant_id                         // 租户 ID
    3: string location_id                       // 点位 ID，例如门店、大厅、会议室
    4: string current_manifest_id               // 当前本地正在使用的 Manifest ID；首次拉取时为空
    5: i64 current_manifest_version             // 当前本地 Manifest 版本；首次拉取时为 0
    6: string app_version                       // 当前 Player App 版本
    7: PlatformType platform                    // 当前设备平台
    8: string screen_resolution                 // 当前屏幕分辨率，例如 "1920x1080"
    9: i64 last_success_sync_at                 // 最近一次成功同步 Manifest 的时间，Unix 毫秒；首次为 0
}

/**
 * 批量获取资源下载地址请求。
 *
 * 使用场景：
 * Player 拿到新 Manifest 后，根据 assets 判断本地缺失资源，并调用该接口获取下载地址。
 */
struct BatchGetAssetUrlRequest {
    1: string device_id                         // 设备 ID
    2: string manifest_id                       // 当前 Manifest ID
    3: i64 manifest_version                     // 当前 Manifest 版本
    4: list<string> asset_ids                   // 需要获取下载地址的资源 ID 列表
}

/**
 * 心跳上报请求。
 *
 * 使用场景：
 * Player 周期性上报播放状态、设备健康状态、缓存状态和网络状态。
 */
struct HeartbeatRequest {
    1: string device_id                         // 设备 ID
    2: string app_version                       // 当前 Player App 版本
    3: string manifest_id                       // 当前正在使用的 Manifest ID
    4: i64 manifest_version                     // 当前 Manifest 版本
    5: i64 timestamp                            // 心跳时间，Unix 毫秒
    6: PlaybackStatus playback                  // 当前播放状态
    7: DeviceHealth health                      // 当前设备健康状态
    8: CacheStatus cache                        // 当前缓存状态
    9: NetworkStatus network                    // 当前网络状态
}

/**
 * 事件上报请求。
 *
 * 使用场景：
 * Player 上报启动、Manifest 同步、资源下载、播放、离线、错误等事件。
 */
struct ReportPlayerEventsRequest {
    1: string device_id                         // 设备 ID
    2: list<PlayerEvent> events                 // 批量事件列表
}

/**
 * 远程命令 ACK 请求。
 *
 * 使用场景：
 * Player 执行 Heartbeat 返回的远程命令后，上报执行结果。
 */
struct CommandAckRequest {
    1: string device_id                         // 设备 ID
    2: string command_id                        // 命令 ID
    3: CommandType type                         // 命令类型
    4: bool success                             // 是否执行成功
    5: string error_code                        // 执行失败错误码；成功时为空
    6: string error_message                     // 执行失败原因；成功时为空
    7: i64 executed_at                          // 实际执行时间，Unix 毫秒
}


// ============================================================
// 2. Response 定义
// ============================================================

/**
 * 注册设备响应。
 */
struct RegisterPlayerResponse {
    1: RegisterPlayerData data                  // 注册成功后的设备身份和基础配置
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}

/**
 * 拉取 Manifest 响应。
 */
struct PullManifestResponse {
    1: PullManifestData data                     // Manifest 更新结果和播放计划
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}

/**
 * 批量获取资源下载地址响应。
 */
struct BatchGetAssetUrlResponse {
    1: BatchGetAssetUrlData data                // 资源下载地址列表
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}

/**
 * 心跳上报响应。
 */
struct HeartbeatResponse {
    1: HeartbeatData data                       // 心跳返回数据，包括下次心跳间隔和远程命令
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}

/**
 * 事件上报响应。
 */
struct ReportPlayerEventsResponse {
    1: ReportPlayerEventsData data              // 事件接收结果
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}

/**
 * 远程命令 ACK 响应。
 */
struct CommandAckResponse {
    1: CommandAckData data                      // 命令 ACK 返回数据，MVP 阶段为空结构
    2: CommonBaseResp base_resp                 // 通用响应信息，包含 code 和 message
}


// ============================================================
// 3. Response Data 定义
// ============================================================

/**
 * 注册设备响应数据。
 */
struct RegisterPlayerData {
    1: string device_id                         // 服务端生成的设备 ID
    2: string tenant_id                         // 租户 ID
    3: string location_id                       // 点位 ID，例如门店、大厅、会议室
    4: string access_token                      // 后续接口访问 token
    5: i64 token_expire_at                      // token 过期时间，Unix 毫秒
    6: PlayerConfig config                      // 服务端下发的 Player 基础配置
}

/**
 * 拉取 Manifest 响应数据。
 */
struct PullManifestData {
    1: ManifestUpdateType update_type           // Manifest 更新类型
    2: PlayerManifest manifest                  // 新的 Manifest；当 update_type 为 MANIFEST_NO_UPDATE 时可为空
    3: i32 next_poll_interval_sec               // 建议下次拉取 Manifest 的间隔，单位秒
    4: i64 server_time                          // 服务端当前时间，Unix 毫秒
    5: string message                           // 服务端提示信息，例如 "no update"
}

/**
 * 批量获取资源下载地址响应数据。
 */
struct BatchGetAssetUrlData {
    1: list<AssetDownloadInfo> assets            // 资源下载信息列表
}

/**
 * 心跳响应数据。
 */
struct HeartbeatData {
    1: i32 next_interval_sec                     // 下次心跳建议间隔，单位秒
    2: list<PlayerCommand> commands              // 待执行的远程命令列表
}

/**
 * 事件上报响应数据。
 */
struct ReportPlayerEventsData {
    1: i32 accepted_count                        // 成功接收的事件数量
    2: i32 rejected_count                        // 被拒绝的事件数量
}

/**
 * 命令 ACK 响应数据。
 *
 * MVP 阶段暂无额外业务数据。
 */
struct CommandAckData {
}


// ============================================================
// 4. Common Response 定义
// ============================================================

/**
 * 通用响应信息。
 *
 * 说明：
 * code = 0 表示成功。
 * code != 0 表示失败，message 给出失败原因。
 */
struct CommonBaseResp {
    1: i32 code                                  // 通用状态码；0 表示成功，非 0 表示失败
    2: string message                           // 通用提示信息；成功时可为 "success"，失败时为错误原因
}


// ============================================================
// 5. 业务结构体定义
// ============================================================

/**
 * 设备运行能力。
 */
struct RuntimeCapabilities {
    1: bool support_video                        // 是否支持视频播放
    2: bool support_image                        // 是否支持图片展示
    3: bool support_text                         // 是否支持文本展示
    4: bool support_local_cache                  // 是否支持本地资源缓存
    5: i64 max_cache_size_mb                     // 最大本地缓存空间，单位 MB
}

/**
 * Player 基础配置。
 */
struct PlayerConfig {
    1: string device_id                          // 当前设备 ID
    2: string tenant_id                          // 租户 ID
    3: string location_id                        // 点位 ID
    4: i32 heartbeat_interval_sec                // 心跳上报间隔，单位秒
    5: i32 manifest_sync_interval_sec            // Manifest 同步间隔，单位秒
    6: i32 event_flush_interval_sec              // 本地事件批量上报间隔，单位秒
    7: i64 max_cache_size_mb                     // 本地最大缓存容量，单位 MB
    8: i32 asset_download_concurrency            // 资源下载并发数
    9: bool enable_offline_mode                  // 是否启用离线播放
    10: bool enable_watchdog                     // 是否启用 watchdog 防卡死机制
}

/**
 * Player Manifest。
 *
 * 说明：
 * Manifest 是当前设备的播放计划快照。
 * 它定义当前设备使用哪个模板、每个 slot 播什么、依赖哪些资源、如何缓存、如何 fallback。
 * Manifest 不包含视频/图片二进制文件。
 */
struct PlayerManifest {
    1: string manifest_id                        // Manifest 唯一 ID
    2: i64 version                               // Manifest 版本号，必须递增
    3: string tenant_id                          // 租户 ID
    4: string device_id                          // 目标设备 ID；MVP 阶段先使用设备级 Manifest
    5: string location_id                        // 点位 ID，例如门店、大厅、会议室
    6: i64 valid_from                            // Manifest 生效开始时间，Unix 毫秒
    7: i64 valid_to                              // Manifest 生效结束时间，Unix 毫秒；0 表示长期有效
    8: i32 ttl_sec                               // Manifest 本地缓存有效期，单位秒
    9: TemplateConfig template_config            // 前端固定模板配置
    10: PlaybackPlan playback_plan               // 播放计划，决定每个 slot 播放什么内容
    11: list<AssetItem> assets                   // 当前 Manifest 依赖的资源元数据列表
    12: CachePolicy cache_policy                 // 缓存策略
    13: FallbackPolicy fallback_policy           // 全局 fallback 策略
    14: string checksum                          // Manifest 内容校验值
    15: i64 generated_at                         // Manifest 生成时间，Unix 毫秒
}

/**
 * 模板配置。
 */
struct TemplateConfig {
    1: TemplateId template_id                     // 前端内置模板 ID
    2: string template_version                    // 模板版本，例如 "1.0"
    3: i32 design_width                          // 模板设计宽度，例如 1920
    4: i32 design_height                         // 模板设计高度，例如 1080
    5: list<SlotDefinition> slots                // 模板包含的 slot 定义
}

/**
 * 槽位定义。
 */
struct SlotDefinition {
    1: string slot_id                            // 槽位 ID，例如 main_video、side_image、bottom_text
    2: SlotType slot_type                        // 槽位类型，例如视频、图片、文本
    3: bool required                             // 该槽位是否必填；true 表示缺失时当前 scene 不可正常播放
}

/**
 * 播放计划。
 */
struct PlaybackPlan {
    1: string plan_id                            // 播放计划 ID
    2: PlayMode play_mode                        // 播放模式，MVP 推荐使用 PLAY_MODE_LOOP
    3: list<PlaybackScene> scenes                // 播放场景列表；一个 scene 表示一次完整屏幕展示状态
}

/**
 * 播放场景。
 */
struct PlaybackScene {
    1: string scene_id                           // 场景 ID
    2: string scene_name                         // 场景名称，方便后台管理和排查
    3: i64 duration_ms                           // 当前场景持续时间
    4: i32 order                                 // 播放顺序，数值越小越靠前
    5: list<SlotBinding> slot_bindings           // 当前场景下每个 slot 的内容绑定
}

/**
 * 槽位内容绑定。
 */
struct SlotBinding {
    1: string slot_id                            // 绑定的模板槽位 ID，例如 main_video、side_image、bottom_text
    2: ContentType content_type                  // 内容类型，MVP 只支持资源内容和文本内容
    3: string asset_id                           // 资源 ID；content_type 为 CONTENT_ASSET 时使用
    4: string text                               // 文本内容；content_type 为 CONTENT_TEXT 时使用
    5: DisplayPolicy display_policy             // 展示策略
}

/**
 * 展示策略。
 */
struct DisplayPolicy {
    1: string object_fit                         // 图片/视频填充方式：contain、cover、fill
    2: bool muted                                // 视频是否静音
    3: bool loop                                 // 当前资源是否循环播放
}

/**
 * 资源元数据。
 *
 * 注意：
 * 该结构只描述资源元数据，不包含资源二进制。
 */
struct AssetItem {
    1: string asset_id                           // 资源唯一 ID
    2: AssetType asset_type                      // 资源类型，例如视频、图片、字体
    3: string file_name                          // 文件名，例如 "promo_001.mp4"
    4: string asset_ref                          // 资源引用，用于后续获取下载 URL
    5: string mime_type                          // MIME 类型，例如 "video/mp4"、"image/png"
    6: i64 size_bytes                            // 文件大小，单位 byte
    7: string sha256                             // 文件 SHA256，用于下载后的完整性校验
    8: i64 duration_ms                           // 媒体时长；视频使用，图片可为 0
    9: bool required                             // 是否必需；true 表示缺失时 Manifest 不可切换
    10: i32 priority                             // 下载优先级，数值越大越优先下载
}

/**
 * 缓存策略。
 */
struct CachePolicy {
    1: i64 max_cache_size_mb                     // 最大缓存空间，单位 MB
    2: i32 min_free_storage_mb                   // 最小剩余磁盘空间；低于该值时停止下载新资源
    3: bool allow_delete_unused_assets           // 是否允许删除未被当前 Manifest 使用的旧资源
}

/**
 * fallback 策略。
 */
struct FallbackPolicy {
    1: string fallback_asset_id                  // 全局 fallback 资源 ID，例如默认图片或默认视频
    2: string fallback_text                      // 全局 fallback 文案，例如 "Content temporarily unavailable"
    3: i32 max_retry_count                       // 单个资源最大重试次数
    4: i32 retry_interval_sec                    // 重试间隔，单位秒
    5: bool loop_last_good_manifest              // 异常或离线时是否循环上一个可播放 Manifest
    6: bool show_black_screen_allowed            // 是否允许黑屏；MVP 建议固定为 false
}

/**
 * 资源下载信息。
 */
struct AssetDownloadInfo {
    1: string asset_id                           // 资源 ID
    2: string download_url                       // 临时下载 URL，例如 CDN 签名 URL
    3: i64 expire_at                             // 下载 URL 过期时间，Unix 毫秒
    4: string sha256                             // 文件 SHA256，用于下载后校验
    5: i64 size_bytes                            // 文件大小，单位 byte
}

/**
 * 播放状态。
 */
struct PlaybackStatus {
    1: PlaybackState state                       // 当前播放状态
    2: string current_scene_id                   // 当前播放场景 ID
    3: string current_slot_id                    // 当前播放槽位 ID
    4: string current_asset_id                   // 当前播放资源 ID
    5: i64 position_ms                           // 当前播放进度，单位毫秒
    6: i64 duration_ms                           // 当前资源总时长，单位毫秒
    7: string last_error_code                    // 最近一次错误码
    8: string last_error_message                 // 最近一次错误信息
}

/**
 * 设备健康状态。
 */
struct DeviceHealth {
    1: i64 uptime_sec                            // App 已运行时长，单位秒
    2: i32 memory_usage_mb                       // 当前内存使用量，单位 MB
    3: i64 storage_free_mb                       // 剩余磁盘空间，单位 MB
    4: i64 storage_total_mb                      // 总磁盘空间，单位 MB
    5: bool app_foreground                       // Player 是否处于前台
}

/**
 * 缓存状态。
 */
struct CacheStatus {
    1: i64 used_cache_mb                         // 当前已使用缓存空间，单位 MB
    2: i64 max_cache_mb                          // 最大缓存空间，单位 MB
    3: i32 cached_asset_count                    // 已缓存资源数量
    4: i32 missing_required_asset_count          // 缺失的必需资源数量
    5: i64 last_cache_cleanup_at                 // 上次缓存清理时间，Unix 毫秒
}

/**
 * 网络状态。
 */
struct NetworkStatus {
    1: bool online                               // 当前是否在线
    2: string connection_type                    // 网络类型，例如 wifi、ethernet
    3: i32 failed_request_count                  // 最近周期内请求失败次数
    4: i64 last_online_at                        // 最近一次在线时间，Unix 毫秒
    5: i64 last_offline_at                       // 最近一次离线时间，Unix 毫秒
}

/**
 * 远程命令。
 */
struct PlayerCommand {
    1: string command_id                         // 命令 ID
    2: CommandType type                          // 命令类型
    3: i64 issued_at                             // 命令下发时间，Unix 毫秒
    4: i64 expire_at                             // 命令过期时间，Unix 毫秒
    5: string payload_json                       // 命令参数，MVP 可为空或为简单 JSON 字符串
}

/**
 * Player 事件。
 */
struct PlayerEvent {
    1: string event_id                           // 事件唯一 ID，由 Player 本地生成
    2: EventType event_type                      // 事件类型
    3: i64 timestamp                             // 事件发生时间，Unix 毫秒
    4: string manifest_id                        // 事件发生时对应的 Manifest ID
    5: i64 manifest_version                      // 事件发生时对应的 Manifest 版本
    6: string scene_id                           // 关联场景 ID，没有则为空
    7: string slot_id                            // 关联槽位 ID，没有则为空
    8: string asset_id                           // 关联资源 ID，没有则为空
    9: string error_code                         // 错误码；非错误事件可为空
    10: string error_message                     // 错误详情；非错误事件可为空
    11: string extra_json                        // 扩展信息，JSON 字符串
}

/**
 * 本地 Player 状态。
 *
 * 说明：
 * 该结构用于 Player 本地持久化，不对应独立 HTTP 接口。
 */
struct LocalPlayerState {
    1: string device_id                          // 本地保存的设备 ID
    2: string access_token                       // 本地保存的访问 token
    3: i64 token_expire_at                       // token 过期时间，Unix 毫秒
    4: string current_manifest_id                // 当前正在使用的 Manifest ID
    5: i64 current_manifest_version              // 当前 Manifest 版本
    6: string last_good_manifest_id              // 最近一次完整可播放的 Manifest ID
    7: i64 last_success_sync_at                  // 最近一次成功同步 Manifest 的时间
    8: i64 last_boot_at                          // 最近一次启动时间
    9: bool offline_mode                         // 当前是否处于离线模式
}

/**
 * 本地缓存资源索引。
 *
 * 说明：
 * 该结构用于 Player 本地资源缓存管理，不对应独立 HTTP 接口。
 */
struct CachedAssetIndex {
    1: string asset_id                           // 资源 ID
    2: string local_path                         // 本地缓存路径
    3: string sha256                             // 本地文件 SHA256
    4: i64 size_bytes                            // 文件大小，单位 byte
    5: i64 downloaded_at                         // 下载完成时间，Unix 毫秒
    6: i64 last_used_at                          // 最近一次被播放或读取的时间，Unix 毫秒
    7: bool verified                             // 是否已通过完整性校验
    8: string manifest_id                        // 首次引入该资源的 Manifest ID
}

/**
 * 离线事件队列项。
 *
 * 说明：
 * 离线期间无法上报事件时，Player 将事件写入本地队列；
 * 网络恢复后通过 ReportPlayerEvents 接口批量补报。
 */
struct OfflineEventQueueItem {
    1: string queue_id                           // 本地队列项 ID
    2: string event_id                           // 对应 PlayerEvent 的事件 ID
    3: string payload_json                       // 原始事件内容，JSON 字符串
    4: i64 created_at                            // 队列项创建时间，Unix 毫秒
    5: i32 retry_count                           // 已重试次数
    6: i64 next_retry_at                         // 下次重试时间，Unix 毫秒
}


// ============================================================
// 6. Enum 定义
// ============================================================

/**
 * 设备平台类型。
 */
enum PlatformType {
    PLATFORM_UNKNOWN = 0,                        // 未知平台
    PLATFORM_ANDROID_TV = 1,                     // Android TV
    PLATFORM_RASPBERRY_PI = 2,                   // Raspberry Pi
    PLATFORM_WINDOWS_PC = 3,                     // Windows mini PC
    PLATFORM_WEBOS = 4,                          // LG webOS
    PLATFORM_TIZEN = 5,                          // Samsung Tizen
    PLATFORM_CHROMEOS = 6,                       // ChromeOS
}

/**
 * Manifest 更新类型。
 */
enum ManifestUpdateType {
    MANIFEST_UPDATE_UNKNOWN = 0,                 // 未知更新状态
    MANIFEST_NO_UPDATE = 1,                      // 没有更新，Player 继续使用本地 Manifest
    MANIFEST_FULL_UPDATE = 2,                    // 有完整新 Manifest，Player 需要下载资源并切换
    MANIFEST_FORCE_UPDATE = 3,                   // 强制更新，即使版本相同也要重新拉取和校验
}

/**
 * 前端内置模板 ID。
 */
enum TemplateId {
    TEMPLATE_UNKNOWN = 0,                        // 未知模板
    TEMPLATE_FULL_SCREEN_VIDEO = 1,              // 全屏视频模板
    TEMPLATE_FULL_SCREEN_IMAGE = 2,              // 全屏图片模板
    TEMPLATE_VIDEO_WITH_BOTTOM_TEXT = 3,         // 视频 + 底部文字模板
    TEMPLATE_VIDEO_WITH_SIDE_IMAGE = 4,          // 视频 + 右侧图片模板
    TEMPLATE_VIDEO_SIDE_IMAGE_BOTTOM_TEXT = 5,   // 视频 + 右侧图片 + 底部文字模板
}

/**
 * 模板槽位类型。
 */
enum SlotType {
    SLOT_UNKNOWN = 0,                            // 未知槽位类型
    SLOT_VIDEO = 1,                              // 视频槽位
    SLOT_IMAGE = 2,                              // 图片槽位
    SLOT_TEXT = 3,                               // 文本槽位
}

/**
 * 播放模式。
 */
enum PlayMode {
    PLAY_MODE_UNKNOWN = 0,                       // 未知播放模式
    PLAY_MODE_SEQUENCE = 1,                      // 顺序播放
    PLAY_MODE_LOOP = 2,                          // 循环播放，MVP 推荐
}

/**
 * 内容类型。
 */
enum ContentType {
    CONTENT_UNKNOWN = 0,                         // 未知内容类型
    CONTENT_ASSET = 1,                           // 资源内容，例如视频或图片
    CONTENT_TEXT = 2,                            // 文本内容
}

/**
 * 资源类型。
 */
enum AssetType {
    ASSET_UNKNOWN = 0,                           // 未知资源类型
    ASSET_VIDEO = 1,                             // 视频资源，例如 mp4
    ASSET_IMAGE = 2,                             // 图片资源，例如 png、jpg、webp
    ASSET_FONT = 3,                              // 字体资源，MVP 可选
}

/**
 * 播放状态。
 */
enum PlaybackState {
    PLAYBACK_UNKNOWN = 0,                        // 未知状态
    PLAYBACK_IDLE = 1,                           // 空闲状态
    PLAYBACK_LOADING = 2,                        // 加载中
    PLAYBACK_PLAYING = 3,                        // 播放中
    PLAYBACK_ERROR = 4,                          // 播放错误
    PLAYBACK_OFFLINE = 5,                        // 离线播放中
}

/**
 * 远程命令类型。
 */
enum CommandType {
    COMMAND_UNKNOWN = 0,                         // 未知命令
    COMMAND_SYNC_NOW = 1,                        // 立即同步 Manifest
    COMMAND_RELOAD_APP = 2,                      // 重新加载 Player App
    COMMAND_CLEAR_CACHE = 3,                     // 清理非当前 Manifest 使用的缓存
}

/**
 * Player 事件类型。
 */
enum EventType {
    EVENT_UNKNOWN = 0,                           // 未知事件
    EVENT_APP_STARTED = 1,                       // App 启动
    EVENT_LOCAL_MANIFEST_LOADED = 2,             // 成功加载本地 Manifest
    EVENT_LOCAL_MANIFEST_INVALID = 3,            // 本地 Manifest 无效
    EVENT_MANIFEST_SYNC_STARTED = 4,             // Manifest 同步开始
    EVENT_MANIFEST_SYNC_SUCCESS = 5,             // Manifest 同步成功
    EVENT_MANIFEST_SYNC_FAILED = 6,              // Manifest 同步失败
    EVENT_ASSET_DOWNLOAD_STARTED = 7,            // 资源下载开始
    EVENT_ASSET_DOWNLOAD_SUCCESS = 8,            // 资源下载成功
    EVENT_ASSET_DOWNLOAD_FAILED = 9,             // 资源下载失败
    EVENT_PLAYBACK_STARTED = 10,                 // 播放开始
    EVENT_PLAYBACK_ENDED = 11,                   // 播放结束
    EVENT_PLAYBACK_ERROR = 12,                   // 播放错误
    EVENT_OFFLINE_ENTERED = 13,                  // 进入离线模式
    EVENT_OFFLINE_EXITED = 14,                   // 退出离线模式
    EVENT_CACHE_CLEANED = 15,                    // 缓存清理完成
    EVENT_COMMAND_EXECUTED = 16,                 // 远程命令执行完成
}


// ============================================================
// 7. Service 定义
// ============================================================

/**
 * 视频播放器 MVP HTTP API Service。
 *
 * 说明：
 * 1. 所有接口统一收敛到 VideoPlayerAPIService。
 * 2. 使用 Hertz 风格 annotation：api.post = '/path'。
 * 3. 实际传输方式为 HTTP POST + JSON Body。
 */
service VideoPlayerAPIService {
    /**
     * 注册播放器设备。
     *
     * 设备首次启动时，本地没有 device_id 和 access_token，需要调用该接口注册。
     */
    RegisterPlayerResponse RegisterPlayer(1: RegisterPlayerRequest req) (api.post = '/api/v1/player/register') // 注册设备启动

    /**
     * 拉取当前设备播放 Manifest。
     *
     * Player 启动后、定时同步或收到 SYNC_NOW 命令时调用。
     */
    PullManifestResponse PullManifest(1: PullManifestRequest req) (api.post = '/api/v1/player/manifest/pull') // Manifest 拉取

    /**
     * 批量获取资源下载地址。
     *
     * Player 根据 Manifest 判断缺失资源后，调用该接口获取 CDN 或签名下载 URL。
     */
    BatchGetAssetUrlResponse BatchGetAssetUrl(1: BatchGetAssetUrlRequest req) (api.post = '/api/v1/assets/batch-url') // 获取资源下载地址

    /**
     * 心跳上报与健康监控。
     *
     * Player 周期性上报播放状态、设备健康状态、缓存状态和网络状态。
     * MVP 阶段，远程命令通过 HeartbeatResponse.data.commands 返回。
     */
    HeartbeatResponse Heartbeat(1: HeartbeatRequest req) (api.post = '/api/v1/player/heartbeat') // 心跳上报与监控

    /**
     * 上报播放器事件。
     *
     * 用于上报启动、Manifest 同步、资源下载、播放、离线、错误等事件。
     * 离线期间事件可先写本地队列，网络恢复后批量补报。
     */
    ReportPlayerEventsResponse ReportPlayerEvents(1: ReportPlayerEventsRequest req) (api.post = '/api/v1/player/events') // 事件上报

    /**
     * 上报远程命令执行结果。
     *
     * Player 执行 HeartbeatResponse.data.commands 中的远程命令后调用该接口。
     */
    CommandAckResponse CommandAck(1: CommandAckRequest req) (api.post = '/api/v1/player/commands/ack') // 远程命令 ACK
}
