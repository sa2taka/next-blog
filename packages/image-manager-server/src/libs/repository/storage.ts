import console from 'console';
import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { readFile } from 'fs/promises';
import * as path from 'path';
import { join } from 'path';
import { convertImage } from '../convert-image';
import { DATA_ROOT, renameImageMeta, updateImageMeta } from './local-file';

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

export async function rename(
  before: string,
  after: string
): Promise<{ imageUrl: string | null; webpImageUrl: string | null }> {
  const imageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(before);
  const webpImageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(`${path.basename(before, path.extname(before))}.webp`);

  const newImageFileName = after;
  const newWebpImageFileName = `${path.basename(
    after,
    path.extname(after)
  )}.webp`;

  await imageFile.move(newImageFileName);
  await webpImageFile.move(newWebpImageFileName);

  const newImageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(newImageFileName);
  const newWebpImageFile = storage
    .bucket('sa2taka-next-blog.appspot.com')
    .file(newWebpImageFileName);

  await newImageFile.makePublic();
  await newWebpImageFile.makePublic();

  await renameImageMeta(
    before,
    after,
    newImageFile.publicUrl(),
    newWebpImageFile.publicUrl()
  );

  return {
    imageUrl: newImageFile.publicUrl(),
    webpImageUrl: newWebpImageFile.publicUrl(),
  };
}
