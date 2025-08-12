'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Use relative path to avoid alias resolution issues
const VideoSubtitleBurner = dynamic(() => import('./VideoSubtitleBurner'), {
  ssr: false,
  loading: () => <div className="text-center p-4">Loading Subtitle Burner...</div>,
});

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100">
      <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
        <VideoSubtitleBurner />
      </Suspense>
    </main>
  );
}