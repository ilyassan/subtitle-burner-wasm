"use client"

import React, { useCallback, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, X, File, FileVideo, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileWithPreview extends File {
  preview?: string
}

interface DragDropUploadProps {
  onVideoFiles: (files: FileWithPreview[]) => void
  onSubtitleFiles: (files: FileWithPreview[]) => void
  maxVideoFiles?: number
  maxSubtitleFiles?: number
  className?: string
}

export function DragDropUpload({
  onVideoFiles,
  onSubtitleFiles,
  maxVideoFiles = 1,
  maxSubtitleFiles = 10,
  className
}: DragDropUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [videoFiles, setVideoFiles] = useState<FileWithPreview[]>([])
  const [subtitleFiles, setSubtitleFiles] = useState<FileWithPreview[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleFiles = useCallback((files: File[]) => {
    const newVideoFiles: FileWithPreview[] = []
    const newSubtitleFiles: FileWithPreview[] = []

    files.forEach(file => {
      if (file.type.startsWith('video/') || /\.(mp4|avi|mov|mkv|webm)$/i.test(file.name)) {
        if (videoFiles.length + newVideoFiles.length < maxVideoFiles) {
          newVideoFiles.push(file)
        }
      } else if (/\.(srt|vtt|ass|ssa)$/i.test(file.name)) {
        if (subtitleFiles.length + newSubtitleFiles.length < maxSubtitleFiles) {
          newSubtitleFiles.push(file)
        }
      }
    })

    if (newVideoFiles.length > 0) {
      const updatedVideoFiles = [...videoFiles, ...newVideoFiles]
      setVideoFiles(updatedVideoFiles)
      onVideoFiles(updatedVideoFiles)
    }

    if (newSubtitleFiles.length > 0) {
      const updatedSubtitleFiles = [...subtitleFiles, ...newSubtitleFiles]
      setSubtitleFiles(updatedSubtitleFiles)
      onSubtitleFiles(updatedSubtitleFiles)
    }
  }, [videoFiles, subtitleFiles, maxVideoFiles, maxSubtitleFiles, onVideoFiles, onSubtitleFiles])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      handleFiles(Array.from(e.dataTransfer.files))
    }
  }, [handleFiles])

  const removeFile = (type: 'video' | 'subtitle', index: number) => {
    if (type === 'video') {
      const updated = videoFiles.filter((_, i) => i !== index)
      setVideoFiles(updated)
      onVideoFiles(updated)
    } else {
      const updated = subtitleFiles.filter((_, i) => i !== index)
      setSubtitleFiles(updated)
      onSubtitleFiles(updated)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files))
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`
    return `${Math.round(bytes / (1024 * 1024))}MB`
  }

  return (
    <Card className={cn("transition-all duration-200", dragActive && "ring-2 ring-primary", className)}>
      <CardContent className="p-6">
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Drop files here</h3>
            <p className="text-muted-foreground">
              Supports video files (MP4, AVI, MOV, MKV, WebM) and subtitle files (SRT, VTT, ASS, SSA)
            </p>
            <div className="flex justify-center">
              <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                Browse Files
              </Button>
              <input
                id="file-input"
                type="file"
                multiple
                accept="video/*,.srt,.vtt,.ass,.ssa"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {(videoFiles.length > 0 || subtitleFiles.length > 0) && (
          <div className="mt-6 space-y-4">
            {videoFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileVideo className="h-4 w-4" />
                  Video Files ({videoFiles.length}/{maxVideoFiles})
                </h4>
                <div className="space-y-2">
                  {videoFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileVideo className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium text-sm">{file.name}</div>
                          <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('video', index)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {subtitleFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Subtitle Files ({subtitleFiles.length}/{maxSubtitleFiles})
                </h4>
                <div className="grid grid-cols-1 gap-2">
                  {subtitleFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-green-500" />
                        <div>
                          <span className="text-sm font-medium">{file.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {file.name.split('.').pop()?.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile('subtitle', index)}
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}