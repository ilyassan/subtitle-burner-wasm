"use client"

import React from 'react'
import { FileText, Download } from 'lucide-react'
import { FileUploadCard } from './FileUploadCard'
import { useVideoProcessing } from '@/hooks/useVideoProcessing'
import { Button } from '@/components/ui/button'
import { trackDownload } from '@/lib/gtag'

/**
 * Subtitle upload section component
 * Handles subtitle file upload with stats display
 */
const getAssetPath = (path: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/subtitle-burner-wasm' : ''
  return `${basePath}${path}`
}

const downloadSampleSubtitles = () => {
  trackDownload('sample-subtitles.srt', 'subtitle')
  const link = document.createElement('a')
  link.href = getAssetPath('/sample-subtitles.srt')
  link.download = 'sample-subtitles.srt'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function SubtitleUploadSection({ className = "" }: { className?: string }) {
  const { subtitleFile, subtitleStats, setSubtitleFile } = useVideoProcessing()

  return (
    <div className="space-y-3">
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
      
      <Button
        variant="outline"
        size="sm"
        onClick={downloadSampleSubtitles}
        className="w-full text-xs"
      >
        <Download className="w-3 h-3 mr-2" />
        Download Sample Subtitles (.srt)
      </Button>
    </div>
  )
}