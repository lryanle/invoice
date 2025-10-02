"use client"

import { useEffect } from "react"
import { initializeGlobalErrorHandlers, initializePerformanceMonitoring } from "@/lib/global-error-handler"

interface GlobalErrorHandlerProps {
  children: React.ReactNode
}

/**
 * Global error handler component that initializes error monitoring
 */
export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  useEffect(() => {
    // Initialize global error handlers
    initializeGlobalErrorHandlers()
    
    // Initialize performance monitoring
    initializePerformanceMonitoring()
  }, [])

  return <>{children}</>
}
