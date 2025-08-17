/**
 * Centralized Progress Management System
 * Prevents progress bouncing by maintaining a single source of truth
 * with proper phase-based progress tracking
 */

export type ProcessingPhase = 
  | 'parsing-subtitles'
  | 'processing-video'
  | 'completed'
  | 'error'

export interface ProgressUpdate {
  phase: ProcessingPhase
  phaseProgress: number // 0-100 within current phase (always resets to 0 for new phase)
  phaseNumber: number // 1 or 2 (which phase we're on)
  totalPhases: number // Always 2
  message: string
  timestamp: number
  metadata?: {
    processedTime?: number
    totalDuration?: number
    currentSubtitle?: number
    totalSubtitles?: number
    eta?: string
  }
}

export interface PhaseConfig {
  name: string
  number: number // 1 or 2
}

export class ProgressManager {
  private currentPhase: ProcessingPhase = 'parsing-subtitles'
  private phaseProgress: number = 0
  private lastReportedProgress: number = 0
  private progressHistory: ProgressUpdate[] = []
  private callbacks: Set<(update: ProgressUpdate) => void> = new Set()
  private logCallbacks: Set<(message: string) => void> = new Set()
  
  // Phase configuration with descriptive titles
  private readonly phaseConfigs: Record<ProcessingPhase, PhaseConfig> = {
    'parsing-subtitles': { name: 'Phase 1: Generating Subtitle Images', number: 1 },
    'processing-video': { name: 'Phase 2: Encoding Video with Subtitles', number: 2 },
    'completed': { name: 'Processing Complete', number: 3 },
    'error': { name: 'Processing Failed', number: 0 }
  }

  constructor() {
    this.reset()
  }

