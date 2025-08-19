"use client"

import React, { useState, useRef, useEffect } from "react"

import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react"
import { Slider } from "@/components/ui/slider"

interface CustomVideoPlayerProps {
  src: string | null
  className?: string
  placeholder?: React.ReactNode
  autoplay?: boolean
}

export const CustomVideoPlayer: React.FC<CustomVideoPlayerProps> = ({ 
  src, 
  className = "", 
  placeholder,
  autoplay = false
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(100)
  const [showControls, setShowControls] = useState(false)  // Start with controls hidden

  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handleEnd = () => setIsPlaying(false)
    
    const handleLoadedData = () => {
      setDuration(video.duration)
      // Auto-play when video is ready and autoplay is enabled
      if (autoplay && src) {
        video.play().then(() => {
          setIsPlaying(true)
        }).catch((error) => {
          console.warn('Autoplay failed:', error)
          // Autoplay failed, user interaction required
        })
      }
    }

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('ended', handleEnd)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('ended', handleEnd)
    }
  }, [src, autoplay])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      video.play()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return

    video.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const time = (value[0] / 100) * duration
    video.currentTime = time
    setCurrentTime(time)
  }

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current
    if (!video) return

    const vol = value[0] / 100
    video.volume = vol
    setVolume(value[0])
  }

  const skipTime = (seconds: number) => {
    const video = videoRef.current
    if (!video) return

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds))
  }


  const showControlsTemporarily = () => {
    // Only auto-hide if playing and not hovering
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current)
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!src) {
    return (
      <div className={`relative bg-gray-900 rounded-xl overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          {placeholder || (
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                <Play className="w-8 h-8" />
              </div>
              <p className="text-lg font-medium">No video loaded</p>
              <p className="text-sm text-gray-500">Upload a video to see preview</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative bg-black rounded-xl overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        setShowControls(false)
        if (hideControlsTimer.current) {
          clearTimeout(hideControlsTimer.current)
        }
      }}
      onMouseMove={() => {
        if (!showControls) {
          setShowControls(true)
        }
        showControlsTemporarily()
      }}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full aspect-video object-contain"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Controls Overlay */}
      {showControls && (
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent transition-opacity duration-300"
        >
        {/* Play/Pause Button Center - Only show on hover */}
        <button
          className="absolute inset-0 flex items-center justify-center"
          onClick={togglePlay}
        >
          <div className={`w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}>
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </div>
        </button>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
          {/* Progress Bar */}
          <div className="space-y-1">
            <Slider
              value={[duration ? (currentTime / duration) * 100 : 0]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-white/80">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => skipTime(-10)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:text-orange-400 transition-colors"
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-2 text-white/80 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white/80 hover:text-white transition-colors"
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <Slider
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-20"
                />
              </div>
            </div>

          </div>
        </div>
        </div>
      )}
    </div>
  )
}