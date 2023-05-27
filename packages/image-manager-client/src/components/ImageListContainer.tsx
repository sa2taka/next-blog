import { Image } from 'packages/image-manager-client/src/model/image';
import { ImageList } from './ImageList';

export const ImageListContainer = async ({}) => {
  const images: Image[] = (
    await (await fetch('http://localhost:10010/api/images')).json()
  ).result;

  return <ImageList images={images} />;
};
