"use client"

import React from 'react'
import { FileVideo, Download } from 'lucide-react'
import { FileUploadCard } from './FileUploadCard'
import { useVideoProcessing } from '@/hooks/useVideoProcessing'
import { Button } from '@/components/ui/button'
import { trackDownload } from '@/lib/gtag'

/**
 * Video upload section component
 * Handles video file upload with proper validation and feedback
 */
const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/subtitle-burner-wasm' : ''
  return `${basePath}${path}`
}

const downloadSampleVideo = () => {
  trackDownload('sample-video.mp4', 'video')
  const link = document.createElement('a')
  link.href = getAssetPath('/sample-video.mp4')
  link.download = 'sample-video.mp4'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function VideoUploadSection({ className = "" }: { className?: string }) {
  const { videoFile, videoInfo, setVideoFile } = useVideoProcessing()

  return (
    <div className="space-y-3">
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
      
      <Button
        variant="outline"
        size="sm"
        onClick={downloadSampleVideo}
        className="w-full text-xs"
      >
        <Download className="w-3 h-3 mr-2" />
        Download Sample Video (10s)
      </Button>
    </div>
  )
}