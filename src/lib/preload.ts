/**
 * 图片预加载工具
 * 在首页静默预加载所有天数的背景图和关键资源
 * 利用浏览器缓存，后续访问秒开
 */
import { asset } from './assets';

/* 每天的背景图 */
const DAY_BACKGROUNDS = [
  asset('/child-room-night.webp'),    // Day 1
  asset('/classroom-day.webp'),       // Day 2
  asset('/university-campus.webp'),   // Day 3
  asset('/shanghai-street.webp'),     // Day 4
  asset('/leeds-scene.webp'),         // Day 5
  asset('/office-scene.webp'),        // Day 6
  asset('/girls-illustration.webp'),  // Day 7
  asset('/Geburtstag.webp'),          // Day 8-12 共用
];

/* 首页装饰图（首页本身已经渲染了，preload 确保缓存） */
const HOME_ASSETS = [
  asset('/building-closed.webp'),
  asset('/building-left-half.webp'),
  asset('/building-right-half.webp'),
  asset('/cat-sitting.webp'),
  asset('/balloon-cluster.webp'),
  asset('/gift-box.webp'),
  asset('/birthday-cake.webp'),
  asset('/character-walk.webp'),
  asset('/assets/envelope-closed.webp'),
  asset('/assets/envelope-open.webp'),
];

const preloaded = new Set<string>();

/**
 * 静默预加载一张图片，利用浏览器 HTTP 缓存
 */
function preloadImage(url: string): void {
  if (preloaded.has(url)) return;
  preloaded.add(url);
  const img = new Image();
  img.src = url;
  // 不需要 append 到 DOM，设置 src 就会触发请求和缓存
}

/**
 * 预加载所有背景图
 * 优先加载天背景，然后加载首页装饰
 * 分批加载避免阻塞网络
 */
export function preloadAllImages(): void {
  // 立即加载天背景（最重要）
  DAY_BACKGROUNDS.forEach(preloadImage);

  // 延迟 2 秒加载首页装饰（等首页渲染完）
  setTimeout(() => {
    HOME_ASSETS.forEach(preloadImage);
  }, 2000);
}
