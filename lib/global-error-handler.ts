/**
 * Global error handlers for unhandled errors and promise rejections
 */

import * as Sentry from "@sentry/nextjs"

/**
 * Initialize global error handlers
 * This should be called once in the application
 */
export function initializeGlobalErrorHandlers() {
  // Only initialize in browser environment
  if (typeof window === "undefined") return

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason)
    
    // Capture in Sentry
    Sentry.captureException(event.reason, {
      tags: {
        errorType: "unhandled_promise_rejection",
        global: true,
      },
      extra: {
        promise: event.promise,
        reason: event.reason,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    })

    // Prevent the default browser behavior
    event.preventDefault()
  })

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    console.error("Uncaught error:", event.error)
    
    // Capture in Sentry
    Sentry.captureException(event.error, {
      tags: {
        errorType: "uncaught_error",
        global: true,
      },
      extra: {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      },
    })
  })

  // Handle resource loading errors
  window.addEventListener("error", (event) => {
    // Only handle resource loading errors (not JavaScript errors)
    if (event.target !== window) {
      console.error("Resource loading error:", event)
      
      // Capture in Sentry
      Sentry.captureMessage("Resource loading error", {
        level: "warning",
        tags: {
          errorType: "resource_loading_error",
          global: true,
        },
        extra: {
          target: event.target,
          type: event.type,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        },
      })
    }
  }, true) // Use capture phase to catch resource errors

  console.log("Global error handlers initialized")
}

/**
 * Enhanced error boundary for React components
 * Note: This function should be used in a .tsx file, not .ts
 */
export function createErrorBoundary() {
  // This function is designed to be used in a React component file
  // The actual error boundary component should be implemented in a .tsx file
  console.warn("createErrorBoundary should be used in a .tsx file with proper React imports")
  return null
}

/**
 * Performance monitoring for long tasks
 */
export function initializePerformanceMonitoring() {
  if (typeof window === "undefined") return

  // Monitor long tasks
  if ("PerformanceObserver" in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.duration > 50) { // Tasks longer than 50ms
            Sentry.addBreadcrumb({
              message: "Long task detected",
              level: "warning",
              category: "performance",
              data: {
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
              },
            })

            // Send as event for very long tasks
            if (entry.duration > 200) {
              Sentry.captureMessage("Very long task detected", {
                level: "warning",
                tags: {
                  category: "performance",
                  type: "long_task",
                },
                extra: {
                  duration: entry.duration,
                  startTime: entry.startTime,
                  name: entry.name,
                },
              })
            }
          }
        }
      })

      observer.observe({ entryTypes: ["longtask"] })
    } catch (error) {
      console.warn("Performance monitoring not supported:", error)
    }
  }
}
