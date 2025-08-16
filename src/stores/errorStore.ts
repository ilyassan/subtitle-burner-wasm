import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface ErrorState {
  message: string
  timestamp: Date
  stack?: string
  context?: Record<string, unknown>
}

export interface ErrorStore {
  errors: ErrorState[]
  currentError: ErrorState | null
  
  // Actions
  addError: (error: Error | string, context?: Record<string, unknown>) => void
  clearError: () => void
  clearAllErrors: () => void
  
  // Error handling utilities
  handleAsync: <T>(promise: Promise<T>, context?: Record<string, unknown>) => Promise<T | null>
}

/**
 * Enhanced error store with comprehensive error tracking and utilities
 */
export const useErrorStore = create<ErrorStore>()(
  devtools(
    (set, get) => ({
      errors: [],
      currentError: null,

      addError: (error, context) => {
        const errorState: ErrorState = {
          message: error instanceof Error ? error.message : error,
          timestamp: new Date(),
          stack: error instanceof Error ? error.stack : undefined,
          context
        }

        set((state) => ({
          errors: [...state.errors, errorState],
          currentError: errorState
        }))

        // Auto-clear error after 10 seconds
        setTimeout(() => {
          set((state) => ({
            currentError: state.currentError === errorState ? null : state.currentError
          }))
        }, 10000)
      },

      clearError: () => {
        set({ currentError: null })
      },

      clearAllErrors: () => {
        set({ errors: [], currentError: null })
      },

      handleAsync: async (promise, context) => {
        try {
          return await promise
        } catch (error) {
          get().addError(error instanceof Error ? error : new Error(String(error)), context)
          return null
        }
      },

    }),
    { name: 'error-store' }
  )
)