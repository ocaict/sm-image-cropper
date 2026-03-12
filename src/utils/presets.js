export const platforms = [
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#ff0000',
    presets: [
      { id: 'yt-thumb', name: 'Thumbnail', width: 1280, height: 720 },
      { id: 'yt-banner', name: 'Channel Banner', width: 2560, height: 1440 },
      { id: 'yt-profile', name: 'Profile', width: 800, height: 800 },
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877f2',
    presets: [
      { id: 'fb-post', name: 'Post', width: 1200, height: 630 },
      { id: 'fb-profile', name: 'Profile', width: 170, height: 170 },
      { id: 'fb-cover', name: 'Cover', width: 820, height: 312 },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#e4405f',
    presets: [
      { id: 'ig-square', name: 'Square Post', width: 1080, height: 1080 },
      { id: 'ig-portrait', name: 'Portrait', width: 1080, height: 1350 },
      { id: 'ig-landscape', name: 'Landscape', width: 1080, height: 566 },
      { id: 'ig-story', name: 'Story', width: 1080, height: 1920 },
    ],
  },
  {
    id: 'facebook-ads',
    name: 'Facebook Ads',
    color: '#1877f2',
    presets: [
      { id: 'fb-feed-sq', name: 'Feed Square', width: 1080, height: 1080 },
      { id: 'fb-feed-land', name: 'Feed Landscape', width: 1200, height: 628 },
      { id: 'fb-story', name: 'Story', width: 1080, height: 1920 },
      { id: 'fb-carousel', name: 'Carousel', width: 1080, height: 1080 },
      { id: 'fb-reel', name: 'Reel', width: 1080, height: 1920 },
      { id: 'fb-right-col', name: 'Right Column', width: 1200, height: 628 },
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#00f2ea',
    presets: [
      { id: 'tt-profile', name: 'Profile', width: 200, height: 200 },
      { id: 'tt-video', name: 'Video', width: 1080, height: 1920 },
    ],
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    color: '#000000',
    presets: [
      { id: 'tw-post', name: 'Post', width: 1200, height: 675 },
      { id: 'tw-profile', name: 'Profile', width: 400, height: 400 },
      { id: 'tw-header', name: 'Header', width: 1500, height: 500 },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0a66c2',
    presets: [
      { id: 'li-post', name: 'Post', width: 1200, height: 627 },
      { id: 'li-profile', name: 'Profile', width: 400, height: 400 },
      { id: 'li-cover', name: 'Cover', width: 1584, height: 396 },
      { id: 'li-banner', name: 'Banner', width: 1128, height: 191 },
    ],
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    color: '#e60023',
    presets: [
      { id: 'pin-std', name: 'Standard', width: 1000, height: 1500 },
      { id: 'pin-long', name: 'Long Pin', width: 1000, height: 2100 },
      { id: 'pin-square', name: 'Square', width: 1000, height: 1000 },
    ],
  },
];

export const commonSizes = [
  { id: '1080p', name: '1080p', width: 1920, height: 1080 },
  { id: '720p', name: '720p', width: 1280, height: 720 },
  { id: '480p', name: '480p', width: 854, height: 480 },
  { id: '4k', name: '4K', width: 3840, height: 2160 },
  { id: 'sq1', name: '1:1', width: 1080, height: 1080 },
  { id: 'port4', name: '4:5', width: 1080, height: 1350 },
  { id: 'land19', name: '1.91:1', width: 1200, height: 630 },
  { id: 'story9', name: '9:16', width: 1080, height: 1920 },
];

export const aspectRatios = [
  { id: '16:9', label: '16:9', ratio: 16/9 },
  { id: '4:3', label: '4:3', ratio: 4/3 },
  { id: '1:1', label: '1:1', ratio: 1 },
  { id: '4:5', label: '4:5', ratio: 4/5 },
  { id: '9:16', label: '9:16', ratio: 9/16 },
  { id: '2:3', label: '2:3', ratio: 2/3 },
];

export const getAspectRatio = (width, height) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
};
