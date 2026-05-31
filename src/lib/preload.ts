/**
 * 图片预加载工具
 * 启动页全量预加载 + 按天预加载
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

/* 所有图片资源列表（启动页全量预加载） */
const ALL_IMAGE_ASSETS = [
  ...HOME_ASSETS,
  ...Object.values(DAY_ASSETS).flat(),
];

const preloaded = new Set<string>();

function preloadImage(url: string): Promise<void> {
  if (preloaded.has(url)) return Promise.resolve();
  preloaded.add(url);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // 失败也不阻塞
    img.src = url;
  });
}

/**
 * 预加载某一天的全部资源
 * 在点击日历弹窗时调用
 */
export function preloadDayAssets(day: number): void {
  const assets = DAY_ASSETS[day];
  if (!assets) return;
  assets.forEach((path) => preloadImage(asset(path)));
}

/**
 * 全量预加载所有图片资源
 * 返回 { onProgress, promise }
 */
export function preloadAllAssets(): {
  onProgress: (cb: (loaded: number, total: number) => void) => void;
  promise: Promise<void>;
} {
  const total = ALL_IMAGE_ASSETS.length;
  let loaded = 0;
  let progressCallback: ((loaded: number, total: number) => void) | null = null;

  const promise = Promise.all(
    ALL_IMAGE_ASSETS.map((path) =>
      preloadImage(asset(path)).then(() => {
        loaded++;
        progressCallback?.(loaded, total);
      })
    )
  ).then(() => {});

  return {
    onProgress: (cb) => { progressCallback = cb; },
    promise,
  };
}
