import { Suspense } from 'react';

import '@image-manager-client/styles/globals.css';
import '@image-manager-client/styles/Home.css';
import { ImageUploadArea } from '@image-manager-client/components/ImageUploadArea';
import { ImageListContainer } from '@image-manager-client/components/ImageListContainer';

export default async function Home() {
  return (
    <main>
      <Suspense>
        {/* @ts-expect-error Server Component */}
        <ImageListContainer />
        <ImageUploadArea />
      </Suspense>
    </main>
  );
}
