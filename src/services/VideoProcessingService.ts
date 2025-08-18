import { SubtitleProcessor } from "@/lib/SubtitleProcessor"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { VideoInfo, SubtitleEntry, ProcessingOptions, SubtitleStyle } from "@/types/types"

export interface ProcessingCallbacks {
  onLog: (message: string) => void
  onProgress: (progress: number, phase?: string) => void
  onMemoryUpdate: (usage: number) => void
}

export interface ProcessingParams {
  videoFile: File
  relevantSubtitles: SubtitleEntry[]
  videoInfo: VideoInfo
  outputFormat: string
  subtitleStyle: SubtitleStyle
  processingOptions: ProcessingOptions
}

/**
 * Service class for handling video processing operations
 * Provides a clean abstraction over the SubtitleProcessor
 */
export class VideoProcessingService {
  private ffmpeg: FFmpeg
  private processor: SubtitleProcessor
  private memoryMonitorInterval?: NodeJS.Timeout
  private isInitialized: boolean = false
  private isInitializing: boolean = false
  private fontsLoaded: boolean = false

  constructor() {
    this.ffmpeg = new FFmpeg()
    this.processor = new SubtitleProcessor(this.ffmpeg)
  }

  /**
   * Initialize FFmpeg and load necessary resources
   */
  async initialize(callbacks: Pick<ProcessingCallbacks, 'onLog' | 'onProgress'>): Promise<void> {
    // Guard against multiple initialization
    if (this.isInitialized) {
      return
    }

    if (this.isInitializing) {
      return
    }

    this.isInitializing = true

    try {
      await this.processor.loadFFmpeg({
        onLog: callbacks.onLog,
        onProgress: (progress) => callbacks.onProgress(Math.round(progress * 100), 'initialization')
      })

      // Load Google Fonts in background (only once)
      await this.loadGoogleFonts(callbacks.onLog)
      
      this.isInitialized = true
    } finally {
      this.isInitializing = false
    }
  }

  /**
   * Get video information from file
   */
  async getVideoInfo(file: File): Promise<VideoInfo> {
    return this.processor.getVideoInfo(file)
  }

  /**
   * Parse subtitle file
   */
  async parseSubtitleFile(file: File): Promise<SubtitleEntry[]> {
    return this.processor.parseSubtitleFile(file)
  }

  /**
   * Filter subtitles by video duration
   */
  filterSubtitlesByDuration(subtitles: SubtitleEntry[], duration: number) {
    return this.processor.filterSubtitlesByDuration(subtitles, duration)
  }

  /**
   * Process video with subtitles
   */
  async processVideo(
    params: ProcessingParams,
    callbacks: ProcessingCallbacks
  ): Promise<string> {
    // Start memory monitoring
    this.startMemoryMonitoring(callbacks.onMemoryUpdate)

    try {
      const url = await this.processor.processVideo({
        videoFile: params.videoFile,
        relevantSubtitles: params.relevantSubtitles,
        videoInfo: params.videoInfo,
        outputFormat: params.outputFormat,
        subtitleStyle: params.subtitleStyle,
        onLog: callbacks.onLog,
        onProgress: callbacks.onProgress,
        processingOptions: params.processingOptions
      })

      return url
    } finally {
      this.stopMemoryMonitoring()
    }
  }

  /**
   * Force cleanup of all FFmpeg memory and files
   */
  async forceCleanup(relevantSubtitles?: SubtitleEntry[]): Promise<void> {
    await this.processor.forceCleanup(relevantSubtitles)
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): number {
    return this.processor.getMemoryUsage()
  }

  /**
   * Start monitoring memory usage
   */
  private startMemoryMonitoring(onMemoryUpdate: (usage: number) => void): void {
    this.memoryMonitorInterval = setInterval(() => {
      const usage = this.getMemoryUsage()
      onMemoryUpdate(usage)
    }, 2000)
  }

  /**
   * Stop monitoring memory usage
   */
  private stopMemoryMonitoring(): void {
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval)
      this.memoryMonitorInterval = undefined
    }
  }

  /**
   * Load Google Fonts in background
   */
  private async loadGoogleFonts(onLog: (message: string) => void): Promise<void> {
    // Guard against multiple font loading
    if (this.fontsLoaded) {
      return
    }

    try {
      const fontList = await this.processor.fetchGoogleFonts()
      onLog(`Loaded ${fontList.length} Google Fonts`)
      this.fontsLoaded = true
    } catch (err) {
      onLog(`Google Fonts load error: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  /**
   * Cancel current processing operation using page reload
   */
  async cancelProcessing(): Promise<void> {
    this.stopMemoryMonitoring()
    // Page reload approach - cancellation is handled at the hook level
    // This method exists for compatibility but actual cancellation is done via page reload
  }

  /**
   * Cleanup resources
   */
  dispose(): void {
    this.stopMemoryMonitoring()
    // Additional cleanup if needed
  }
}