const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const THUMBNAIL_WIDTH = 240;
const THUMBNAIL_HEIGHT = 180;
const THUMBNAIL_QUALITY = 56;

const toUploadUrl = (filePath) => {
  const relativePath = path.relative(process.cwd(), filePath).split(path.sep).join('/');
  return `/${relativePath}`;
};

const createCategoryImageVariants = async (file) => {
  if (!file) {
    return {
      originalUrl: '',
      thumbnailUrl: '',
    };
  }

  const thumbnailDir = path.join(process.cwd(), 'uploads', 'categories', 'thumbs');
  await fs.mkdir(thumbnailDir, { recursive: true });

  const parsedName = path.parse(file.filename);
  const thumbnailPath = path.join(thumbnailDir, `${parsedName.name}-thumb.webp`);

  await sharp(file.path)
    .rotate()
    .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: THUMBNAIL_QUALITY })
    .toFile(thumbnailPath);

  return {
    originalUrl: toUploadUrl(file.path),
    thumbnailUrl: toUploadUrl(thumbnailPath),
  };
};

const createCategoryThumbnail = async (file) => {
  const variants = await createCategoryImageVariants(file);
  return variants.thumbnailUrl;
};

module.exports = {
  createCategoryImageVariants,
  createCategoryThumbnail,
};
