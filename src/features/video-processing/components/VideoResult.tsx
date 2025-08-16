"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { CustomVideoPlayer } from "@/components/CustomVideoPlayer"
import { Download, Play, Eye } from 'lucide-react'

interface VideoResultProps {
  downloadUrl: string | null
  outputFormat: string
  className?: string
  title?: string
  showTitle?: boolean
}

/**
 * Video result display component
 * Shows processed video with download option
 */
export function VideoResult({ 
  downloadUrl, 
  outputFormat, 
  className = "",
  title = "Video Result",
  showTitle = true 
}: VideoResultProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {showTitle && (
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-primary-foreground" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
        </div>
      )}

      <CustomVideoPlayer
        src={downloadUrl}
        className="w-full"
        placeholder={
          <div className="text-center text-gray-400">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg font-medium text-gray-600">Processed Video</p>
            <p className="text-sm text-gray-500">Process video to see result</p>
          </div>
        }
      />

      {downloadUrl && (
        <div className="text-center">
          <a href={downloadUrl} download={`video_with_subtitles.${outputFormat}`}>
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              <Download className="mr-2 h-5 w-5" />
              Download Video
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}