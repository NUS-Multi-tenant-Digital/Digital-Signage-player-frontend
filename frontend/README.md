# Digital Signage Player Frontend

这是一个面向数字标牌 Player 端的 React MVP。当前版本聚焦边缘设备播放器的可靠播放能力：拉取播放计划、缓存资源、离线继续播放、上报心跳和模拟远程指令。

## 代码功能实现及边界

### 已实现

1. 设备启动注册：启动时模拟调用 `RegisterPlayer`，生成设备身份、租户、点位和基础配置。
2. Manifest 同步：通过 Mock `PullManifest` 拉取播放计划，按 `PlaybackScene` 顺序循环播放。
3. 资源缓存：通过 Mock `BatchGetAssetUrl` 获取资源地址，并用 `localStorage` 模拟本地缓存索引。
4. 离线播放：断网或手动模拟离线时，继续播放本地 last good manifest。
5. 网络恢复补报：离线期间事件写入本地队列，恢复在线后通过 Mock `ReportPlayerEvents` 补报。
6. 心跳上报：周期性模拟 `Heartbeat`，上报播放状态、缓存状态、设备健康和网络状态。
7. 远程命令：支持模拟 `SYNC_NOW`、清理缓存和紧急覆盖内容，并通过 Mock `CommandAck` 回执。
8. 播放组件：包含主视觉 Carousel、底部 Marquee、Logo、Clock、状态监控面板和演示控制面板。
9. 紧急覆盖：模拟实时推送高优先级内容，临时覆盖当前排期，结束后回到正常播放。

### 当前边界

1. 当前没有真实后端请求，所有接口都在 `src/services/mockPlayerApi.js` 中 Mock。
2. 当前没有真实文件下载，资源缓存用 `localStorage` 中的缓存索引和 data URL 模拟。
3. 当前未接入 WebSocket、MQTT 或 SSE，实时命令通过按钮模拟。
4. 当前未实现后台可视化 Layout DSL，使用前端固定 Template + Manifest SlotBinding。
5. 当前只覆盖 MVP 播放可靠性流程，不包含内容管理、排期编辑、设备分组、权限管理等后台功能。
6. 当前没有真实多端适配打包，仅以浏览器/Vite 方式模拟 Android TV、Raspberry Pi、Windows mini PC 等 Player 运行效果。

## 运行方式

### 安装依赖

```bash
cd /Users/a1-6/InternshipProject/video_player_mvp/frontend
npm install
```

### 本地开发

```bash
npm run dev
```

启动后打开 Vite 输出的本地地址即可查看播放器演示，例如：

```text
http://localhost:5173/
```

### 直接用浏览器打开

```bash
npm run build
```

构建完成后，直接用浏览器打开下面这个文件即可离线查看 Web 版播放器：

```text
/Users/a1-6/InternshipProject/video_player_mvp/frontend/dist/index.html
```

本项目已在 `vite.config.js` 中设置 `base: './'`，构建后的 JS/CSS 会使用相对路径，因此 `dist/index.html` 可以通过浏览器直接打开，不依赖本地 dev server。

### 本地预览构建产物

```bash
npm run preview
```

## 演示操作

页面分为两个视图：

1. `Player Screen`：纯播放器画面，只负责展示 Schedule / Playlist / Layout Engine 渲染后的数字标牌内容。
2. `Monitoring Platform`：监控与运维平台，包含远程操作按钮、设备状态、播放进度、缓存健康和事件日志。

操作按钮已从播放器画面中抽离到 `Monitoring Platform`。监控平台用于模拟生产环境事件：

1. `模拟首次未绑定`：展示首次启动时没有绑定设备，显示 Activation Code 并等待后台绑定。
2. `拉取 Manifest`：模拟 Player 拉取、校验、加载资源并渲染 Layout。
3. `快进到 11:00`：模拟 Schedule 到点自动从 Breakfast Layout 切换到 Lunch Layout。
4. `发布新 Manifest`：模拟后台发布 v12 -> v13，Player 下载资源、校验 checksum 并安全切换。
5. `模拟离线`：网络断开后继续使用 Last Known Good Manifest 和本地缓存播放。
6. `恢复联网并同步`：恢复网络后自动检查最新 Manifest、补报播放日志并同步云端状态。
7. `模拟远程 SYNC_NOW`：模拟 Heartbeat 返回远程同步命令。
8. `清理缓存`：清空本地缓存索引，后续同步时重新缓存必需资源。
9. `模拟下载失败`：模拟新媒体下载或 checksum 失败，保持当前 Manifest 不黑屏。
10. `触发 Safe Mode`：模拟 Layout JSON 错误或组件渲染失败，加载 Fallback Layout。
11. `恢复正常播放`：从 Safe Mode 回到正常播放。
12. `紧急覆盖推送`：模拟紧急通知内容立即覆盖当前排期。

