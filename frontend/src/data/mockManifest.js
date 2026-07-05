import { playlistItems } from './playerRuntime';

const now = Date.now();

const svgAsset = (title, subtitle, startColor, endColor) =>
  `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${startColor}"/>
          <stop offset="100%" stop-color="${endColor}"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#06111f" flood-opacity="0.45"/>
        </filter>
      </defs>
      <rect width="1280" height="720" rx="42" fill="url(#g)"/>
      <circle cx="1060" cy="120" r="190" fill="#ffffff" opacity="0.12"/>
      <circle cx="180" cy="620" r="250" fill="#ffffff" opacity="0.08"/>
      <g filter="url(#shadow)">
        <text x="90" y="300" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="78" font-weight="800">${title}</text>
        <text x="94" y="388" fill="#dbeafe" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="500">${subtitle}</text>
      </g>
    </svg>
  `)}`;

export const assetLibrary = {
  lv_demo: {
    asset_id: 'lv_demo',
    asset_type: 'ASSET_VIDEO',
    file_name: 'lv.mp4',
    mime_type: 'video/mp4',
    size_bytes: 6_100_000,
    duration_ms: 18000,
    url: `${import.meta.env.BASE_URL}videos/lv.mp4`,
  },
  gucci_demo: {
    asset_id: 'gucci_demo',
    asset_type: 'ASSET_VIDEO',
    file_name: 'gucci-demo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 23_000_000,
    duration_ms: 20000,
    url: `${import.meta.env.BASE_URL}videos/gucci-demo.mp4`,
  },
  coca_cola_demo: {
    asset_id: 'coca_cola_demo',
    asset_type: 'ASSET_VIDEO',
    file_name: 'coca-cola-demo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 8_500_000,
    duration_ms: 20000,
    url: `${import.meta.env.BASE_URL}videos/coca-cola-demo.mp4`,
  },
  coca_cola_promo: {
    asset_id: 'coca_cola_promo',
    asset_type: 'ASSET_IMAGE',
    file_name: 'coca-cola-promo.png',
    mime_type: 'image/png',
    size_bytes: 420_000,
    duration_ms: 12000,
    url: `${import.meta.env.BASE_URL}images/coca-cola-promo.png`,
  },
  beijing_promo: {
    asset_id: 'beijing_promo',
    asset_type: 'ASSET_VIDEO',
    file_name: 'beijing-promo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 23_000_000,
    duration_ms: 25000,
    url: `${import.meta.env.BASE_URL}videos/beijing-promo.mp4`,
  },
  chanel_demo: {
    asset_id: 'chanel_demo',
    asset_type: 'ASSET_IMAGE',
    file_name: 'chanel-demo.png',
    mime_type: 'image/png',
    size_bytes: 420_000,
    duration_ms: 12000,
    url: `${import.meta.env.BASE_URL}images/chanel-demo.png`,
  },
  hero_sale: {
    asset_id: 'hero_sale',
    asset_type: 'ASSET_VIDEO',
    file_name: 'gucci-demo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 23_000_000,
    duration_ms: 20000,
    url: `${import.meta.env.BASE_URL}videos/gucci-demo.mp4`,
  },
  hero_office: {
    asset_id: 'hero_office',
    asset_type: 'ASSET_VIDEO',
    file_name: 'beijing-promo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 23_000_000,
    duration_ms: 25000,
    url: `${import.meta.env.BASE_URL}videos/beijing-promo.mp4`,
  },
  side_product: {
    asset_id: 'side_product',
    asset_type: 'ASSET_IMAGE',
    file_name: 'product-highlight.svg',
    mime_type: 'image/svg+xml',
    size_bytes: 122000,
    duration_ms: 0,
    url: svgAsset('NEW ARRIVAL', 'Fresh collection now in store', '#0f766e', '#14b8a6'),
  },
  cafe_menu: {
    asset_id: 'cafe_menu',
    asset_type: 'ASSET_VIDEO',
    file_name: 'coca-cola-demo.mp4',
    mime_type: 'video/mp4',
    size_bytes: 8_500_000,
    duration_ms: 20000,
    url: `${import.meta.env.BASE_URL}videos/coca-cola-demo.mp4`,
  },
  fallback_brand: {
    asset_id: 'fallback_brand',
    asset_type: 'ASSET_IMAGE',
    file_name: 'fallback-brand.svg',
    mime_type: 'image/svg+xml',
    size_bytes: 98000,
    duration_ms: 0,
    url: svgAsset('CONTENT SYNCING', 'Playing cached content safely', '#334155', '#0f172a'),
  },
};

export const mockManifest = {
  manifest_id: 'manifest_lobby_sg_001',
  version: 12,
  tenant_id: 'tenant_sme_demo',
  device_id: 'player_lobby_tv_01',
  location_id: 'orchard_lobby',
  valid_from: now - 60_000,
  valid_to: 0,
  ttl_sec: 86400,
  template_config: {
    template_id: 'TEMPLATE_VIDEO_SIDE_IMAGE_BOTTOM_TEXT',
    template_version: '1.0',
    design_width: 1920,
    design_height: 1080,
    slots: [
      { slot_id: 'main_carousel', slot_type: 'SLOT_IMAGE', required: true },
      { slot_id: 'side_panel', slot_type: 'SLOT_IMAGE', required: true },
      { slot_id: 'bottom_marquee', slot_type: 'SLOT_TEXT', required: true },
      { slot_id: 'logo', slot_type: 'SLOT_IMAGE', required: false },
      { slot_id: 'clock', slot_type: 'SLOT_TEXT', required: false },
    ],
  },
  playback_plan: {
    plan_id: 'plan_lobby_all_day',
    play_mode: 'PLAY_MODE_LOOP',
    scenes: [
      {
        scene_id: 'scene_promo',
        scene_name: 'Retail Promotion',
        duration_ms: 9000,
        order: 1,
        slot_bindings: [
          {
            slot_id: 'main_carousel',
            content_type: 'CONTENT_ASSET',
            asset_id: 'hero_sale',
            display_policy: { object_fit: 'cover', muted: true, loop: true },
          },
          {
            slot_id: 'side_panel',
            content_type: 'CONTENT_ASSET',
            asset_id: 'side_product',
            display_policy: { object_fit: 'cover', muted: true, loop: true },
          },
          {
            slot_id: 'bottom_marquee',
            content_type: 'CONTENT_TEXT',
            text: 'Flash sale live now • Members get extra rewards • Visit counter A for today-only bundles',
            display_policy: { object_fit: 'contain', muted: true, loop: true },
          },
        ],
      },
      {
        scene_id: 'scene_office',
        scene_name: 'Office Broadcast',
        duration_ms: 8000,
        order: 2,
        slot_bindings: [
          {
            slot_id: 'main_carousel',
            content_type: 'CONTENT_ASSET',
            asset_id: 'hero_office',
            display_policy: { object_fit: 'cover', muted: true, loop: true },
          },
          {
            slot_id: 'side_panel',
            content_type: 'CONTENT_ASSET',
            asset_id: 'cafe_menu',
            display_policy: { object_fit: 'cover', muted: true, loop: true },
          },
          {
            slot_id: 'bottom_marquee',
            content_type: 'CONTENT_TEXT',
            text: 'Townhall at 3 PM • Visitor Wi-Fi: Guest-Lobby • Keep emergency exits clear',
            display_policy: { object_fit: 'contain', muted: true, loop: true },
          },
        ],
      },
    ],
  },
  assets: [
    ...playlistItems.map((item, index) => {
      const asset = assetLibrary[item.assetId];
      return {
        asset_id: item.assetId,
        asset_type: item.type === 'video' ? 'ASSET_VIDEO' : 'ASSET_IMAGE',
        file_name: item.fileName,
        asset_ref: item.videoUrl || item.imageUrl,
        mime_type: item.type === 'video' ? 'video/mp4' : 'image/png',
        size_bytes: asset?.size_bytes || (item.type === 'video' ? 18_000_000 : 420_000),
        sha256: `mock-sha-${item.assetId}`,
        duration_ms: item.durationSec * 1000,
        required: true,
        priority: 100 - index,
      };
    }),
    {
      asset_id: 'fallback_brand',
      asset_type: 'ASSET_IMAGE',
      file_name: 'fallback-brand.svg',
      asset_ref: 'mock://fallback_brand',
      mime_type: 'image/svg+xml',
      size_bytes: assetLibrary.fallback_brand.size_bytes,
      sha256: 'mock-sha-fallback_brand',
      duration_ms: 0,
      required: false,
      priority: 1,
    },
  ],
  cache_policy: {
    max_cache_size_mb: 512,
    min_free_storage_mb: 256,
    allow_delete_unused_assets: true,
  },
  fallback_policy: {
    fallback_asset_id: 'fallback_brand',
    fallback_text: 'Content temporarily unavailable',
    max_retry_count: 3,
    retry_interval_sec: 10,
    loop_last_good_manifest: true,
    show_black_screen_allowed: false,
  },
  checksum: 'mock-checksum-v12',
  generated_at: now,
};

export const emergencyScene = {
  scene_id: 'scene_emergency',
  scene_name: 'Emergency Override',
  duration_ms: 15000,
  order: 0,
  slot_bindings: [
    {
      slot_id: 'main_carousel',
      content_type: 'CONTENT_TEXT',
      text: 'EMERGENCY ALERT',
      display_policy: { object_fit: 'cover', muted: true, loop: true },
    },
    {
      slot_id: 'side_panel',
      content_type: 'CONTENT_TEXT',
      text: 'Please follow staff instructions and proceed calmly.',
      display_policy: { object_fit: 'contain', muted: true, loop: true },
    },
    {
      slot_id: 'bottom_marquee',
      content_type: 'CONTENT_TEXT',
      text: 'Emergency override content pushed instantly • This message has priority over scheduled playback',
      display_policy: { object_fit: 'contain', muted: true, loop: true },
    },
  ],
};
