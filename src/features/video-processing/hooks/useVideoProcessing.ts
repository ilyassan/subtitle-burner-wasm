import { useContext } from 'react'
import { VideoProcessingContext as VideoProcessingContextType } from '../types'
import { VideoProcessingContext as Context } from '../providers/VideoProcessingProvider'

/**
 * Hook to access video processing context
 * Provides type-safe access to all video processing state and actions
 */
export function useVideoProcessing(): VideoProcessingContextType {
  const context = useContext(Context)
  
  if (!context) {
    throw new Error('useVideoProcessing must be used within a VideoProcessingProvider')
  }
  
  return context
}