监控状态面板展示设备身份、在线状态、Manifest 版本、当前 Schedule、当前 Layout、Playlist 当前/下一媒体、播放进度、缓存健康、Safe Mode 状态和事件日志。

## User Case 说明

### Case 1：Player 启动与设备身份识别

展示 Player 打开后的启动流程，强调 Player 不是普通网页，而是一个被后台管理的独立屏幕设备。

已绑定设备流程：

```text
Player App Launch
→ Device ID detected
→ Authenticate with device token
→ Fetch assigned manifest
→ Start playback
```

首次启动流程：

```text
No device bound
→ Show Activation Code
→ Waiting for screen binding
```

Demo UI 会展示：

```text
Device ID: SCREEN-001
Status: Connecting... / Authenticated
Activation Code: A7K9Q2
```

### Case 2：正常拉取 Manifest 并渲染页面

这是核心播放 Case，展示 Player 成功从服务端拿到当前播放配置后，渲染出完整 signage 画面。

流程：

```text
Fetch Manifest
→ Validate Manifest
→ Load Media Assets
→ Render Layout
→ Start Playback
```

画面中会体现：

1. Layout Renderer
2. Media Player
3. Marquee
4. Clock
5. Logo
6. Carousel / Video

### Case 3：多区域 Layout 渲染

该 Case 专门展示 Layout Engine，说明播放器可以通过 Layout JSON 驱动多个 Region 的组合渲染，而不是写死页面结构。

当前 Demo 准备了 2 套 Layout：

1. `Layout A: Fullscreen Video`：全屏主视觉媒体，加顶部 Logo/Clock 和底部 Marquee 覆盖层。
2. `Layout B: Multi-zone Promotion`：顶部 Logo/Clock、主区域 Carousel、侧边 QR/Promotion、底部 Marquee。

重点展示：

1. Region 按 `x / y / width / height` 定位。
2. 不同 Component 可以组合到同一个屏幕。
3. Layout JSON 可以驱动页面渲染。

### Case 4：Playlist 自动轮播

播放器内置 Playlist 运行状态，会按照媒体顺序和时长自动切换：

```text
1. gucci-demo.mp4          20s
2. coca-cola-demo.mp4      20s
3. coca-cola-promo.png     12s
4. beijing-promo.mp4       25s
5. chanel-demo.png         12s
```

Demo 会展示：

```text
Current Media: gucci-demo.mp4
Next Media: coca-cola-demo.mp4
Progress: 12 / 20s
```

每个 Playlist item 可以绑定不同的 `layoutId`，播放器会通过 Layout Engine 切换模板，而不是固定页面结构。

### Layout Engine：Zone + Component

当前 Web Player 使用 Layout Engine 渲染页面。核心模型是：

```text
Layout Template
→ Zones by x / y / width / height
→ Component mounted in each Zone
→ Schedule / Playlist selects template
→ Player renders final screen
```

每个 Zone 可以挂载不同 Component：

1. `Logo`：品牌和设备身份。
2. `Carousel`：视频、图片或混合媒体播放。
3. `Marquee`：底部或区域滚动文字。
4. `Clock`：数字时钟。
5. `Promotion`：QR Code、促销信息、侧边广告。

当前内置模板：

1. `Hero Fullscreen Video`：主视频全屏，叠加 Logo、Clock、Marquee。
2. `Multi-zone Promotion Layout`：顶部 Logo/Clock，主区域视频，侧边 QR/Promotion，底部 Marquee。
3. `Cinema With Clock Overlay`：北京宣传片等沉浸式视频模板。
4. `Brand Split Showcase`：Chanel 图片等品牌分区展示模板。

### Case 5：Schedule 自动切换内容

播放器根据当前时间执行 Schedule，不需要人工刷新：

```text
10:00 - 11:00 Breakfast Layout
11:00 - 14:00 Lunch Layout
14:00 - 17:00 Tea Break Layout
```

点击 `快进到 11:00` 后，播放器会自动切换到 Lunch Layout。

### Case 6：内容更新后自动刷新

点击 `发布新 Manifest` 后，播放器模拟：

```text
New Manifest Available: v12 -> v13
Downloading new assets...
Verifying checksum...
Switching to new layout...
```

该流程体现 Manifest version change、delta sync、media download、checksum validation 和 safe switch。

### Case 7：离线模式继续播放

点击 `模拟离线` 后，播放器不会黑屏，会继续播放缓存内容：

