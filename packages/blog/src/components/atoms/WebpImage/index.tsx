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
    <picture style={{ width, height }}>
      <source
        srcSet={file}
        type="image/webp"
        media={`(max-height: ${height}px)`}
        width={width}
        height={height}
      />
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
