export const playlistItems = [
  {
    id: 'lv_demo',
    fileName: 'lv.mp4',
    assetId: 'lv_demo',
    videoUrl: 'videos/lv.mp4',
    posterUrl: 'images/lv-poster.png',
    layoutId: 'luxury-hero-clock',
    durationSec: 18,
    type: 'video',
    title: 'Louis Vuitton Campaign',
    marquee: 'Louis Vuitton campaign playback • Luxury hero layout • Window display rotation',
  },
  {
    id: 'gucci_demo',
    fileName: 'gucci-demo.mp4',
    assetId: 'gucci_demo',
    videoUrl: 'videos/gucci-demo.mp4',
    layoutId: 'hero-fullscreen',
    durationSec: 20,
    type: 'video',
    title: 'Gucci Demo',
    marquee: 'Gucci campaign playback • Window display mode • Premium hero fullscreen layout',
  },
  {
    id: 'coca_cola_demo',
    fileName: 'coca-cola-demo.mp4',
    assetId: 'coca_cola_demo',
    videoUrl: 'videos/coca-cola-demo.mp4',
    sideBannerUrl: 'images/coca-cola-promo.png',
    layoutId: 'promo-multi-zone',
    durationSec: 20,
    type: 'video',
    title: 'Coca-Cola Demo',
    marquee: 'Refresh campaign is live • Scan QR for promotion coupons • Multi-zone layout',
  },
  {
    id: 'coca_cola_promo',
    fileName: 'coca-cola-promo.png',
    imageUrl: 'images/coca-cola-promo.png',
    assetId: 'coca_cola_promo',
    sideBannerUrl: 'images/coca-cola-promo.png',
    layoutId: 'promo-multi-zone',
    durationSec: 12,
    type: 'image',
    title: 'Coca-Cola Promo Poster',
    marquee: 'Buy 4 selected Coca-Cola products • Get limited color-changing cup set • 7-Eleven promotion',
  },
  {
    id: 'beijing_promo',
    fileName: 'beijing-promo.mp4',
    assetId: 'beijing_promo',
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
    assetId: 'chanel_demo',
    sideBannerUrl: 'images/chanel-side-promo.png',
    layoutId: 'brand-split',
    durationSec: 12,
    type: 'image',
    title: 'Chanel Campaign',
    marquee: 'CHANEL perfume campaign • Brand wall layout • Luxury retail showcase',
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
      { id: 'media', component: 'Carousel', x: 0, y: 0, width: 1920, height: 1080 },
      { id: 'clock', component: 'Clock', x: 1540, y: 42, width: 310, height: 88 },
      { id: 'marquee', component: 'Marquee', x: 48, y: 964, width: 1824, height: 72 },
    ],
  },
  'luxury-hero-clock': {
    name: 'Luxury Hero With Clock',
    zones: [
      { id: 'media', component: 'Carousel', x: 0, y: 0, width: 1920, height: 1080 },
      { id: 'logo', component: 'Logo', x: 56, y: 46, width: 390, height: 86 },
      { id: 'clock', component: 'Clock', x: 1510, y: 46, width: 350, height: 92 },
      { id: 'marquee', component: 'Marquee', x: 60, y: 958, width: 1800, height: 76 },
    ],
  },
  'promo-multi-zone': {
    name: 'Multi-zone Promotion Layout',
    zones: [
      { id: 'media', component: 'Carousel', x: 40, y: 172, width: 1300, height: 766 },
      { id: 'promotion', component: 'Promotion', x: 1370, y: 172, width: 510, height: 766 },
      { id: 'clock', component: 'Clock', x: 1538, y: 44, width: 320, height: 88 },
      { id: 'marquee', component: 'Marquee', x: 40, y: 966, width: 1840, height: 78 },
    ],
  },
  'cinema-clock': {
    name: 'Cinema With Clock Overlay',
    zones: [
      { id: 'media', component: 'Carousel', x: 0, y: 0, width: 1920, height: 1080 },
      { id: 'clock', component: 'Clock', x: 1500, y: 50, width: 340, height: 92 },
      { id: 'marquee', component: 'Marquee', x: 64, y: 958, width: 1792, height: 76 },
    ],
  },
  'brand-split': {
    name: 'Brand Split Showcase',
    zones: [
      { id: 'media', component: 'Carousel', x: 50, y: 170, width: 1180, height: 760 },
      { id: 'promotion', component: 'Promotion', x: 1260, y: 170, width: 610, height: 760 },
      { id: 'clock', component: 'Clock', x: 1516, y: 48, width: 340, height: 88 },
      { id: 'marquee', component: 'Marquee', x: 50, y: 960, width: 1820, height: 76 },
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
