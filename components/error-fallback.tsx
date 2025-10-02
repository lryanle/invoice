"use client"

import React from 'react'
import { useErrorHandler } from '@/lib/client-error-handler'

interface ErrorFallbackProps {
  readonly error: Error
  readonly resetError: () => void
  readonly context?: string
}

/**
 * Error fallback component for error boundaries
 */
export function ErrorFallback({ 
  error, 
  resetError, 
  context 
}: ErrorFallbackProps) {
  const { handleError } = useErrorHandler()

  // Capture error when component mounts
  React.useEffect(() => {
    handleError(error, context)
  }, [error, context, handleError])

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-destructive">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="mb-2 text-lg font-semibold text-foreground">
        Something went wrong
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {context ? `Error in ${context}` : 'An unexpected error occurred'}
      </p>
      <button
        onClick={resetError}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  )
}
