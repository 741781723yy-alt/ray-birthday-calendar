/**
 * 批量将 public/ 下的 PNG/JPG 转换为 WebP
 * - 质量 80（肉眼几乎无差别，体积缩减 60-80%）
 * - 保留原文件名，扩展名改为 .webp
 * - 跳过已经是 webp 的文件
 * - 保留原文件不动（方便回退）
 */
import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '..', 'public');
const QUALITY = 80;

const CONVERTIBLE_EXTS = new Set(['.png', '.jpg', '.jpeg']);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过 originals_backup
      if (entry.name === 'originals_backup') continue;
      files.push(...await walk(fullPath));
    } else if (CONVERTIBLE_EXTS.has(extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertFile(filePath) {
  const outPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const info = await sharp(filePath)
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(outPath);
  return { filePath, outPath, size: info.size };
}

async function main() {
  const files = await walk(PUBLIC_DIR);
  console.log(`Found ${files.length} images to convert\n`);

  let totalOriginal = 0;
  let totalWebp = 0;

  for (const file of files) {
    const originalStat = await stat(file);
    totalOriginal += originalStat.size;
    const { outPath, size } = await convertFile(file);
    totalWebp += size;
    const reduction = Math.round((1 - size / originalStat.size) * 100);
    console.log(
      `${file.replace(PUBLIC_DIR + '/', '')}: ` +
      `${(originalStat.size / 1024).toFixed(0)}KB → ${(size / 1024).toFixed(0)}KB (${reduction}% smaller)`
    );
  }

  console.log(`\nTotal: ${(totalOriginal / 1024 / 1024).toFixed(1)}MB → ${(totalWebp / 1024 / 1024).toFixed(1)}MB (${Math.round((1 - totalWebp / totalOriginal) * 100)}% reduction)`);
}

main().catch(console.error);
