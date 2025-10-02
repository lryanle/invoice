"use client"

import React from 'react'
import { useErrorHandler } from '@/lib/client-error-handler'
import { TriangleAlert } from 'lucide-react'

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
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
      <div className="mb-4 text-destructive">
        <TriangleAlert className="h-20 w-20" />
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
