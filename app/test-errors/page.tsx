"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useErrorHandler, fetchWithErrorHandling, parseApiError } from "@/lib/client-error-handler"
import { AlertTriangle, Bug, Zap, Network } from "lucide-react"

/**
 * Test page for error handling scenarios
 * Only available in development mode
 */
export default function TestErrorsPage() {
  const [testResults, setTestResults] = useState<string[]>([])
  const { handleError } = useErrorHandler()

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testClientError = () => {
    try {
      throw new Error("Test client-side error")
    } catch (error) {
      handleError(error, "test-client-error")
      addResult("Client error thrown and handled")
    }
  }

  const testAPIError = async () => {
    try {
      const response = await fetchWithErrorHandling("/api/test-error", {}, "test-api-error")
      if (!response.ok) {
        const errorData = await parseApiError(response)
        throw errorData
      }
      addResult("API test successful")
    } catch (error) {
      handleError(error, "test-api-error")
      addResult("API error caught and handled")
    }
  }

  const testNetworkError = async () => {
    try {
      const response = await fetchWithErrorHandling("/api/non-existent-endpoint", {}, "test-network-error")
      if (!response.ok) {
        const errorData = await parseApiError(response)
        throw errorData
      }
    } catch (error) {
      handleError(error, "test-network-error")
      addResult("Network error caught and handled")
    }
  }

  const testPromiseRejection = () => {
    Promise.reject(new Error("Test unhandled promise rejection"))
    addResult("Promise rejection triggered (check console and Sentry)")
  }

  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Test async error")), 100)
      })
    } catch (error) {
      handleError(error, "test-async-error")
      addResult("Async error caught and handled")
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (process.env.NODE_ENV !== "development") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-destructive">
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>This page is only available in development mode.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Error Handling Test Suite</h1>
        <p className="text-muted-foreground">
          Test various error scenarios to verify Sentry integration and error handling
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-destructive" />
              Client Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testClientError} className="w-full">
              Test Client Error
            </Button>
            <Button onClick={testAsyncError} variant="outline" className="w-full">
              Test Async Error
            </Button>
            <Button onClick={testPromiseRejection} variant="outline" className="w-full">
              Test Promise Rejection
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-orange-500" />
              API Errors
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={testAPIError} className="w-full">
              Test API Error
            </Button>
            <Button onClick={testNetworkError} variant="outline" className="w-full">
              Test Network Error
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-500" />
              Error Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => {
                // This will trigger an error boundary
                throw new Error("Test error boundary")
              }}
              className="w-full"
            >
              Test Error Boundary
            </Button>
            <Button 
              onClick={() => {
                // This will cause a render error
                const obj: any = null
                // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                obj.someProperty
              }}
              variant="outline" 
              className="w-full"
            >
              Test Render Error
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Check the browser console and Sentry dashboard for error details
              </p>
              <Button onClick={clearResults} variant="outline" size="sm">
                Clear Results
              </Button>
            </div>
            <div className="bg-muted rounded-lg p-4 max-h-60 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No test results yet. Run some tests above.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result) => (
                    <div key={result} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What to Check</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Browser console should show error logs with context</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Sentry dashboard should receive all errors with proper context</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Error boundaries should catch React errors gracefully</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>Toast notifications should appear for user-friendly error messages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span>User context should be properly set in Sentry</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}