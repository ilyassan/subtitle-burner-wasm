import { useCallback, useRef, useEffect } from 'react'
import { VideoProcessingService } from '@/services/VideoProcessingService'
import { useVideoStore } from '@/stores/videoStore'
import { useProgressStore } from '@/stores/progressStore'
import { useErrorHandler } from '@/components/ErrorBoundary'
import debounce from 'lodash/debounce'

/**
 * Unified Zustand-based hook for video processing
 * Replaces the React Context Provider pattern with direct Zustand integration
 */
export function useVideoProcessing() {
  const { handleError } = useErrorHandler()
  
  // Zustand stores
  const videoStore = useVideoStore()
  const progressStore = useProgressStore()
  
  // Service instance (singleton per hook usage)
  const serviceRef = useRef<VideoProcessingService>(new VideoProcessingService())

  // Initialize service when script loads
  useEffect(() => {
    const initializeService = async () => {
      if (!videoStore.scriptLoaded) {
        progressStore.addLog("Waiting for ffmpeg-core.js to load")
        return
      }

      try {
        await serviceRef.current.initialize({
          onLog: (message) => progressStore.addLog(message),
          onProgress: (progress) => progressStore.setProgress(progress)
        })
        
        videoStore.setFfmpegLoaded(true)
        progressStore.addLog("FFmpeg loaded successfully")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        videoStore.setError(`Failed to load FFmpeg: ${errorMessage}`)
        progressStore.addLog(`FFmpeg load error: ${errorMessage}`)
      }
    }

    initializeService()
  }, [videoStore.scriptLoaded, videoStore.setFfmpegLoaded, videoStore.setError, progressStore.addLog, progressStore.setProgress])

  // Cleanup on unmount
  useEffect(() => {
    const service = serviceRef.current
    const downloadUrl = videoStore.downloadUrl
    return () => {
      service.dispose()
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl)
      }
    }
  }, [videoStore.downloadUrl])

  /**
   * Handle video file selection with debouncing
   */
  const setVideoFile = useCallback(async (file: File | null) => {
    const debouncedSet = debounce(async (file: File | null) => {
      if (!file) {
        videoStore.setVideoFile(null)
        return
      }

      videoStore.setVideoFile(file)
      videoStore.setError(null)

      try {
        const info = await serviceRef.current.getVideoInfo(file)
        videoStore.setVideoInfo(info)
        progressStore.addLog(`Video info: ${info.width}x${info.height}, ${info.duration.toFixed(2)}s`)

        // Re-filter subtitles if they exist
        if (videoStore.parsedSubtitles.length > 0) {
          const { filteredSubtitles, stats } = serviceRef.current.filterSubtitlesByDuration(
            videoStore.parsedSubtitles, 
            info.duration
          )
          videoStore.setRelevantSubtitles(filteredSubtitles)
          videoStore.setSubtitleStats(stats)
          progressStore.addLog(
            `Subtitle optimization: ${stats.relevant}/${stats.total} subtitles are relevant for ${info.duration.toFixed(1)}s video (${stats.filtered} filtered out)`
          )
        }
      } catch {
        progressStore.addLog("Could not get video info")
      }
    }, 300)
    
    debouncedSet(file)
  }, [videoStore.setVideoFile, videoStore.setError, videoStore.setVideoInfo, videoStore.setRelevantSubtitles, videoStore.setSubtitleStats, videoStore.parsedSubtitles, progressStore.addLog])

  /**
   * Handle subtitle file selection with debouncing
   */
  const setSubtitleFile = useCallback(async (file: File | null) => {
    const debouncedSet = debounce(async (file: File | null) => {
      if (!file) {
        videoStore.setSubtitleFile(null)
        return
      }

      videoStore.setSubtitleFile(file)
      videoStore.setError(null)

      try {
        const parsed = await serviceRef.current.parseSubtitleFile(file)
        videoStore.setParsedSubtitles(parsed)
        progressStore.addLog(`Parsed ${parsed.length} subtitle entries from ${file.name}`)

        // Filter subtitles if video info exists
        if (videoStore.videoInfo) {
          const { filteredSubtitles, stats } = serviceRef.current.filterSubtitlesByDuration(
            parsed, 
            videoStore.videoInfo.duration
          )
          videoStore.setRelevantSubtitles(filteredSubtitles)
          videoStore.setSubtitleStats(stats)
          progressStore.addLog(
            `Subtitle optimization: ${stats.relevant}/${stats.total} subtitles are relevant for ${videoStore.videoInfo.duration.toFixed(1)}s video (${stats.filtered} filtered out)`
          )
        } else {
          videoStore.setRelevantSubtitles(parsed)
          videoStore.setSubtitleStats({ 
            total: parsed.length, 
            relevant: parsed.length, 
            filtered: 0, 
            avgDuration: 0, 
            totalDuration: 0 
          })
        }
      } catch (err) {
        videoStore.setError(`Failed to parse subtitle file: ${err instanceof Error ? err.message : String(err)}`)
      }
    }, 300)
    
    debouncedSet(file)
  }, [videoStore.setSubtitleFile, videoStore.setError, videoStore.setParsedSubtitles, videoStore.setRelevantSubtitles, videoStore.setSubtitleStats, videoStore.videoInfo, progressStore.addLog])

  /**
   * Start video processing
   */
  const startProcessing = useCallback(async () => {
    if (!videoStore.videoFile || !videoStore.subtitleFile || 
        videoStore.relevantSubtitles.length === 0 || !videoStore.videoInfo) {
      videoStore.setError("Please upload both video and subtitle files, and ensure video info is loaded.")
      return
    }

    // Complete reset of all states and FFmpeg memory before starting
    videoStore.setIsProcessing(true)
    progressStore.setProgress(0)
    progressStore.setProgressStage('')
    progressStore.setProgressPhase('')
    progressStore.setProgressETA('')
    // Keep logs persistent - don't clear them on new process start
    videoStore.setDownloadUrl(null)
    videoStore.setError(null)
    videoStore.setMemoryUsage(0)
    videoStore.setIsCancelling(false)

    // Force cleanup any previous FFmpeg session before starting new one
    try {
      await serviceRef.current.forceCleanup()
      progressStore.addLog("🧹 Previous session cleaned up")
    } catch (error) {
      console.warn('Pre-processing cleanup error:', error)
    }

    try {
      progressStore.addLog("🎥 Starting video processing...")

      const url = await serviceRef.current.processVideo(
        {
          videoFile: videoStore.videoFile,
          relevantSubtitles: videoStore.relevantSubtitles,
          videoInfo: videoStore.videoInfo,
          outputFormat: videoStore.outputFormat,
          fontSize: videoStore.subtitleStyle.fontSize.toString(),
          fontColor: videoStore.subtitleStyle.fontColor,
          fontFamily: videoStore.subtitleStyle.fontFamily,
          processingOptions: videoStore.processingOptions
        },
        {
          onLog: (message) => {
            progressStore.addLog(message)
          },
          onProgress: (progressValue, phase) => {
            progressStore.setProgress(progressValue)
            
            // Update phase display with better titles
            if (phase === 'subtitle-generation') {
              progressStore.setProgressPhase('Phase 1: Generating Subtitle Images')
            } else if (phase === 'video-processing') {
              progressStore.setProgressPhase('Phase 2: Encoding Video with Subtitles')
            } else {
              progressStore.setProgressPhase('Phase 1: Generating Subtitle Images')
            }
            
            progressStore.setProgressStage(`${progressValue.toFixed(1)}% complete`)
          },
          onMemoryUpdate: (usage) => {
            videoStore.setMemoryUsage(usage)
          }
        }
      )
      
      videoStore.setDownloadUrl(url)
      progressStore.setProgress(100)
      progressStore.setProgressStage('Completed')
      progressStore.setProgressPhase('Finished')
      progressStore.setProgressETA('')
      progressStore.addLog("✅ Video processing completed successfully!")
      
      // Force cleanup FFmpeg WASM memory after successful completion
      try {
        await serviceRef.current.forceCleanup(videoStore.relevantSubtitles)
        progressStore.addLog("🧹 FFmpeg memory cleaned up")
      } catch (error) {
        console.warn('Cleanup error after completion:', error)
      }
      
      if (videoStore.subtitleStats?.filtered) {
        progressStore.addLog(`Optimization saved significant processing time by filtering ${videoStore.subtitleStats.filtered} irrelevant subtitles`)
      }
    } catch (err) {
      // Check if this is the expected FFmpeg termination error
      if (err instanceof Error && err.message === 'called FFmpeg.terminate()') {
        // This is a cancellation, not an error - handle it gracefully
        progressStore.addLog("🛑 Processing cancelled by user")
        progressStore.setProgressStage('Cancelled')
        progressStore.setProgressPhase('Stopped')
      } else {
        // This is an actual error
        const errorMessage = err instanceof Error ? err.message : String(err)
        videoStore.setError(`Processing failed: ${errorMessage}`)
        progressStore.addLog(`Processing error: ${errorMessage}`)
        progressStore.setProgressStage('Error')
        progressStore.setProgressPhase('Failed')
        handleError(err instanceof Error ? err : new Error(errorMessage))
      }
    } finally {
      videoStore.setIsProcessing(false)
      videoStore.setIsCancelling(false)
      
      // Reset progress states after processing with comprehensive cleanup
      setTimeout(() => {
        // Complete state reset for next processing session
        progressStore.setProgress(0)
        progressStore.setProgressStage('')
        progressStore.setProgressPhase('')
        progressStore.setProgressETA('')
        videoStore.setMemoryUsage(0)
        
        // Keep logs persistent - only clear download URL on error
        if (videoStore.error || progressStore.progressStage === 'Cancelled') {
          videoStore.setDownloadUrl(null)
        }
      }, 2000)
    }
  }, [
    videoStore.videoFile, 
    videoStore.subtitleFile, 
    videoStore.relevantSubtitles, 
    videoStore.videoInfo,
    videoStore.outputFormat,
    videoStore.subtitleStyle,
    videoStore.processingOptions,
    videoStore.subtitleStats,
    videoStore.setError,
    videoStore.setIsProcessing,
    videoStore.setIsCancelling,
    videoStore.setDownloadUrl,
    videoStore.setMemoryUsage,
    progressStore.setProgress,
    progressStore.setProgressStage,
    progressStore.setProgressPhase,
    progressStore.setProgressETA,
    progressStore.clearLogs,
    progressStore.addLog,
    handleError
  ])

  /**
   * Cancel processing
   */
  const cancelProcessing = useCallback(() => {
    videoStore.setShowCancelModal(true)
  }, [videoStore.setShowCancelModal])

  /**
   * Confirm processing cancellation
   */
  const confirmCancelProcessing = useCallback(async () => {
    // Immediate cancellation using proper FFmpeg termination
    videoStore.setIsCancelling(true)
    videoStore.setShowCancelModal(false)
    
    // Cancel processing using FFmpeg WASM terminate
    try {
      await serviceRef.current.cancelProcessing()
      progressStore.addLog("🛑 FFmpeg processing terminated")
    } catch (error) {
      // FFmpeg.terminate() always throws "Error: called FFmpeg.terminate()" by design
      // This is expected behavior, not an actual error
      if (error instanceof Error && error.message === 'called FFmpeg.terminate()') {
        progressStore.addLog("🛑 FFmpeg processing terminated")
      } else {
        console.warn('Unexpected cancellation error:', error)
        progressStore.addLog("⚠️ Warning during cancellation")
      }
    }
    
    // Force cleanup FFmpeg WASM memory
    try {
      await serviceRef.current.forceCleanup()
      progressStore.addLog("🧹 FFmpeg memory cleaned up")
    } catch (error) {
      console.warn('Cleanup error:', error)
    }
    
    // Complete state reset - return everything to initial state
    videoStore.setIsProcessing(false)
    videoStore.setDownloadUrl(null)
    videoStore.setMemoryUsage(0)
    videoStore.setError(null)
    
    // Reset progress to initial state (back to 0)
    progressStore.setProgress(0)
    progressStore.setProgressStage('')
    progressStore.setProgressPhase('')
    progressStore.setProgressETA('')
    // Keep logs persistent - don't clear them on cancellation
    
    // Clear cancelling state after a brief delay
    setTimeout(() => {
      videoStore.setIsCancelling(false)
    }, 500)
    
    // Reinitialize FFmpeg since terminate() requires it
    if (videoStore.scriptLoaded) {
      try {
        await serviceRef.current.initialize({
          onLog: (message) => progressStore.addLog(message),
          onProgress: (progress) => progressStore.setProgress(progress)
        })
        videoStore.setFfmpegLoaded(true)
        progressStore.addLog("✅ FFmpeg reinitialized - Ready for new processing")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        videoStore.setError(`Failed to reinitialize FFmpeg: ${errorMessage}`)
        progressStore.addLog(`FFmpeg reinit error: ${errorMessage}`)
      }
    }
  }, [
    videoStore.setIsCancelling, 
    videoStore.setIsProcessing, 
    videoStore.setDownloadUrl, 
    videoStore.setMemoryUsage, 
    videoStore.setError,
    videoStore.setFfmpegLoaded,
    videoStore.scriptLoaded,
    videoStore.setShowCancelModal,
    progressStore.setProgress, 
    progressStore.setProgressStage, 
    progressStore.setProgressPhase, 
    progressStore.setProgressETA, 
    progressStore.addLog, 
    progressStore.clearLogs
  ])

  /**
   * Update subtitle style
   */
  const updateSubtitleStyle = useCallback((style: Partial<typeof videoStore.subtitleStyle>) => {
    videoStore.setSubtitleStyle({ ...videoStore.subtitleStyle, ...style })
  }, [videoStore.setSubtitleStyle, videoStore.subtitleStyle])

  /**
   * Update processing options
   */
  const updateProcessingOptions = useCallback((options: Partial<typeof videoStore.processingOptions>) => {
    videoStore.setProcessingOptions({ ...videoStore.processingOptions, ...options })
  }, [videoStore.setProcessingOptions, videoStore.processingOptions])

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    videoStore.setError(null)
  }, [videoStore.setError])

  /**
   * Set script loaded
   */
  const setScriptLoaded = useCallback((loaded: boolean) => {
    videoStore.setScriptLoaded(loaded)
  }, [videoStore.setScriptLoaded])

  /**
   * Set error
   */
  const setError = useCallback((error: string | null) => {
    videoStore.setError(error)
  }, [videoStore.setError])

  // Return all state and actions
  return {
    // State from stores
    videoFile: videoStore.videoFile,
    subtitleFile: videoStore.subtitleFile,
    isProcessing: videoStore.isProcessing,
    isCancelling: videoStore.isCancelling,
    showCancelModal: videoStore.showCancelModal,
    progress: progressStore.progress,
    progressStage: progressStore.progressStage,
    progressPhase: progressStore.progressPhase,
    progressETA: progressStore.progressETA,
    downloadUrl: videoStore.downloadUrl,
    error: videoStore.error,
    videoInfo: videoStore.videoInfo,
    parsedSubtitles: videoStore.parsedSubtitles,
    relevantSubtitles: videoStore.relevantSubtitles,
    subtitleStats: videoStore.subtitleStats,
    subtitleStyle: videoStore.subtitleStyle,
    processingOptions: videoStore.processingOptions,
    outputFormat: videoStore.outputFormat,
    ffmpegLoaded: videoStore.ffmpegLoaded,
    scriptLoaded: videoStore.scriptLoaded,
    memoryUsage: videoStore.memoryUsage,
    logs: progressStore.logs,

    // Actions
    setVideoFile,
    setSubtitleFile,
    startProcessing,
    cancelProcessing,
    confirmCancelProcessing,
    updateSubtitleStyle,
    updateProcessingOptions,
    clearLogs: progressStore.clearLogs,
    addLog: progressStore.addLog,
    clearError,
    setScriptLoaded,
    setError
  }
}