"use client"

import React from 'react'
import SentryErrorBoundary from './sentry-error-boundary'
import { ErrorFallback } from '@/components/error-fallback'

/**
 * Default fallback component for error boundaries
 */
function DefaultFallbackComponent({ 
  error, 
  resetError, 
  context 
}: Readonly<{ 
  error?: Error
  resetError: () => void
  context?: string 
}>) {
  return (
    <ErrorFallback 
      error={error || new Error('Unknown error')} 
      resetError={resetError}
      context={context}
    />
  )
}

/**
 * Section fallback component for section error boundaries
 */
function SectionFallbackComponent({ 
  error, 
  resetError, 
  sectionName 
}: Readonly<{ 
  error?: Error
  resetError: () => void
  sectionName: string 
}>) {
  return (
    <SectionErrorFallback 
      error={error} 
      resetError={resetError} 
      sectionName={sectionName} 
    />
  )
}

/**
 * Creates a section fallback component with the given section name
 */
function createSectionFallback(sectionName: string) {
  return function SectionFallbackWithName({ 
    error, 
    resetError 
  }: { 
    error?: Error
    resetError: () => void 
  }) {
    return (
      <SectionFallbackComponent 
        error={error} 
        resetError={resetError} 
        sectionName={sectionName} 
      />
    )
  }
}

interface ErrorBoundaryWrapperProps {
  readonly children: React.ReactNode
  readonly fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
  readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  readonly context?: string
}

/**
 * Wrapper component that provides comprehensive error boundary functionality
 * with custom fallback UI and context-aware error handling
 */
export function ErrorBoundaryWrapper({ 
  children, 
  fallback,
  onError,
  context 
}: Readonly<ErrorBoundaryWrapperProps>) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${context || 'unknown context'}:`, error, errorInfo)
    }
  }

  const CustomFallback = fallback || ((props: { error?: Error; resetError: () => void }) => (
    <DefaultFallbackComponent 
      error={props.error} 
      resetError={props.resetError} 
      context={context} 
    />
  ))

  return (
    <SentryErrorBoundary
      fallback={CustomFallback}
      onError={handleError}
    >
      {children}
    </SentryErrorBoundary>
  )
}

/**
 * HOC for wrapping components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    readonly fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
    readonly onError?: (error: Error, errorInfo: React.ErrorInfo) => void
    readonly context?: string
  }
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundaryWrapper
      fallback={options?.fallback}
      onError={options?.onError}
      context={options?.context}
    >
      <Component {...props} />
    </ErrorBoundaryWrapper>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

/**
 * Section error fallback component
 */
function SectionErrorFallback({ 
  error, 
  resetError, 
  sectionName 
}: Readonly<{ 
  error?: Error
  resetError: () => void
  sectionName: string 
}>) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <div className="mb-4 text-destructive">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground">
        Error in {sectionName}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Something went wrong in this section. You can try refreshing or contact support if the problem persists.
      </p>
      <button
        onClick={resetError}
        className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  )
}

/**
 * Error boundary for specific sections of the app
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName 
}: Readonly<{ 
  children: React.ReactNode
  sectionName: string 
}>) {
  return (
    <ErrorBoundaryWrapper
      context={`section-${sectionName}`}
      fallback={createSectionFallback(sectionName)}
    >
      {children}
    </ErrorBoundaryWrapper>
  )
}
