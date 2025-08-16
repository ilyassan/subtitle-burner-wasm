"use client"

import React from 'react'
import { FileText } from 'lucide-react'
import { FileUploadCard } from './FileUploadCard'
import { useVideoProcessing } from '../hooks/useVideoProcessing'

/**
 * Subtitle upload section component
 * Handles subtitle file upload with stats display
 */
export function SubtitleUploadSection({ className = "" }: { className?: string }) {
  const { subtitleFile, subtitleStats, setSubtitleFile } = useVideoProcessing()

  return (
    <FileUploadCard
      file={subtitleFile}
      onFileChange={setSubtitleFile}
      accept=".srt,.vtt,.ass,.ssa"
      label="Subtitle File"
      icon={FileText}
      className={className}
    >
      {subtitleStats && (
        <span className="text-xs text-gray-500 mt-1">
          {subtitleStats.relevant}/{subtitleStats.total} subtitles relevant
        </span>
      )}
    </FileUploadCard>
  )
}