import { useEffect, useCallback } from 'react'
import { usePerformanceStore } from '@/stores/performanceStore'

/**
 * Hook for monitoring performance metrics during processing
 */
export function usePerformanceMonitor() {
  const {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    updateMemory,
    startProcessing,
    endProcessing,
    updateProgress,
    getEfficiency,
    getMemoryUsagePercent,
    getProcessingStats
  } = usePerformanceStore()

  // Start monitoring when component mounts
  const startMonitoringWithMetrics = useCallback(() => {
    startMonitoring()
    
    // Monitor memory usage
    const memoryInterval = setInterval(() => {
      if (performance && 'memory' in performance) {
        const memory = (performance as { memory: { usedJSHeapSize: number; totalJSHeapSize: number } }).memory
        updateMemory(memory.usedJSHeapSize, memory.totalJSHeapSize)
      }
    }, 1000)

    return () => {
      clearInterval(memoryInterval)
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring, updateMemory])

  // Auto-cleanup when unmounting
  useEffect(() => {
    return () => {
      if (isMonitoring) {
        stopMonitoring()
      }
    }
  }, [isMonitoring, stopMonitoring])

  return {
    metrics,
    isMonitoring,
    startMonitoring: startMonitoringWithMetrics,
    stopMonitoring,
    startProcessing,
    endProcessing,
    updateProgress,
    getEfficiency,
    getMemoryUsagePercent,
    getProcessingStats
  }
}