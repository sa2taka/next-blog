import * as path from 'path';

export type Meta = {
  filename: string;
  imageUrl: string | null;
  webpImageUrl: string | null;
};

export type Image = {
  width: number;
  height: number;
  filepath: string;
  filename: string;
  minifyImageUrl?: string;
  webpImageUrl?: string;
  createdAt?: Date;
};

export const getMeta = (
  filepath: string,
  metaDataList: Meta[]
): Meta | undefined => {
  const input = path.basename(filepath.normalize());

  return metaDataList.find(({ filename }) => {
    return input === filename;
  });
};
