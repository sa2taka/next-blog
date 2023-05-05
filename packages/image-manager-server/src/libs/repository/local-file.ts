import { getMeta, Image, Meta } from '@image-manager-server/model/image';

import * as path from 'path';
import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob';
import imageSize from 'image-size';

export const DATA_ROOT = path.join(process.cwd(), '..', '..', '_data');
const META_FILE = path.join(DATA_ROOT, '_images', '_meta.txt');
const META_SPLIT = ' | ';

export async function fetchAllImages(): Promise<Image[]> {
  const images = await glob(
    path.join(DATA_ROOT, '_images', '*.{png,jpeg,gif}')
  );
  const meta = await fetchImageMeta();
  return Promise.all(images.map((image) => fetchImage(image, meta)));
}

export async function fetchImage(
  filepath: string,
  meta: Meta[]
): Promise<Image> {
  const imageContent = await readFile(filepath);

  const { width, height } = imageSize(imageContent);

  return {
    filepath,
    filename: path.basename(filepath),
    width: width ?? 0,
    height: height ?? 0,
    minifyImageUrl: getMeta(filepath, meta)?.imageUrl ?? undefined,
    webpImageUrl: getMeta(filepath, meta)?.webpImageUrl ?? undefined,
  };
}

export async function fetchImageMeta(): Promise<Meta[]> {
  const data = await readFile(META_FILE);

  return data
    .toString()
    .split('\n')
    .filter((s) => s)
    .map((s) => {
      const [filename, imageUrl, webpImageUrl] = s.split(META_SPLIT);
      return {
        filename,
        imageUrl: imageUrl === 'null' ? null : imageUrl ?? null,
        webpImageUrl: webpImageUrl === 'null' ? null : webpImageUrl ?? null,
      };
    });
}

export async function updateImageMeta(
  filepath: string,
  imageUrl: string,
  webpImageUrl: string
): Promise<Meta[]> {
  const meta = await fetchImageMeta();
  const updated = meta.find((m) => m.filename === path.basename(filepath))
    ? meta.map((m) => {
        if (m.filename === path.basename(filepath)) {
          return {
            ...m,
            imageUrl,
            webpImageUrl,
          };
        }
        return m;
      })
    : [...meta, { filename: path.basename(filepath), imageUrl, webpImageUrl }];
  await updateImageMetaList(updated);
  return updated;
}

export async function updateImageMetaList(metaDataList: Meta[]): Promise<void> {
  const fileContent = metaDataList
    .map(
      ({ filename, imageUrl, webpImageUrl }) =>
        `${filename}${META_SPLIT}${imageUrl}${META_SPLIT}${webpImageUrl}`
    )
    .join('\n');

  await writeFile(META_FILE, fileContent);
}
