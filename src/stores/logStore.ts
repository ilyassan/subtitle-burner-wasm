import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'success'

export interface LogEntry {
  id: string
  message: string
  level: LogLevel
  timestamp: Date
  context?: Record<string, unknown>
}

export interface LogStore {
  logs: LogEntry[]
  maxLogs: number
  logLevel: LogLevel
  
  // Actions
  addLog: (message: string, level?: LogLevel, context?: Record<string, unknown>) => void
  clearLogs: () => void
  setLogLevel: (level: LogLevel) => void
  setMaxLogs: (max: number) => void
  
  // Convenience methods
  info: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  error: (message: string, context?: Record<string, unknown>) => void
  debug: (message: string, context?: Record<string, unknown>) => void
  success: (message: string, context?: Record<string, unknown>) => void
  
  // Filtering
  getLogsByLevel: (level: LogLevel) => LogEntry[]
  getRecentLogs: (count: number) => LogEntry[]
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  success: 1
}

/**
 * Enhanced logging store with levels, persistence, and filtering
 */
export const useLogStore = create<LogStore>()(
  devtools(
    persist(
      (set, get) => ({
        logs: [],
        maxLogs: 1000,
        logLevel: 'info' as LogLevel,

        addLog: (message, level = 'info', context) => {
          const { logLevel, maxLogs } = get()
          
          // Filter by log level
          if (LOG_LEVELS[level] < LOG_LEVELS[logLevel]) {
            return
          }

          const logEntry: LogEntry = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message,
            level,
            timestamp: new Date(),
            context
          }

          set((state) => {
            const newLogs = [...state.logs, logEntry]
            
            // Maintain max logs limit
            if (newLogs.length > maxLogs) {
              newLogs.splice(0, newLogs.length - maxLogs)
            }
            
            return { logs: newLogs }
          })
        },

        clearLogs: () => {
          set({ logs: [] })
        },

        setLogLevel: (level) => {
          set({ logLevel: level })
        },

        setMaxLogs: (max) => {
          set({ maxLogs: max })
        },

        info: (message, context) => get().addLog(message, 'info', context),
        warn: (message, context) => get().addLog(message, 'warn', context),
        error: (message, context) => get().addLog(message, 'error', context),
        debug: (message, context) => get().addLog(message, 'debug', context),
        success: (message, context) => get().addLog(message, 'success', context),

        getLogsByLevel: (level) => {
          return get().logs.filter(log => log.level === level)
        },

        getRecentLogs: (count) => {
          const logs = get().logs
          return logs.slice(-count)
        }
      }),
      {
        name: 'log-store',
        partialize: (state) => ({ 
          logs: state.logs.slice(-100), // Only persist last 100 logs
          logLevel: state.logLevel,
          maxLogs: state.maxLogs
        })
      }
    ),
    { name: 'log-store' }
  )
)