  /**
   * Reset progress manager to initial state
   */
  reset(): void {
    this.currentPhase = 'parsing-subtitles'
    this.phaseProgress = 0
    this.lastReportedProgress = 0
    this.progressHistory = []
    // Removed log message to prevent repetition
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(callback: (update: ProgressUpdate) => void): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * Subscribe to log messages
   */
  onLog(callback: (message: string) => void): () => void {
    this.logCallbacks.add(callback)
    return () => this.logCallbacks.delete(callback)
  }

  /**
   * Set the current processing phase (resets progress to 0)
   */
  setPhase(phase: ProcessingPhase, message?: string): void {
    if (phase === this.currentPhase) return

    this.currentPhase = phase
    this.phaseProgress = 0  // Always reset to 0 for new phase
    this.lastReportedProgress = 0

    const phaseConfig = this.phaseConfigs[phase]
    const updateMessage = message || `Phase ${phaseConfig.number}: ${phaseConfig.name} - Starting...`
    
    // Removed excessive phase transition logging
    this.emitUpdate(updateMessage)
    
    // Immediately emit a 0% progress to ensure UI shows starting state
    this.updatePhase(0, `Phase ${phaseConfig.number}: ${phaseConfig.name} - 0%`)
  }

  /**
   * Update progress within the current phase (0-100%)
   */
  updatePhase(progress: number, message?: string, metadata?: ProgressUpdate['metadata']): void {
    // Ensure progress is within valid range
    progress = Math.max(0, Math.min(100, progress))
    
    // Only update if progress has increased (prevent bouncing)
    if (progress <= this.phaseProgress) {
      return
    }

    this.phaseProgress = progress

    // Always emit the first progress update, then require meaningful increases
    const isFirstUpdate = this.lastReportedProgress === 0 && progress > 0
    const isMeaningfulIncrease = progress - this.lastReportedProgress >= 1
    
    if (isFirstUpdate || isMeaningfulIncrease) {
      this.lastReportedProgress = progress
      const phaseConfig = this.phaseConfigs[this.currentPhase]
      const updateMessage = message || `${phaseConfig.name}: ${progress.toFixed(1)}%`
      this.emitUpdate(updateMessage, metadata)
    }
  }

  /**
   * Update progress for video processing with time-based calculation
   */
  updateVideoProgress(processedTime: number, totalDuration: number, message?: string): void {
    if (this.currentPhase !== 'processing-video') {
      this.setPhase('processing-video')
    }

    if (totalDuration <= 0) return

    const phaseProgress = Math.min((processedTime / totalDuration) * 100, 100)
    const remainingTime = Math.max(0, totalDuration - processedTime)
    const eta = remainingTime > 0 ? `${remainingTime.toFixed(1)}s remaining` : 'Almost done'

    const metadata = {
      processedTime,
      totalDuration,
      eta
    }

    const defaultMessage = `Processing video: ${processedTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s`
    this.updatePhase(phaseProgress, message || defaultMessage, metadata)
  }

  /**
   * Update progress for subtitle parsing/creation
   */
  updateSubtitleProgress(current: number, total: number, message?: string): void {
    if (this.currentPhase !== 'parsing-subtitles') {
      this.setPhase('parsing-subtitles')
    }

    if (total <= 0) return

    const phaseProgress = Math.min((current / total) * 100, 100)
    const metadata = {
      currentSubtitle: current,
      totalSubtitles: total
    }

    const defaultMessage = `Parsing subtitles: ${current}/${total}`
    this.updatePhase(phaseProgress, message || defaultMessage, metadata)
  }

  /**
   * Complete the current phase and optionally move to next
   */
  completePhase(nextPhase?: ProcessingPhase, message?: string): void {
    // Complete current phase
    this.updatePhase(100, message)
    
    // Move to next phase if specified
    if (nextPhase) {
      setTimeout(() => this.setPhase(nextPhase), 100)
    }
  }

  /**
   * Mark processing as completed and reset everything
   */
  complete(message = 'Processing completed successfully'): void {
    this.setPhase('completed', message)
    this.updatePhase(100, message)
    // Removed excessive completion logging
    
    // Reset everything after a short delay to allow UI to show completion
    setTimeout(() => {
      this.reset()
    }, 1000)
  }

  /**
   * Mark processing as failed
   */
  error(message: string, error?: Error): void {
    this.setPhase('error', message)
    this.log(`❌ Error: ${message}`)
    if (error) {
      this.log(`Error details: ${error.message}`)
    }
  }

  /**
   * Get current progress state
   */
  getState(): {
    phase: ProcessingPhase
    phaseProgress: number
    phaseNumber: number
    totalPhases: number
    message: string
    isComplete: boolean
    hasError: boolean
  } {
    const latest = this.progressHistory[this.progressHistory.length - 1]
    const phaseConfig = this.phaseConfigs[this.currentPhase]
    return {
      phase: this.currentPhase,
      phaseProgress: this.phaseProgress,
      phaseNumber: phaseConfig.number,
      totalPhases: 2,
      message: latest?.message || '',
      isComplete: this.currentPhase === 'completed',
      hasError: this.currentPhase === 'error'
    }
  }

  /**
   * Get progress history for debugging
   */
  getHistory(): ProgressUpdate[] {
    return [...this.progressHistory]
  }

  /**
   * Parse FFmpeg log for progress information
   */
  parseFFmpegLog(message: string, videoDuration?: number): boolean {
    // Only process video phase logs
    if (this.currentPhase !== 'processing-video' || !videoDuration) {
      return false
    }

    // Parse time from FFmpeg log
    const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}[\.,]\d{2,3})/i)
    if (timeMatch) {
      const processedTime = this.parseFFmpegTime(timeMatch[1])
      this.updateVideoProgress(processedTime, videoDuration, message)
      return true
    }

    // Parse frame-based progress as fallback
    const frameMatch = message.match(/frame=\s*(\d+)/i)
    const fpsMatch = message.match(/fps=\s*([\d.]+)/i)
    if (frameMatch && fpsMatch) {
      const frames = parseInt(frameMatch[1])
      const fps = parseFloat(fpsMatch[1])
      if (fps > 0) {
        const processedTime = frames / fps
        this.updateVideoProgress(processedTime, videoDuration, message)
        return true
      }
    }

    return false
  }

  /**
   * Parse FFmpeg time format to seconds
   */
  private parseFFmpegTime(timeStr: string): number {
    try {
      const normalizedTime = timeStr.replace(',', '.')
      const parts = normalizedTime.split(':').map(p => parseFloat(p))
      
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1]
      } else if (parts.length === 1) {
        return parts[0]
      }
      return 0
    } catch {
      return 0
    }
  }

  /**
   * Emit progress update to all subscribers
   */
  private emitUpdate(message: string, metadata?: ProgressUpdate['metadata']): void {
    const phaseConfig = this.phaseConfigs[this.currentPhase]
    const update: ProgressUpdate = {
      phase: this.currentPhase,
      phaseProgress: this.phaseProgress,
      phaseNumber: phaseConfig.number,
      totalPhases: 2,
      message,
      timestamp: Date.now(),
      metadata
    }

    // Store in history (keep last 100 entries)
    this.progressHistory.push(update)
    if (this.progressHistory.length > 100) {
      this.progressHistory.shift()
    }

    // Notify all subscribers
    this.callbacks.forEach(callback => {
      try {
        callback(update)
      } catch (error) {
        console.error('Error in progress callback:', error)
      }
    })
  }

  /**
   * Log a message to all log subscribers
   */
  private log(message: string): void {
    this.logCallbacks.forEach(callback => {
      try {
        callback(message)
      } catch (error) {
        console.error('Error in log callback:', error)
      }
    })
  }
}

// Singleton instance for global use
export const progressManager = new ProgressManager()