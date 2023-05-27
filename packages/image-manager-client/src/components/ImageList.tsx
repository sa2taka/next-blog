'use client';

import { Image } from 'packages/image-manager-client/src/model/image';
import React, { useCallback, useMemo, useState } from 'react';
import { ImageInfo } from './ImageInfo';

export const ImageList: React.FC<{ images: Image[] }> = ({ images }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const displayImages = useMemo(
    () => images.filter(({ filename }) => filename.includes(searchQuery)),
    [images, searchQuery]
  );

  const onChangeInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <>
      <input value={searchQuery} onChange={onChangeInput} />
      <div className="image-list">
        {displayImages.map((image) => (
          <ImageInfo image={image} key={image.filepath} />
        ))}
      </div>
    </>
  );
};
