export const playlistItems = [
  {
    id: 'lv_demo',
    fileName: 'lv-demo.mp4',
    assetId: 'hero_sale',
    videoUrl: 'videos/lv-demo.mp4',
    layoutId: 'hero-fullscreen',
    durationSec: 20,
    type: 'video',
    title: 'LV Demo',
    marquee: 'Luxury campaign playback • Window display mode • Premium launch video',
  },
  {
    id: 'coca_cola_demo',
    fileName: 'coca-cola-demo.mp4',
    assetId: 'cafe_menu',
    videoUrl: 'videos/coca-cola-demo.mp4',
    layoutId: 'promo-multi-zone',
    durationSec: 20,
    type: 'video',
    title: 'Coca-Cola Demo',
    marquee: 'Refresh campaign is live • Scan QR for promotion coupons • Multi-zone layout',
  },
  {
    id: 'beijing_promo',
    fileName: 'beijing-promo.mp4',
    assetId: 'hero_office',
    videoUrl: 'videos/beijing-promo.mp4',
    layoutId: 'cinema-clock',
    durationSec: 25,
    type: 'video',
    title: 'Beijing Promo',
    marquee: 'Beijing city campaign • Cultural travel highlights • Full cinematic playback',
  },
  {
    id: 'chanel_demo',
    fileName: 'chanel-demo.png',
    imageUrl: 'images/chanel-demo.png',
    assetId: 'hero_sale',
    layoutId: 'brand-split',
    durationSec: 12,
    type: 'image',
    title: 'Chanel Campaign',
    marquee: 'CHANEL perfume campaign • Brand wall layout • Luxury retail showcase',
  },
  {
    id: 'lunch_menu',
    fileName: 'lunch_menu.png',
    assetId: 'side_product',
    layoutId: 'promo-multi-zone',
    durationSec: 12,
    type: 'image',
    title: 'Lunch Menu',
    marquee: 'Lunch menu is live • Scan QR for member coupons • Limited seats available',
  },
  {
    id: 'qr_code_banner',
    fileName: 'qr_code_banner.png',
    assetId: 'hero_office',
    layoutId: 'promo-multi-zone',
    durationSec: 15,
    type: 'image',
    title: 'QR Code Banner',
    marquee: 'Scan QR for member coupons • Layout driven by zones and components',
  },
];

export const scheduleSlots = [
  {
    id: 'breakfast',
    label: 'Breakfast Layout',
    start: '10:00',
    end: '11:00',
    layoutId: 'hero-fullscreen',
    marquee: 'Breakfast combo available until 11:00 • Fresh coffee and bakery deals',
  },
  {
    id: 'lunch',
    label: 'Lunch Layout',
    start: '11:00',
    end: '14:00',
    layoutId: 'promo-multi-zone',
    marquee: 'Lunch menu is live • Scan QR for member coupons • Limited seats available',
  },
  {
    id: 'tea',
    label: 'Tea Break Layout',
    start: '14:00',
    end: '17:00',
    layoutId: 'brand-split',
    marquee: 'Tea break special • Buy 1 get 1 pastries from 3 PM to 5 PM',
  },
];

export const layoutTemplates = {
  'hero-fullscreen': {
    name: 'Hero Fullscreen Video',
    zones: [
      { id: 'media', component: 'Carousel', x: 24, y: 24, width: 1872, height: 912 },
      { id: 'logo', component: 'Logo', x: 54, y: 48, width: 340, height: 92 },
      { id: 'clock', component: 'Clock', x: 1520, y: 48, width: 330, height: 92 },
      { id: 'marquee', component: 'Marquee', x: 54, y: 960, width: 1812, height: 78 },
    ],
  },
  'promo-multi-zone': {
    name: 'Multi-zone Promotion Layout',
    zones: [
      { id: 'logo', component: 'Logo', x: 40, y: 34, width: 420, height: 110 },
      { id: 'clock', component: 'Clock', x: 1480, y: 34, width: 400, height: 110 },
      { id: 'media', component: 'Carousel', x: 40, y: 172, width: 1300, height: 766 },
      { id: 'promotion', component: 'Promotion', x: 1370, y: 172, width: 510, height: 766 },
      { id: 'marquee', component: 'Marquee', x: 40, y: 966, width: 1840, height: 78 },
    ],
  },
  'cinema-clock': {
    name: 'Cinema With Clock Overlay',
    zones: [
      { id: 'media', component: 'Carousel', x: 0, y: 0, width: 1920, height: 1080 },
      { id: 'clock', component: 'Clock', x: 1490, y: 48, width: 360, height: 100 },
      { id: 'marquee', component: 'Marquee', x: 80, y: 960, width: 1760, height: 74 },
    ],
  },
  'brand-split': {
    name: 'Brand Split Showcase',
    zones: [
      { id: 'logo', component: 'Logo', x: 50, y: 46, width: 380, height: 92 },
      { id: 'media', component: 'Carousel', x: 50, y: 170, width: 1180, height: 760 },
      { id: 'promotion', component: 'Promotion', x: 1260, y: 170, width: 610, height: 760 },
      { id: 'clock', component: 'Clock', x: 1480, y: 46, width: 390, height: 92 },
      { id: 'marquee', component: 'Marquee', x: 50, y: 966, width: 1820, height: 78 },
    ],
  },
};

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
