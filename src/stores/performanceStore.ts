import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface PerformanceMetrics {
  memory: {
    used: number
    available: number
    peak: number
  }
  processing: {
    startTime?: Date
    endTime?: Date
    duration?: number
    videoDuration?: number
    efficiency?: number // seconds processed per second
  }
  fps: number
  frameCount: number
  subtitleCount: number
}

export interface PerformanceStore {
  metrics: PerformanceMetrics
  isMonitoring: boolean
  
  // Actions
  startMonitoring: () => void
  stopMonitoring: () => void
  updateMemory: (used: number, available?: number) => void
  startProcessing: (videoDuration?: number, subtitleCount?: number) => void
  endProcessing: () => void
  updateProgress: (frameCount: number, fps: number) => void
  
  // Getters
  getEfficiency: () => number
  getMemoryUsagePercent: () => number
  getProcessingStats: () => {
    duration: number
    efficiency: number
    avgFps: number
  } | null
}

/**
 * Performance monitoring store for tracking system metrics and processing efficiency
 */
export const usePerformanceStore = create<PerformanceStore>()(
  devtools(
    (set, get) => ({
      metrics: {
        memory: {
          used: 0,
          available: 0,
          peak: 0
        },
        processing: {},
        fps: 0,
        frameCount: 0,
        subtitleCount: 0
      },
      isMonitoring: false,

      startMonitoring: () => {
        set({ isMonitoring: true })
        
        // Reset metrics
        set((state) => ({
          metrics: {
            ...state.metrics,
            memory: { ...state.metrics.memory, peak: 0 },
            processing: {},
            fps: 0,
            frameCount: 0
          }
        }))
      },

      stopMonitoring: () => {
        set({ isMonitoring: false })
      },

      updateMemory: (used, available = 0) => {
        set((state) => ({
          metrics: {
            ...state.metrics,
            memory: {
              used,
              available,
              peak: Math.max(state.metrics.memory.peak, used)
            }
          }
        }))
      },

      startProcessing: (videoDuration, subtitleCount = 0) => {
        set((state) => ({
          metrics: {
            ...state.metrics,
            processing: {
              startTime: new Date(),
              videoDuration,
            },
            subtitleCount
          }
        }))
      },

      endProcessing: () => {
        const now = new Date()
        set((state) => {
          const { startTime, videoDuration } = state.metrics.processing
          const duration = startTime ? (now.getTime() - startTime.getTime()) / 1000 : 0
          const efficiency = videoDuration && duration > 0 ? videoDuration / duration : 0

          return {
            metrics: {
              ...state.metrics,
              processing: {
                ...state.metrics.processing,
                endTime: now,
                duration,
                efficiency
              }
            }
          }
        })
      },

      updateProgress: (frameCount, fps) => {
        set((state) => ({
          metrics: {
            ...state.metrics,
            frameCount,
            fps
          }
        }))
      },

      getEfficiency: () => {
        const { metrics } = get()
        return metrics.processing.efficiency || 0
      },

      getMemoryUsagePercent: () => {
        const { metrics } = get()
        const { used, available } = metrics.memory
        return available > 0 ? (used / available) * 100 : 0
      },

      getProcessingStats: () => {
        const { metrics } = get()
        const { processing, fps, frameCount } = metrics
        
        if (!processing.startTime) return null
        
        const now = processing.endTime || new Date()
        const duration = (now.getTime() - processing.startTime.getTime()) / 1000
        const efficiency = processing.videoDuration && duration > 0 ? processing.videoDuration / duration : 0
        const avgFps = frameCount > 0 && duration > 0 ? frameCount / duration : fps
        
        return {
          duration,
          efficiency,
          avgFps
        }
      }
    }),
    { name: 'performance-store' }
  )
)