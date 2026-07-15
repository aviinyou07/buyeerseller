import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const THUMBNAIL_WIDTH = 1280;
const THUMBNAIL_HEIGHT = 960;
const THUMBNAIL_QUALITY = 95;

const toUploadUrl = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath).split(path.sep).join('/');
  return `/${relativePath}`;
};

export async function createProductImageVariants(files = []) {
  const thumbnailDir = path.join(process.cwd(), 'uploads', 'listings', 'thumbs');
  await fs.mkdir(thumbnailDir, { recursive: true });
  const results = await Promise.all(
    files.map(async (file) => {
      const parsedName = path.parse(file.filename);
      const thumbnailPath = path.join(thumbnailDir, `${parsedName.name}-thumb.webp`);

      try {
        await sharp(file.path)
          .rotate()
          .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .webp({ quality: THUMBNAIL_QUALITY })
          .toFile(thumbnailPath);

        return {
          originalUrl: toUploadUrl(file.path),
          thumbnailUrl: toUploadUrl(thumbnailPath),
        };
      } catch (err) {
        // Don't let a single image (eg. unsupported HEIC/HEIF) crash the whole
        // upload flow. Log the error and return the original file path with
        // a null thumbnail so callers can decide how to handle it.
        console.warn('[productImages.createProductImageVariants] failed to process', file.path, err && (err.message || err));
        return {
          originalUrl: toUploadUrl(file.path),
          thumbnailUrl: null,
          error: err && (err.message || String(err)),
        };
      }
    })
  );

  return results;
}
