"use client"

import React from 'react'
import { Button } from "@/components/ui/button"
import { Play } from 'lucide-react'
import { useVideoProcessing } from '../hooks/useVideoProcessing'

interface ProcessingButtonProps {
  className?: string
  size?: "sm" | "lg" | "default"
  variant?: "default" | "outline" | "secondary"
}

/**
 * Processing button component
 * Handles video processing trigger with proper state management
 */
export function ProcessingButton({ 
  className = "", 
  size = "lg",
  variant = "default" 
}: ProcessingButtonProps) {
  const {
    videoFile,
    subtitleFile,
    relevantSubtitles,
    videoInfo,
    isProcessing,
    ffmpegLoaded,
    startProcessing
  } = useVideoProcessing()

  const isDisabled = !videoFile || !subtitleFile || relevantSubtitles.length === 0 || 
                    !videoInfo || isProcessing || !ffmpegLoaded

  const getButtonText = () => {
    if (isProcessing) return "Processing Video..."
    if (!ffmpegLoaded) return "Loading FFmpeg..."
    return `Burn ${relevantSubtitles.length || 0} Subtitles`
  }

  return (
    <Button
      onClick={startProcessing}
      disabled={isDisabled}
      size={size}
      variant={variant}
      className={`font-semibold shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      <Play className="mr-2 h-5 w-5" />
      {getButtonText()}
    </Button>
  )
}