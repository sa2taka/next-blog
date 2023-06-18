'use client';

import { extname } from 'path';
import React from 'react';

const uploadFiles = async (files: File[], names?: string[]) => {
  const body = new FormData();
  files.forEach((file, index) => {
    body.append('images[]', file, names?.[index] ?? file.name);
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

  const onPaste = React.useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) {
      return;
    }

    const itemsArray = Array.from(items);
    const imageFiles = itemsArray
      .filter((item) => item.type.includes('image'))
      .map((item) => item.getAsFile())
      .filter((file): file is File => file !== null);

    uploadFiles(
      imageFiles,
      imageFiles.map((file) => `${crypto.randomUUID()}${extname(file.name)}`)
    );
  }, []);

  React.useEffect(() => {
    document.body.addEventListener('dragenter', onDragEnter);
    document.body.addEventListener('dragleave', onDragLeave);
    document.body.addEventListener('dragover', onDragOver);
    document.body.addEventListener('drop', onDrop);
    document.body.addEventListener('paste', onPaste);

    return () => {
      document.body.removeEventListener('dragenter', onDragEnter);
      document.body.removeEventListener('dragleave', onDragLeave);
      document.body.removeEventListener('dragover', onDragOver);
      document.body.removeEventListener('drop', onDrop);
      document.body.removeEventListener('paste', onPaste);
    };
  }, [onDragEnter, onDragLeave, onDragOver, onDrop, onPaste]);

  return null;
};
