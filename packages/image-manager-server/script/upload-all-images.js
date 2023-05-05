import {
  fetchAllImages,
  fetchImageMeta,
} from '../out/libs/repository/local-file.js';
import { uploadImageToStorage } from '../out/libs/repository/storage.js';

const main = async () => {
  const [images, meta] = await Promise.all([
    fetchAllImages(),
    fetchImageMeta(),
  ]);
  const targets = images.filter(
    (image) => !meta.find((m) => m.filename === image.filename)
  );

  for (const image of targets) {
    await uploadImageToStorage(image.filename);
  }
};

main();
