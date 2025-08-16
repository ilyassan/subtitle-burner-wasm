import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { VideoInfo, SubtitleEntry, SubtitleStats, ProcessingOptions, SubtitleStyle } from '@/types/types'

interface VideoProcessingState {
  // File states
  videoFile: File | null
  subtitleFile: File | null
  downloadUrl: string | null
  
  // Video data
  videoInfo: VideoInfo | null
  parsedSubtitles: SubtitleEntry[]
  relevantSubtitles: SubtitleEntry[]
  subtitleStats: SubtitleStats | null
  
  // Processing states
  isProcessing: boolean
  isCancelling: boolean
  showCancelModal: boolean
  
  // Settings
  subtitleStyle: SubtitleStyle
  processingOptions: ProcessingOptions
  outputFormat: string
  
  // Memory and performance
  memoryUsage: number
  
  // Error state
  error: string | null
  
  // FFmpeg state
  ffmpegLoaded: boolean
  scriptLoaded: boolean
}

interface VideoProcessingActions {
  // File actions
  setVideoFile: (file: File | null) => void
  setSubtitleFile: (file: File | null) => void
  setDownloadUrl: (url: string | null) => void
  
  // Video data actions
  setVideoInfo: (info: VideoInfo | null) => void
  setParsedSubtitles: (subtitles: SubtitleEntry[]) => void
  setRelevantSubtitles: (subtitles: SubtitleEntry[]) => void
  setSubtitleStats: (stats: SubtitleStats | null) => void
  
  // Processing actions
  setIsProcessing: (processing: boolean) => void
  setIsCancelling: (cancelling: boolean) => void
  setShowCancelModal: (show: boolean) => void
  
  // Settings actions
  setSubtitleStyle: (style: SubtitleStyle) => void
  setProcessingOptions: (options: ProcessingOptions) => void
  setOutputFormat: (format: string) => void
  
  // Memory and performance actions
  setMemoryUsage: (usage: number) => void
  
  // Error actions
  setError: (error: string | null) => void
  
  // FFmpeg actions
  setFfmpegLoaded: (loaded: boolean) => void
  setScriptLoaded: (loaded: boolean) => void
  
  // Reset actions
  resetAll: () => void
  resetProcessingState: () => void
}

type VideoStore = VideoProcessingState & VideoProcessingActions

const initialState: VideoProcessingState = {
  // File states
  videoFile: null,
  subtitleFile: null,
  downloadUrl: null,
  
  // Video data
  videoInfo: null,
  parsedSubtitles: [],
  relevantSubtitles: [],
  subtitleStats: null,
  
  // Processing states
  isProcessing: false,
  isCancelling: false,
  showCancelModal: false,
  
  // Settings
  subtitleStyle: {
    fontSize: 24,
    fontColor: "#FFFFFF",
    fontFamily: "Roboto",
    position: "bottom",
    alignment: "center",
    outlineColor: "#000000",
    outlineWidth: 2,
    shadow: true,
    opacity: 1
  },
  processingOptions: {
    quality: "balanced",
    crf: 23,
    memoryLimit: 500,
    threads: 0,
    useDiskCache: true
  },
  outputFormat: "mp4",
  
  // Memory and performance
  memoryUsage: 0,
  
  // Error state
  error: null,
  
  // FFmpeg state
  ffmpegLoaded: false,
  scriptLoaded: false
}

export const useVideoStore = create<VideoStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // File actions
      setVideoFile: (file) => set({ videoFile: file }, false, 'setVideoFile'),
      setSubtitleFile: (file) => set({ subtitleFile: file }, false, 'setSubtitleFile'),
      setDownloadUrl: (url) => set({ downloadUrl: url }, false, 'setDownloadUrl'),
      
      // Video data actions
      setVideoInfo: (info) => set({ videoInfo: info }, false, 'setVideoInfo'),
      setParsedSubtitles: (subtitles) => set({ parsedSubtitles: subtitles }, false, 'setParsedSubtitles'),
      setRelevantSubtitles: (subtitles) => set({ relevantSubtitles: subtitles }, false, 'setRelevantSubtitles'),
      setSubtitleStats: (stats) => set({ subtitleStats: stats }, false, 'setSubtitleStats'),
      
      // Processing actions
      setIsProcessing: (processing) => set({ isProcessing: processing }, false, 'setIsProcessing'),
      setIsCancelling: (cancelling) => set({ isCancelling: cancelling }, false, 'setIsCancelling'),
      setShowCancelModal: (show) => set({ showCancelModal: show }, false, 'setShowCancelModal'),
      
      // Settings actions
      setSubtitleStyle: (style) => set({ subtitleStyle: style }, false, 'setSubtitleStyle'),
      setProcessingOptions: (options) => set({ processingOptions: options }, false, 'setProcessingOptions'),
      setOutputFormat: (format) => set({ outputFormat: format }, false, 'setOutputFormat'),
      
      // Memory and performance actions
      setMemoryUsage: (usage) => set({ memoryUsage: usage }, false, 'setMemoryUsage'),
      
      // Error actions
      setError: (error) => set({ error: error }, false, 'setError'),
      
      // FFmpeg actions
      setFfmpegLoaded: (loaded) => set({ ffmpegLoaded: loaded }, false, 'setFfmpegLoaded'),
      setScriptLoaded: (loaded) => set({ scriptLoaded: loaded }, false, 'setScriptLoaded'),
      
      // Reset actions
      resetAll: () => set(initialState, false, 'resetAll'),
      resetProcessingState: () => set({
        isProcessing: false,
        isCancelling: false,
        showCancelModal: false,
        error: null,
        downloadUrl: null
      }, false, 'resetProcessingState')
    }),
    {
      name: 'video-processing-store'
    }
  )
)