'use client';

import React from 'react';

const uploadFiles = async (files: File[]) => {
  const body = new FormData();
  files.forEach((file) => {
    body.append('images[]', file);
  });

  const uploadToLocalResponse = await fetch(
    'http://localhost:10010/api/upload-to-local',
    {
      method: 'POST',
      body,
    }
  );

  console.log(uploadToLocalResponse);
  location.reload();
};

export const ImageUploadArea: React.FC = () => {
  const onDragEnter = React.useCallback((e: DragEvent) => {}, []);

  const onDragLeave = React.useCallback((e: DragEvent) => {}, []);

  const onDragOver = React.useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();
  }, []);

  const onDrop = React.useCallback((e: DragEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!e.dataTransfer) return;
    uploadFiles(Array.from(e.dataTransfer.files));
  }, []);

  React.useEffect(() => {
    document.body.addEventListener('dragenter', onDragEnter);
    document.body.addEventListener('dragleave', onDragLeave);
    document.body.addEventListener('dragover', onDragOver);
    document.body.addEventListener('drop', onDrop);

    return () => {
      document.body.removeEventListener('dragenter', onDragEnter);
      document.body.removeEventListener('dragleave', onDragLeave);
      document.body.removeEventListener('dragover', onDragOver);
      document.body.removeEventListener('drop', onDrop);
    };
  }, [onDragEnter, onDragLeave, onDragOver, onDrop]);

  return null;
};
