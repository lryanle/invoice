/**
 * Client-side error handling utilities and hooks
 */

import { useState, useCallback } from 'react'
import { toast } from '@/hooks/use-toast'
import * as Sentry from '@sentry/nextjs'

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
  timestamp: string
  errorId?: string
  retryable?: boolean
  retryAfter?: number
}

export interface ErrorState {
  error: ApiError | null
  isLoading: boolean
  retryCount: number
}

/**
 * Custom hook for handling API errors with retry logic
 */
export function useErrorHandler() {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    retryCount: 0,
  })

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error)

    // Capture error in Sentry
    Sentry.captureException(error, {
      tags: {
        context: context || 'unknown',
        clientSide: true,
      },
      extra: {
        timestamp: new Date().toISOString(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      },
    })

    // Parse API error if it's a response
    let apiError: ApiError | null = null
    if (error && typeof error === 'object' && 'error' in error) {
      const errorData = (error as any).error
      apiError = {
        code: errorData.code || 'UNKNOWN_ERROR',
        message: errorData.message || 'An unexpected error occurred',
        details: errorData.details,
        timestamp: errorData.timestamp || new Date().toISOString(),
        errorId: errorData.errorId,
        retryable: errorData.retryable || false,
        retryAfter: errorData.retryAfter,
      }
    } else if (error instanceof Error) {
      apiError = {
        code: 'CLIENT_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        retryable: true,
      }
    } else {
      apiError = {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        retryable: true,
      }
    }

    setErrorState(prev => ({
      ...prev,
      error: apiError,
      isLoading: false,
    }))

    // Show user-friendly toast
    toast({
      title: "Error",
      description: apiError.message,
      variant: "destructive",
    })
  }, [])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isLoading: false,
      retryCount: 0,
    })
  }, [])

  const retry = useCallback(async (retryFn: () => Promise<any>) => {
    if (!errorState.error?.retryable) {
      return
    }

    setErrorState(prev => ({
      ...prev,
      isLoading: true,
      retryCount: prev.retryCount + 1,
    }))

    try {
      await retryFn()
      clearError()
    } catch (error) {
      handleError(error, 'retry')
    }
  }, [errorState.error?.retryable, handleError, clearError])

  return {
    errorState,
    handleError,
    clearError,
    retry,
  }
}

/**
 * Wrapper for API calls with error handling
 */
export async function apiCall<T>(
  apiFunction: () => Promise<T>,
  context?: string
): Promise<T | null> {
  try {
    return await apiFunction()
  } catch (error) {
    console.error(`API call failed in ${context || 'unknown context'}:`, error)
    
    // Capture in Sentry
    Sentry.captureException(error, {
      tags: {
        context: context || 'api-call',
        clientSide: true,
      },
    })

    // Re-throw to be handled by the calling component
    throw error
  }
}

/**
 * Parse fetch response errors
 */
export async function parseApiError(response: Response): Promise<ApiError> {
  try {
    const errorData = await response.json()
    return {
      code: errorData.error?.code || 'HTTP_ERROR',
      message: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`,
      details: errorData.error?.details,
      timestamp: errorData.error?.timestamp || new Date().toISOString(),
      errorId: errorData.error?.errorId,
      retryable: errorData.error?.retryable || false,
      retryAfter: errorData.error?.retryAfter,
    }
  } catch {
    return {
      code: 'HTTP_ERROR',
      message: `HTTP ${response.status}: ${response.statusText}`,
      timestamp: new Date().toISOString(),
      retryable: response.status >= 500,
    }
  }
}

/**
 * Enhanced fetch with error handling
 */
export async function fetchWithErrorHandling(
  url: string,
  options: RequestInit = {},
  context?: string
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await parseApiError(response)
      throw error
    }

    return response
  } catch (error) {
    // Capture in Sentry
    Sentry.captureException(error, {
      tags: {
        context: context || 'fetch',
        clientSide: true,
        url,
      },
    })

    throw error
  }
}

