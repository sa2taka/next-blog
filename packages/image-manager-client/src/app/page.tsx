import { ImageList } from 'packages/image-manager-client/src/components/ImageList';
import { Suspense } from 'react';

import '@image-manager-client/styles/globals.css';
import '@image-manager-client/styles/Home.css';

export default async function Home() {
  return (
    <main>
      <Suspense>
        {/* @ts-expect-error Server Component */}
        <ImageList />
      </Suspense>
    </main>
  );
}
