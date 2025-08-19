"use client"

import dynamic from "next/dynamic"

/**
 * Client component wrapper for the main app
 * Handles dynamic import with SSR disabled
 */
const VideoSubtitleBurner = dynamic(() => import("../VideoSubtitleBurner"), {
  ssr: false,
  loading: () => (
    <div className="p-8 text-center">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  ),
})

export function AppWrapper() {
  return <VideoSubtitleBurner />
}