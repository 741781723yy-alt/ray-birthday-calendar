/**
 * 资源预加载工具
 * 启动页全量预加载（图片 + 视频）+ 按天预加载
 */
import { asset } from './assets';

/* 每天的全部资源（背景 + 装饰 + 动画素材） */
const DAY_ASSETS: Record<number, string[]> = {
  1: [
    '/child-room-night.webp',
    '/cat-orange-sleeping.webp',
    '/cat-greywhite-playing.webp',
    '/medal-brave.webp',
  ],
  2: [
    '/classroom-day.webp',
    '/ipod-handdrawn.webp',
    '/album-cover-1.webp',
    '/album-cover-2.webp',
  ],
  3: [
    '/university-campus.webp',
  ],
  4: [
    '/shanghai-street.webp',
    '/person1.webp',
    '/person2.webp',
  ],
  5: [
    '/leeds-scene.webp',
  ],
  6: [
    '/office-scene.webp',
    '/scrapbook-cover.webp',
    ...Array.from({ length: 5 }, (_, i) => `/photos/day6/spread-${i + 1}.webp`),
    '/photos/day6/page1-birthday.webp',
    '/photos/day6/page1-ikea-icecream.webp',
    '/photos/day6/page1-ikea-shopping.webp',
    '/photos/day6/page1-moving.webp',
  ],
  7: [
    '/girls-illustration.webp',
    ...Array.from({ length: 35 }, (_, i) => `/photos/day7/photo-${i + 1}.webp`),
    ...Array.from({ length: 35 }, (_, i) => `/photos/day7/thumb/photo-${i + 1}.webp`),
  ],
  8: [
    '/Geburtstag.webp',
  ],
  9: [],
  10: [
    '/Geburtstag.webp',
  ],
  11: [
    '/assets/envelope-closed.webp',
    '/assets/envelope-open.webp',
  ],
  12: [
    '/Geburtstag.webp',
  ],
};

/* 首页需要的资源 */
const HOME_ASSETS = [
  '/building-closed.webp',
  '/building-left-half.webp',
  '/building-right-half.webp',
  '/cat-sitting.webp',
  '/balloon-cluster.webp',
  '/birthday-cake.webp',
  '/gift-box.webp',
  '/character-walk.webp',
];

/* 所有图片资源列表 */
const ALL_IMAGE_ASSETS = [
  ...HOME_ASSETS,
  ...Object.values(DAY_ASSETS).flat(),
];

/* 视频 + 音频资源 */
const MEDIA_ASSETS = [
  '/birthday-video.mp4',
  '/blessing-video.mp4',
  '/song-1.m4a',
  '/song-2.m4a',
];

const preloaded = new Set<string>();

function preloadImage(url: string): Promise<void> {
  if (preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = url;
  });
}

function preloadMedia(url: string): Promise<void> {
  if (preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    // 用 fetch 下载到浏览器 HTTP 缓存
    fetch(url, { mode: 'no-cors' })
      .then(() => resolve())
      .catch(() => resolve());
  });
}

/**
 * 预加载某一天的全部资源
 */
export function preloadDayAssets(day: number): void {
  const assets = DAY_ASSETS[day];
  if (!assets) return;
  assets.forEach((path) => preloadImage(asset(path)));
}

/**
 * 全量预加载所有资源（图片 + 视频 + 音频）
 * 分两阶段：先图片（快），再视频（慢）
 */
export function preloadAllAssets(): {
  onProgress: (cb: (loaded: number, total: number) => void) => void;
  promise: Promise<void>;
} {
  const total = ALL_IMAGE_ASSETS.length + MEDIA_ASSETS.length;
  let loaded = 0;
  let progressCallback: ((loaded: number, total: number) => void) | null = null;

  const tick = () => {
    loaded++;
    progressCallback?.(loaded, total);
  };

  // 先并行加载所有图片（小文件，快）
  const imagePromises = ALL_IMAGE_ASSETS.map((path) =>
    preloadImage(asset(path)).then(tick)
  );

  // 图片加载完后，再加载视频（大文件，慢）
  const mediaPromises = Promise.all(imagePromises).then(() =>
    Promise.all(MEDIA_ASSETS.map((path) =>
      preloadMedia(asset(path)).then(tick)
    ))
  );

  return {
    onProgress: (cb) => { progressCallback = cb; },
    promise: mediaPromises.then(() => {}),
  };
}
