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
  hero_sale: {
    asset_id: 'hero_sale',
    asset_type: 'ASSET_IMAGE',
    file_name: 'retail-summer-sale.svg',
    mime_type: 'image/svg+xml',
    size_bytes: 184000,
    duration_ms: 0,
    url: svgAsset('SUMMER DEALS', 'Up to 45% off today only', '#fb7185', '#f97316'),
  },
  hero_office: {
    asset_id: 'hero_office',
    asset_type: 'ASSET_IMAGE',
    file_name: 'office-announcement.svg',
    mime_type: 'image/svg+xml',
    size_bytes: 166000,
    duration_ms: 0,
    url: svgAsset('WELCOME TEAM', 'Quarterly townhall starts at 3:00 PM', '#2563eb', '#7c3aed'),
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
    asset_type: 'ASSET_IMAGE',
    file_name: 'cafe-menu.svg',
    mime_type: 'image/svg+xml',
    size_bytes: 152000,
    duration_ms: 0,
    url: svgAsset('LUNCH COMBO', 'Soup + Sandwich + Coffee', '#92400e', '#f59e0b'),
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
  version: 7,
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
  assets: Object.values(assetLibrary).map((asset, index) => ({
    asset_id: asset.asset_id,
    asset_type: asset.asset_type,
    file_name: asset.file_name,
    asset_ref: `mock://${asset.asset_id}`,
    mime_type: asset.mime_type,
    size_bytes: asset.size_bytes,
    sha256: `mock-sha-${asset.asset_id}`,
    duration_ms: asset.duration_ms,
    required: asset.asset_id !== 'fallback_brand',
    priority: 100 - index,
  })),
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
  checksum: 'mock-checksum-v7',
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
