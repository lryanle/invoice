/**
 * Custom hook for API calls with error handling and loading states
 */

import { useState, useCallback } from 'react'
import { useErrorHandler, fetchWithErrorHandling, ApiError } from '@/lib/client-error-handler'
import { toast } from '@/hooks/use-toast'

export interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: ApiError) => void
  showToast?: boolean
  context?: string
}

export interface UseApiReturn<T> {
  data: T | null
  isLoading: boolean
  error: ApiError | null
  execute: (...args: any[]) => Promise<T | null>
  reset: () => void
}

/**
 * Hook for making API calls with built-in error handling
 */
export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { onSuccess, onError, showToast = true, context } = options
  const { errorState, handleError, clearError } = useErrorHandler()
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (...args: any[]): Promise<T | null> => {
    setIsLoading(true)
    clearError()

    try {
      const result = await apiFunction(...args)
      setData(result)
      
      if (onSuccess) {
        onSuccess(result)
      }

      if (showToast && context) {
        toast({
          title: "Success",
          description: `Operation completed successfully`,
        })
      }

      return result
    } catch (error) {
      handleError(error, context)
      
      if (onError && errorState.error) {
        onError(errorState.error)
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [apiFunction, onSuccess, onError, showToast, context, handleError, clearError, errorState.error])

  const reset = useCallback(() => {
    setData(null)
    clearError()
  }, [clearError])

  return {
    data,
    isLoading,
    error: errorState.error,
    execute,
    reset,
  }
}

/**
 * Hook for GET requests
 */
export function useGet<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(async () => {
    const response = await fetchWithErrorHandling(url, {
      method: 'GET',
    }, options.context)
    return response.json()
  }, [url, options.context])

  return useApi(apiFunction, options)
}

/**
 * Hook for POST requests
 */
export function usePost<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(async (body: any) => {
    const response = await fetchWithErrorHandling(url, {
      method: 'POST',
      body: JSON.stringify(body),
    }, options.context)
    return response.json()
  }, [url, options.context])

  return useApi(apiFunction, options)
}

/**
 * Hook for PUT requests
 */
export function usePut<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(async (body: any) => {
    const response = await fetchWithErrorHandling(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    }, options.context)
    return response.json()
  }, [url, options.context])

  return useApi(apiFunction, options)
}

/**
 * Hook for DELETE requests
 */
export function useDelete<T = any>(
  url: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const apiFunction = useCallback(async () => {
    const response = await fetchWithErrorHandling(url, {
      method: 'DELETE',
    }, options.context)
    return response.json()
  }, [url, options.context])

  return useApi(apiFunction, options)
}

/**
 * Hook for optimistic updates
 */
export function useOptimisticUpdate<T = any>(
  updateFunction: (data: T) => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const [optimisticData, setOptimisticData] = useState<T | null>(null)
  const { errorState, handleError, clearError } = useErrorHandler()
  const [isLoading, setIsLoading] = useState(false)

  const execute = useCallback(async (data: T): Promise<T | null> => {
    setIsLoading(true)
    clearError()

    // Set optimistic data immediately
    setOptimisticData(data)

    try {
      const result = await updateFunction(data)
      setOptimisticData(null) // Clear optimistic data on success
      
      if (options.onSuccess) {
        options.onSuccess(result)
      }

      return result
    } catch (error) {
      // Revert optimistic data on error
      setOptimisticData(null)
      handleError(error, options.context)
      
      if (options.onError && errorState.error) {
        options.onError(errorState.error)
      }

      return null
    } finally {
      setIsLoading(false)
    }
  }, [updateFunction, options, handleError, clearError, errorState.error])

  const reset = useCallback(() => {
    setOptimisticData(null)
    clearError()
  }, [clearError])

  return {
    data: optimisticData,
    isLoading,
    error: errorState.error,
    execute,
    reset,
  }
}
