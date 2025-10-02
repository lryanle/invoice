/**
 * Sentry performance monitoring utilities
 */

import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"

export interface PerformanceContext {
  operation: string
  userId?: string
  requestId?: string
  additionalData?: Record<string, unknown>
}

// Simplified performance monitoring using modern Sentry API
interface PerformanceSpan {
  name: string
  op: string
  startTime: number
  attributes: Record<string, unknown>
}

class SentryPerformanceMonitor {
  private readonly enablePerformanceMonitoring: boolean

  constructor() {
    this.enablePerformanceMonitoring = process.env.NODE_ENV === "production"
  }

  /**
   * Start a performance transaction using the modern Sentry API
   */
  startTransaction(
    name: string,
    op: string,
    context?: PerformanceContext
  ): PerformanceSpan | null {
    if (!this.enablePerformanceMonitoring) return null

    // Start the actual span
    Sentry.startSpan({
      name,
      op,
      attributes: {
        ...context?.additionalData,
        userId: context?.userId,
        requestId: context?.requestId,
      },
    }, () => {})

    if (context?.userId) {
      Sentry.setUser({ id: context.userId })
    }

    return {
      name,
      op,
      startTime: Date.now(),
      attributes: {
        ...context?.additionalData,
        userId: context?.userId,
        requestId: context?.requestId,
      },
    }
  }

  /**
   * Start a span within a transaction
   */
  startSpan(
    transaction: PerformanceSpan | null,
    name: string,
    op: string,
    data?: Record<string, unknown>
  ): PerformanceSpan | null {
    if (!transaction) return null

    // Convert unknown values to strings for Sentry attributes
    const attributes = data ? Object.fromEntries(
      Object.entries(data).map(([key, value]) => [
        key, 
        typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' 
          ? value 
          : String(value)
      ])
    ) : undefined

    Sentry.startSpan({
      name,
      op,
      attributes,
    }, () => {})

    return {
      name,
      op,
      startTime: Date.now(),
      attributes: data || {},
    }
  }

  /**
   * Finish a span
   */
  finishSpan(span: PerformanceSpan | null, data?: Record<string, unknown>): void {
    if (!span) return

    const duration = Date.now() - span.startTime
    
    // Log performance data
    if (data) {
      span.attributes = { ...span.attributes, ...data }
    }
    
    // Add duration to attributes
    span.attributes.duration = duration
    
    // Finish the span - spans are automatically finished when the callback completes
    // No explicit finish call needed in modern Sentry API
  }

  /**
   * Finish a transaction
   */
  finishTransaction(
    transaction: PerformanceSpan | null,
    status: "ok" | "cancelled" | "unknown_error" | "internal_error" | "unauthenticated" | "permission_denied" | "not_found" | "invalid_argument" | "deadline_exceeded" | "already_exists" | "resource_exhausted" | "failed_precondition" | "aborted" | "out_of_range" | "unimplemented" | "unavailable" | "data_loss" = "ok"
  ): void {
    if (!transaction) return

    const duration = Date.now() - transaction.startTime
    
    // Add status and duration to attributes
    transaction.attributes.status = status
    transaction.attributes.duration = duration
    
    // Transactions are automatically finished when the callback completes
    // No explicit finish call needed in modern Sentry API
  }

  /**
   * Monitor API route performance
   */
  async monitorApiRoute<T>(
    request: NextRequest,
    operation: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now()
    const requestId = request.headers.get("x-request-id") || 
                     request.headers.get("x-correlation-id") ||
                     `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    const transaction = this.startTransaction(
      `API ${request.method} ${operation}`,
      "http.server",
      {
        operation,
        requestId,
        additionalData: {
          method: request.method,
          url: request.url,
          userAgent: request.headers.get("user-agent"),
        },
      }
    )

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      // Log performance if operation took longer than expected
      if (duration > 1000) {
        console.warn(`Slow API operation: ${operation} took ${duration}ms`)
      }

      this.finishTransaction(transaction, "ok")
      return result
    } catch (error) {
      this.finishTransaction(transaction, "internal_error")
      throw error
    }
  }

  /**
   * Monitor database operation performance
   */
  async monitorDatabaseOperation<T>(
    operation: string,
    handler: () => Promise<T>,
    context?: PerformanceContext
  ): Promise<T> {
    const startTime = Date.now()
    const transaction = this.startTransaction(
      `DB ${operation}`,
      "db.query",
      context
    )

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      // Log slow database operations
      if (duration > 500) {
        console.warn(`Slow database operation: ${operation} took ${duration}ms`)
      }

      this.finishTransaction(transaction, "ok")
      return result
    } catch (error) {
      this.finishTransaction(transaction, "internal_error")
      throw error
    }
  }

  /**
   * Monitor external API call performance
   */
  async monitorExternalApiCall<T>(
    service: string,
    operation: string,
    handler: () => Promise<T>,
    context?: PerformanceContext
  ): Promise<T> {
    const startTime = Date.now()
    const transaction = this.startTransaction(
      `External API ${service} ${operation}`,
      "http.client",
      {
        operation: `${service}-${operation}`,
        ...context,
        additionalData: {
          service,
          operation,
          ...context?.additionalData,
        },
      }
    )

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      // Log slow external API calls
      if (duration > 2000) {
        console.warn(`Slow external API call: ${service} ${operation} took ${duration}ms`)
      }

      this.finishTransaction(transaction, "ok")
      return result
    } catch (error) {
      this.finishTransaction(transaction, "internal_error")
      throw error
    }
  }

  /**
   * Monitor file operation performance
   */
  async monitorFileOperation<T>(
    operation: string,
    handler: () => Promise<T>,
    context?: PerformanceContext
  ): Promise<T> {
    const startTime = Date.now()
    const transaction = this.startTransaction(
      `File ${operation}`,
      "file",
      context
    )

    try {
      const result = await handler()
      const duration = Date.now() - startTime

      // Log slow file operations
      if (duration > 1000) {
        console.warn(`Slow file operation: ${operation} took ${duration}ms`)
      }

      this.finishTransaction(transaction, "ok")
      return result
    } catch (error) {
      this.finishTransaction(transaction, "internal_error")
      throw error
    }
  }
}

// Export singleton instance
export const sentryPerformance = new SentryPerformanceMonitor()

// Export convenience functions
export const monitorApiRoute = sentryPerformance.monitorApiRoute.bind(sentryPerformance)
export const monitorDatabaseOperation = sentryPerformance.monitorDatabaseOperation.bind(sentryPerformance)
export const monitorExternalApiCall = sentryPerformance.monitorExternalApiCall.bind(sentryPerformance)
export const monitorFileOperation = sentryPerformance.monitorFileOperation.bind(sentryPerformance)
