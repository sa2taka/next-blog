import console from 'console';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { join } from 'path';
import { convertImage } from '../convert-image';
import { DATA_ROOT, updateImageMeta } from './local-file';

const app = initializeApp({
  credential: applicationDefault(),
});
const storage = getStorage(app);

export async function uploadImageToStorage(
  filename: string
): Promise<{ imageUrl: string | null; webpImageUrl: string | null }> {
  const imageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(filename);
  const webpImageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(`${path.basename(filename, path.extname(filename))}.webp`);

  const data = await readFile(join(DATA_ROOT, '_images', filename));
  const { minifyImage, webpImage } = await convertImage(data);

  try {
    await Promise.all([
      imageFile.save(minifyImage, { public: true }),
      webpImageFile.save(webpImage, { public: true }),
    ]);
  } catch (e) {
    console.error(e);
  }

  await updateImageMeta(
    filename,
    imageFile.publicUrl(),
    webpImageFile.publicUrl()
  );

  return {
    imageUrl: imageFile.publicUrl(),
    webpImageUrl: webpImageFile.publicUrl(),
  };
}
