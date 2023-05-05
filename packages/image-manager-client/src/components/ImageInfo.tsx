'use client';

import { Image } from 'packages/image-manager-client/src/model/image';
import NextImage from 'next/image';
import React from 'react';
import { IconButton } from './IconButton';
import { MdContentCopy, MdUpload, MdQuestionMark } from 'react-icons/md';

interface ImageProps {
  image: Image;
}

export const ImageInfo: React.FC<ImageProps> = ({ image }) => {
  const [confirmingUpload, setConfirmingUpload] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onClickUpload = React.useCallback(() => {
    setConfirmingUpload(true);
    setTimeout(() => {
      setConfirmingUpload(false);
    }, 5000);
  }, []);

  const onClickConfirmUpload = React.useCallback(async () => {
    setLoading(true);
    try {
      await fetch('http://localhost:10010/api/upload-to-storage', {
        body: JSON.stringify({ filename: image.filename }),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      setLoading(false);
      setConfirmingUpload(false);
    }
  }, [image.filename]);

  const onClickCopy = React.useCallback(() => {
    const title = image.filename.replace(/\.\w*$/, '');
    const markdownText = `![${title}](${image.minifyImageUrl})`;

    navigator.clipboard.writeText(markdownText);
  }, [image.filename, image.minifyImageUrl]);

  return (
    <div className="image-area">
      <NextImage
        src={`http://localhost:10010/image/${image.filename}`}
        alt={image.filename}
        width={image.width}
        height={image.height}
        style={{
          width: '100%',
          height: 'auto',
        }}
      />
      <h2 className="filename">{image.filename}</h2>
      <IconButton icon={<MdContentCopy />} onClick={onClickCopy} />
      {loading ? null : confirmingUpload ? (
        <IconButton icon={<MdQuestionMark />} onClick={onClickConfirmUpload} />
      ) : (
        <IconButton icon={<MdUpload />} onClick={onClickUpload} />
      )}
    </div>
  );
};