```text
Network Offline
Using Last Known Good Manifest: v12
Playback continues from local cache
```

### Case 8：恢复联网后自动同步

点击 `恢复联网并同步` 后，播放器模拟：

```text
Network restored
Player checks latest manifest
Upload queued playback logs
Sync latest content
Status: Online
```

### Case 9：媒体下载失败 / 损坏时不黑屏

点击 `模拟下载失败` 后，播放器会保持当前可用版本：

```text
Download failed. Keeping current manifest v12.
Retry scheduled in 60 seconds.
```

### Case 10：Fallback Layout / Safe Mode

点击 `触发 Safe Mode` 后，播放器加载安全兜底画面：

```text
Invalid layout detected
→ Load fallback layout
→ Content temporarily unavailable
→ Device is recovering...
```

## 技术组件

### 核心技术栈

1. React：前端组件和状态渲染。
2. JavaScript：当前 MVP 未使用 TypeScript，便于快速演示和迭代。
3. Vite：本地开发服务器、构建和预览。
4. lucide-react：状态面板和控制按钮图标。
5. CSS：自定义大屏视觉、动画、玻璃拟态面板和响应式基础布局。
6. localStorage：模拟 Player 端持久化，包括设备状态、last good manifest、缓存索引和离线事件队列。

### 主要模块

1. `src/App.jsx`：应用入口布局，组合播放区、控制区和状态面板。
2. `src/hooks/usePlayerEngine.js`：Player 核心状态机，负责注册、同步、缓存、离线、心跳和命令处理。
3. `src/services/mockPlayerApi.js`：Mock Hertz API 层，后续真实接口接入优先替换此文件。
4. `src/data/mockManifest.js`：Mock Manifest、资源库和紧急场景数据。
5. `src/components/PlayerApplicationScreen.jsx`：真实 Player 运行主屏，包含启动、激活、播放、Safe Mode、同步覆盖层。
6. `src/components/Marquee.jsx`：跑马灯组件，支持方向、速度、字体和背景配置。
7. `src/components/ClockWidget.jsx`：数字/模拟时钟组件，支持时区、12/24 小时制和日期显示。
8. `src/components/StatusPanel.jsx`：设备运行状态、缓存、心跳、Playlist、Schedule、Safe Mode 和事件日志展示。
9. `src/components/ControlPanel.jsx`：本地演示控制台，用于触发离线、恢复、Manifest 更新、下载失败和 Safe Mode。
10. `src/data/playerRuntime.js`：Playlist、Schedule、启动流程和 Manifest 同步流程数据。
11. `src/utils/storage.js`：本地 JSON 读写工具。

## 目录结构

```text
frontend/
├── index.html
├── package.json
├── README.md
├── public/
│   ├── images/
│   │   ├── chanel-demo.png
│   │   ├── chanel-side-promo.png
│   │   └── coca-cola-promo.png
│   └── videos/
│       ├── gucci-demo.mp4
│       ├── coca-cola-demo.mp4
│       └── beijing-promo.mp4
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── styles.css
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── services/
│   └── utils/
└── dist/
```

`node_modules/` 为依赖安装目录，未在上方结构中展开。

## 后续迭代

1. 接入真实后端 HTTP API，替换 `src/services/mockPlayerApi.js` 中的 Mock 函数。
2. 增加真实资源下载、校验和本地文件缓存，完善缓存淘汰策略。
3. 引入 WebSocket、MQTT 或 SSE，实现真实实时命令和紧急覆盖推送。
4. 扩展 Layout Template，支持更多屏幕比例、分屏模板和动态配置项。
5. 增加视频播放失败重试、资源 fallback、黑屏保护和 watchdog。
6. 增加设备端日志、错误码、性能指标和远程诊断能力。
7. 增加单元测试、组件测试和端到端播放稳定性测试。
8. 增加平台适配：Android TV、Raspberry Pi、Windows mini PC、webOS、Tizen、ChromeOS。
9. 增加离线包预下载、灰度发布、版本回滚和 Player 自动更新流程。
10. 后续可考虑使用 TypeScript 固化 Manifest、Command、Heartbeat 等数据结构。

## 接入真实接口建议

真实后端接入时建议保持 `src/services/mockPlayerApi.js` 中的函数签名不变：

1. `RegisterPlayer`
2. `PullManifest`
3. `BatchGetAssetUrl`
4. `Heartbeat`
5. `ReportPlayerEvents`
6. `CommandAck`

这样 `usePlayerEngine` 和 UI 组件无需大改，只需要把 Mock 返回替换为真实 HTTP 请求，并保持响应结构兼容 `idl/` 中定义的 `data + base_resp` 格式。
