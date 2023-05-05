import { Image } from 'packages/image-manager-client/src/model/image';
import React from 'react';
import { ImageInfo } from './ImageInfo';

export const ImageList = async ({}) => {
  const images: Image[] = (
    await (await fetch('http://localhost:10010/api/images')).json()
  ).result;

  return (
    <div className="image-list">
      {images.map((image) => (
        <ImageInfo image={image} key={image.filepath} />
      ))}
    </div>
  );
};
