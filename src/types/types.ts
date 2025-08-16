export interface SubtitleEntry {
  index: number
  startTime: number
  endTime: number
  text: string
  x?: number
  y?: number
  style?: SubtitleStyle
}

export interface VideoInfo {
  width: number
  height: number
  duration: number
  fps?: number
  bitrate?: number
  size?: number
}

export interface SubtitleStats {
  total: number
  relevant: number
  filtered: number
  avgDuration: number
  totalDuration: number
}

export interface GoogleFont {
  family: string
  category: string
  variants?: string[]
}

export interface SubtitleStyle {
  fontSize: number
  fontColor: string
  fontFamily: string
  backgroundColor?: string
  opacity?: number
  outlineColor?: string
  outlineWidth?: number
  shadow?: boolean
  position?: 'bottom' | 'top' | 'center' | 'custom'
  alignment?: 'left' | 'center' | 'right'
  marginX?: number
  marginY?: number
}

export interface ProcessingOptions {
  quality: 'fast' | 'balanced' | 'high'
  preset?: string
  crf?: number
  maxBitrate?: string
  memoryLimit?: number // MB
  useDiskCache?: boolean
  threads?: number // 0 means auto (all available)
}

export interface PerformanceMetrics {
  startTime: number
  endTime?: number
  totalDuration: number
  processingTime: number
  memoryUsage?: number
  subtitlesProcessed: number
  strategy: string
  avgTimePerSubtitle: number
  segmentsProcessed?: number
  totalSegments?: number
}

export interface VideoSegment {
  startTime: number
  endTime: number
  subtitles: SubtitleEntry[]
  filename: string
  memoryFootprint?: number
}


export interface ProgressUpdate {
  stage: 'analyzing' | 'processing' | 'merging' | 'cleanup'
  progress: number
  currentSegment?: number
  totalSegments?: number
  message: string
  memoryUsage?: number
}

export interface WorkerTask {
  id: string
  segment: VideoSegment
  options: ProcessingOptions
  style: SubtitleStyle
}

export interface PreviewUpdate {
  previewUrl: string
  segmentIndex: number
  totalSegments: number
  timeRange: { start: number; end: number }
  isPreview: boolean
}