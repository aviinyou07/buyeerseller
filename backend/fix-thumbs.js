import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 960;
const THUMBNAIL_QUALITY = 95;

const dir = path.join(process.cwd(), 'uploads', 'listings');
const thumbDir = path.join(dir, 'thumbs');

async function run() {
  const files = await fs.readdir(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) continue;

    const parsedName = path.parse(file);
    const thumbnailPath = path.join(thumbDir, `${parsedName.name}-thumb.webp`);

    console.log(`Re-generating ${thumbnailPath}`);
    try {
      await sharp(filePath)
        .rotate()
        .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
          fit: 'cover',
          position: 'centre',
        })
        .webp({ quality: THUMBNAIL_QUALITY })
        .toFile(thumbnailPath);
    } catch (e) {
      console.log(`Error processing ${file}: ${e.message}`);
    }
  }
}
run();
