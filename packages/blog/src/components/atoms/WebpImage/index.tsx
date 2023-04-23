import React from 'react';
import Image from 'next/image';

interface Props {
  file: string;
  altFile: string;
  altText: string;
  width?: number;
  height?: number;
}

export const WebPImage: React.FC<Props> = ({
  file,
  altFile,
  altText,
  width,
  height,
}) => {
  return (
    <picture>
      <source srcSet={file} type="image/webp" />
      {/*  eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={altFile}
        width={width}
        height={height}
        alt={altText}
        loading="lazy"
      />
    </picture>
  );
};
