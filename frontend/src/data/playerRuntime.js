export const playlistItems = [
  {
    id: 'lv_demo',
    fileName: 'lv-demo.mp4',
    assetId: 'hero_sale',
    videoUrl: 'videos/lv-demo.mp4',
    durationSec: 20,
    type: 'video',
    title: 'LV Demo',
  },
  {
    id: 'coca_cola_demo',
    fileName: 'coca-cola-demo.mp4',
    assetId: 'cafe_menu',
    videoUrl: 'videos/coca-cola-demo.mp4',
    durationSec: 20,
    type: 'video',
    title: 'Coca-Cola Demo',
  },
  {
    id: 'lunch_menu',
    fileName: 'lunch_menu.png',
    assetId: 'side_product',
    durationSec: 12,
    type: 'image',
    title: 'Lunch Menu',
  },
  {
    id: 'qr_code_banner',
    fileName: 'qr_code_banner.png',
    assetId: 'hero_office',
    durationSec: 15,
    type: 'image',
    title: 'QR Code Banner',
  },
];

export const scheduleSlots = [
  {
    id: 'breakfast',
    label: 'Breakfast Layout',
    start: '10:00',
    end: '11:00',
    layoutId: 'fullscreen',
    marquee: 'Breakfast combo available until 11:00 • Fresh coffee and bakery deals',
  },
  {
    id: 'lunch',
    label: 'Lunch Layout',
    start: '11:00',
    end: '14:00',
    layoutId: 'multi-zone',
    marquee: 'Lunch menu is live • Scan QR for member coupons • Limited seats available',
  },
  {
    id: 'tea',
    label: 'Tea Break Layout',
    start: '14:00',
    end: '17:00',
    layoutId: 'multi-zone',
    marquee: 'Tea break special • Buy 1 get 1 pastries from 3 PM to 5 PM',
  },
];

export const bootSteps = [
  'Player App Launch',
  'Device ID detected',
  'Authenticate with device token',
  'Fetch assigned manifest',
  'Start playback',
];

export const manifestSyncSteps = [
  'Fetch Manifest',
  'Validate Manifest',
  'Load Media Assets',
  'Render Layout',
  'Start Playback',
];
