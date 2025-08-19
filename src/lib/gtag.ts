// Google Analytics utility functions
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Track custom events
export const event = (action: string, parameters?: {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: string | number | boolean | undefined
}) => {
  if (typeof window !== 'undefined' && GA_MEASUREMENT_ID) {
    window.gtag('event', action, parameters)
  }
}

// Track video processing events
export const trackVideoProcessing = (action: 'start' | 'complete' | 'error', metadata?: {
  video_duration?: number
  subtitle_count?: number
  processing_time?: number
  error_message?: string
}) => {
  event(action, {
    event_category: 'Video Processing',
    event_label: action,
    ...metadata
  })
}

// Track file downloads
export const trackDownload = (fileName: string, fileType: 'video' | 'subtitle') => {
  event('download', {
    event_category: 'File Download',
    event_label: fileType,
    file_name: fileName
  })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}