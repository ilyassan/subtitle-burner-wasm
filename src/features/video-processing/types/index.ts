import { VideoInfo, SubtitleEntry, ProcessingOptions, SubtitleStyle } from '@/types/types'

export interface VideoProcessingState {
  // Files
  videoFile: File | null
  subtitleFile: File | null
  
  // Processing state
  isProcessing: boolean
  isCancelling: boolean
  progress: number
  progressStage: string
  progressPhase: string
  progressETA: string
  
  // Results
  downloadUrl: string | null
  error: string | null
  
  // Video info
  videoInfo: VideoInfo | null
  parsedSubtitles: SubtitleEntry[]
  relevantSubtitles: SubtitleEntry[]
  subtitleStats: {
    total: number
    relevant: number
    filtered: number
    avgDuration: number
    totalDuration: number
  } | null
  
  // Configuration
  subtitleStyle: SubtitleStyle
  processingOptions: ProcessingOptions
  outputFormat: string
  
  // System state
  ffmpegLoaded: boolean
  scriptLoaded: boolean
  memoryUsage: number
  logs: string[]
}

export interface VideoProcessingActions {
  // File actions
  setVideoFile: (file: File | null) => void
  setSubtitleFile: (file: File | null) => void
  
  // Processing actions
  startProcessing: () => Promise<void>
  cancelProcessing: () => void
  
  // Configuration actions
  updateSubtitleStyle: (style: Partial<SubtitleStyle>) => void
  updateProcessingOptions: (options: Partial<ProcessingOptions>) => void
  
  // System actions
  clearLogs: () => void
  addLog: (message: string) => void
  clearError: () => void
  setScriptLoaded: (loaded: boolean) => void
  setError: (error: string | null) => void
}

export interface VideoProcessingContext extends VideoProcessingState, VideoProcessingActions {}

export interface FileUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  accept: string
  label: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  className?: string
}

export interface ProcessingProgressProps {
  progress: number
  progressStage: string
  progressPhase: string
  progressETA: string
  isProcessing: boolean
  isCancelling: boolean
  memoryUsage: number
  memoryLimit?: number
  onCancel: () => void
}