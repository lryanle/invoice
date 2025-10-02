"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionErrorBoundary } from '@/components/error-boundary-wrapper'
import { useApi } from '@/hooks/use-api'
import { useErrorHandler } from '@/lib/client-error-handler'
import { AlertTriangle, Bug, Zap, RefreshCw } from 'lucide-react'

/**
 * Component that throws an error for testing
 */
function ErrorThrowingComponent({ 
  shouldThrow, 
  setShouldThrow 
}: Readonly<{ 
  shouldThrow: boolean
  setShouldThrow: (value: boolean) => void 
}>) {
  if (shouldThrow) {
    throw new Error('This is a test error thrown intentionally!')
  }
  return (
    <div className="text-center">
      <p className="text-muted-foreground">This component is working fine.</p>
      <Button 
        onClick={() => setShouldThrow(true)}
        variant="destructive"
        className="mt-2"
      >
        <Bug className="mr-2 h-4 w-4" />
        Throw Error
      </Button>
    </div>
  )
}

/**
 * Test page to demonstrate error handling capabilities
 * This page should only be accessible in development
 */
export default function TestErrorsPage() {
  const [shouldThrow, setShouldThrow] = useState(false)
  const { errorState, handleError, clearError } = useErrorHandler()

  // Test API call with error handling
  const { execute: testApiCall, isLoading, error: apiError } = useApi(
    async () => {
      const response = await fetch('/api/test-error')
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }
      return response.json()
    },
    { context: 'test-api-call' }
  )


  // Test async error
  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async error after 1 second')), 1000)
      })
    } catch (error) {
      handleError(error, 'async-test')
    }
  }

  // Test API error
  const testApiError = async () => {
    try {
      const response = await fetch('/api/non-existent-endpoint')
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      handleError(error, 'api-test')
    }
  }

  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Access Denied
            </CardTitle>
            <CardDescription>
              This page is only available in development mode.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Error Handling Test Page
          </CardTitle>
          <CardDescription>
            Test various error scenarios to ensure robust error handling throughout the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Component Error Boundary Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Component Error Boundary</CardTitle>
                <CardDescription>
                  Test error boundary catching component errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SectionErrorBoundary sectionName="test-component">
                  <ErrorThrowingComponent 
                    shouldThrow={shouldThrow} 
                    setShouldThrow={setShouldThrow} 
                  />
                </SectionErrorBoundary>
              </CardContent>
            </Card>

            {/* Async Error Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Async Error Handling</CardTitle>
                <CardDescription>
                  Test handling of asynchronous errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={testAsyncError} variant="outline" className="w-full">
                  <Zap className="mr-2 h-4 w-4" />
                  Test Async Error
                </Button>
              </CardContent>
            </Card>

            {/* API Error Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Error Handling</CardTitle>
                <CardDescription>
                  Test handling of API errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testApiError} 
                  variant="outline" 
                  className="w-full"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Test API Error
                </Button>
              </CardContent>
            </Card>

            {/* API Hook Test */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">API Hook Test</CardTitle>
                <CardDescription>
                  Test useApi hook with error handling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={testApiCall} 
                  disabled={isLoading}
                  variant="outline" 
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  Test API Hook
                </Button>
                {apiError && (
                  <div className="mt-2 p-2 bg-destructive/10 rounded text-sm text-destructive">
                    {apiError.message}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Global Error State */}
          {errorState.error && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Current Error State</CardTitle>
                <CardDescription>
                  Error captured by the global error handler
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <strong>Code:</strong> {errorState.error.code}
                </div>
                <div className="text-sm">
                  <strong>Message:</strong> {errorState.error.message}
                </div>
                <div className="text-sm">
                  <strong>Timestamp:</strong> {errorState.error.timestamp}
                </div>
                {errorState.error.retryable && (
                  <div className="text-sm text-muted-foreground">
                    This error is retryable
                  </div>
                )}
                <Button 
                  onClick={clearError} 
                  variant="outline" 
                  size="sm"
                  className="mt-2"
                >
                  Clear Error
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reset All */}
          <div className="flex justify-center">
            <Button 
              onClick={() => {
                setShouldThrow(false)
                clearError()
              }}
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset All Tests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
