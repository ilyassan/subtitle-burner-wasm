"use client"

import React from 'react'
import { FileVideo } from 'lucide-react'
import { FileUploadCard } from './FileUploadCard'
import { useVideoProcessing } from '@/hooks/useVideoProcessing'

/**
 * Video upload section component
 * Handles video file upload with proper validation and feedback
 */
export function VideoUploadSection({ className = "" }: { className?: string }) {
  const { videoFile, videoInfo, setVideoFile } = useVideoProcessing()

  return (
    <FileUploadCard
      file={videoFile}
      onFileChange={setVideoFile}
      accept="video/mp4,video/x-m4v,video/*"
      label="Video File"
      icon={FileVideo}
      className={className}
    >
      {videoInfo && (
        <span className="text-xs text-gray-500 mt-1">
          {videoInfo.width}×{videoInfo.height}, {videoInfo.duration.toFixed(1)}s
        </span>
      )}
    </FileUploadCard>
  )
}