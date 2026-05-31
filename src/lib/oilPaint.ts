/**
 * Soft painterly effect via Canvas.
 * Downscale → blur → upscale (smooths details),
 * then posterize + saturate for a watercolor-like look.
 */

export function oilPaintify(img: HTMLImageElement): string {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // Step 1: downscale to 1/3, blur, upscale back — smooths out photo detail
  const small = document.createElement('canvas');
  const sw = Math.round(w / 3);
  const sh = Math.round(h / 3);
  small.width = sw;
  small.height = sh;
  const sCtx = small.getContext('2d')!;
  sCtx.filter = 'blur(1.5px)';
  sCtx.drawImage(img, 0, 0, sw, sh);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(small, 0, 0, w, h);

  // Step 2: posterize + saturate pixel by pixel
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  const levels = 10; // color levels per channel (lower = more painterly)
  const step = 255 / (levels - 1);

  for (let i = 0; i < d.length; i += 4) {
    // Posterize: snap each channel to nearest level
    let r = Math.round(d[i] / step) * step;
    let g = Math.round(d[i + 1] / step) * step;
    let b = Math.round(d[i + 2] / step) * step;

    // Boost saturation: increase distance from gray
    const avg = (r + g + b) / 3;
    const sat = 1.3;
    r = Math.min(255, Math.max(0, avg + (r - avg) * sat));
    g = Math.min(255, Math.max(0, avg + (g - avg) * sat));
    b = Math.min(255, Math.max(0, avg + (b - avg) * sat));

    // Warm tint
    r = Math.min(255, r * 1.04);
    b = Math.max(0, b * 0.96);

    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  // Step 3: overlay subtle canvas texture
  ctx.globalAlpha = 0.06;
  ctx.globalCompositeOperation = 'overlay';
  const texCanvas = document.createElement('canvas');
  texCanvas.width = w;
  texCanvas.height = h;
  const tCtx = texCanvas.getContext('2d')!;
  const texData = tCtx.createImageData(w, h);
  const td = texData.data;
  for (let i = 0; i < td.length; i += 4) {
    const v = Math.random() * 255;
    td[i] = v;
    td[i + 1] = v;
    td[i + 2] = v;
    td[i + 3] = 255;
  }
  tCtx.putImageData(texData, 0, 0);
  tCtx.filter = 'blur(0.5px)';
  tCtx.drawImage(texCanvas, 0, 0);
  ctx.drawImage(texCanvas, 0, 0);

  return canvas.toDataURL('image/jpeg', 0.85);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
