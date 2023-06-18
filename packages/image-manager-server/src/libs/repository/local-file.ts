import { getMeta, Image, Meta } from '@image-manager-server/model/image';

import * as path from 'path';
import { readFile, stat, writeFile, rename } from 'fs/promises';
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
  return (
    await Promise.all(images.map((image) => fetchImage(image, meta)))
  ).sort(
    (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0)
  );
}

export async function fetchImage(
  filepath: string,
  meta: Meta[]
): Promise<Image> {
  const [imageContent, statInfo] = await Promise.all([
    readFile(filepath),
    stat(filepath),
  ]);

  const { width, height } = imageSize(imageContent);

  return {
    filepath: filepath.normalize(),
    filename: path.basename(filepath).normalize(),
    width: width ?? 0,
    height: height ?? 0,
    minifyImageUrl: getMeta(filepath, meta)?.imageUrl ?? undefined,
    webpImageUrl: getMeta(filepath, meta)?.webpImageUrl ?? undefined,
    createdAt: statInfo.birthtime,
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

export async function renameImage(
  beforeFilePath: string,
  afterFilePath: string
) {
  return rename(beforeFilePath, afterFilePath);
}

export async function renameImageMeta(
  beforeFilePath: string,
  afterFilePath: string,
  afterImageUrl: string,
  afterWebpImageUrl: string
): Promise<Meta[]> {
  const meta = await fetchImageMeta();

  const removed = meta.filter(
    (m) => m.filename !== path.basename(beforeFilePath)
  );

  const updated = removed.find(
    (m) => m.filename === path.basename(afterFilePath)
  )
    ? meta.map((m) => {
        if (m.filename === path.basename(afterFilePath)) {
          return {
            ...m,
            imageUrl: afterImageUrl,
            webpImageUrl: afterWebpImageUrl,
          };
        }
        return m;
      })
    : [
        ...removed,
        {
          filename: path.basename(afterFilePath),
          imageUrl: afterImageUrl,
          webpImageUrl: afterWebpImageUrl,
        },
      ];
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
