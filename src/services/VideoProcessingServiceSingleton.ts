import { VideoProcessingService } from './VideoProcessingService'

/**
 * Singleton instance of VideoProcessingService
 * Ensures only one instance across the entire application
 */
let instance: VideoProcessingService | null = null

export function getVideoProcessingService(): VideoProcessingService {
  if (!instance) {
    instance = new VideoProcessingService()
  }
  return instance
}

export function resetVideoProcessingService(): void {
  instance = null
}