import { useState, useCallback } from 'react'
import { useErrorStore } from '@/stores/errorStore'
import { useLogStore } from '@/stores/logStore'

export interface AsyncOperationState<T = unknown> {
  isLoading: boolean
  error: string | null
  data: T | null
}

export interface AsyncOperationOptions<T = unknown> {
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
  logContext?: string
}

/**
 * Hook for managing async operations with automatic error handling and logging
 */
export function useAsyncOperation<T = unknown>(
  operation: () => Promise<T>,
  options: AsyncOperationOptions<T> = {}
) {
  const [state, setState] = useState<AsyncOperationState<T>>({
    isLoading: false,
    error: null,
    data: null
  })

  const { addError } = useErrorStore()
  const { info, error: logError, success } = useLogStore()
  const { onSuccess, onError, logContext = 'async-operation' } = options

  const execute = useCallback(async (...args: unknown[]) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      info(`Starting ${logContext}`, { args })
      
      const result = await operation()
      
      setState({
        isLoading: false,
        error: null,
        data: result
      })
      
      success(`Completed ${logContext}`, { result })
      onSuccess?.(result)
      
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message
      }))
      
      addError(error, { context: logContext, args })
      logError(`Failed ${logContext}: ${error.message}`, { error: error.stack })
      onError?.(error)
      
      throw error
    }
  }, [operation, onSuccess, onError, logContext, addError, info, logError, success])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      data: null
    })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}