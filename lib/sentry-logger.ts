/**
 * Sentry integration for enterprise logging and error tracking
 */

import * as Sentry from "@sentry/nextjs"
import { NextRequest } from "next/server"
import { AuditEventType, AuditSeverity } from "./audit-logger"

export interface SentryLogContext {
  userId?: string
  sessionId?: string
  requestId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  tags?: Record<string, string>
  extra?: Record<string, any>
  [key: string]: any
}

class SentryLogger {
  private readonly enableSentry: boolean

  constructor() {
    this.enableSentry = process.env.NODE_ENV === "production"
  }

  /**
   * Set user context for Sentry
   */
  setUserContext(userId: string, sessionId?: string, additionalData?: Record<string, any>): void {
    if (!this.enableSentry) return

    Sentry.setUser({
      id: userId,
      sessionId,
      ...additionalData,
    })
  }

  /**
   * Set request context for Sentry
   */
  setRequestContext(request: NextRequest, userId?: string): void {
    if (!this.enableSentry) return

    const requestId = request.headers.get("x-request-id") || 
                     request.headers.get("x-correlation-id") ||
                     `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

    Sentry.setContext("request", {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries()),
      requestId,
    })

    if (userId) {
      this.setUserContext(userId)
    }
  }

  /**
   * Log audit events to Sentry
   */
  async logAuditEvent(
    eventType: AuditEventType,
    severity: AuditSeverity,
    context: SentryLogContext,
    details?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    const sentryLevel = this.mapSeverityToSentryLevel(severity)
    const sentryTags = {
      eventType,
      severity,
      ...context.tags,
    }

    Sentry.addBreadcrumb({
      message: `Audit Event: ${eventType}`,
      level: sentryLevel,
      category: "audit",
      data: {
        ...context,
        details,
      },
    })

    // For critical events, also send as Sentry event
    if (severity === AuditSeverity.CRITICAL) {
      Sentry.captureMessage(`Critical Security Event: ${eventType}`, {
        level: sentryLevel,
        tags: sentryTags,
        extra: {
          ...context,
          details,
        },
      })
    }
  }

  /**
   * Log security events to Sentry
   */
  async logSecurityEvent(
    eventType: AuditEventType,
    request: NextRequest,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    const context: SentryLogContext = {
      userId,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      resource: request.url,
      action: request.method,
      tags: {
        eventType,
        category: "security",
      },
    }

    const severity = this.getSecuritySeverity(eventType)
    await this.logAuditEvent(eventType, severity, context, details)
  }

  /**
   * Log system errors to Sentry
   */
  async logSystemError(
    error: Error,
    context?: SentryLogContext,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext("system", context)
        if (context.userId) {
          scope.setUser({ id: context.userId })
        }
      }

      if (additionalData) {
        scope.setExtra("additionalData", additionalData)
      }

      scope.setTag("category", "system")
      scope.setLevel("error")

      Sentry.captureException(error)
    })
  }

  /**
   * Log API errors to Sentry
   */
  async logApiError(
    error: Error,
    request: NextRequest,
    userId?: string,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    const context: SentryLogContext = {
      userId,
      ipAddress: this.getClientIP(request),
      userAgent: request.headers.get("user-agent") || undefined,
      resource: request.url,
      action: request.method,
      tags: {
        category: "api",
        endpoint: request.url,
      },
    }

    await this.logSystemError(error, context, additionalData)
  }

  /**
   * Log performance metrics to Sentry
   */
  async logPerformance(
    operation: string,
    duration: number,
    context?: SentryLogContext,
    additionalData?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    Sentry.addBreadcrumb({
      message: `Performance: ${operation}`,
      level: "info",
      category: "performance",
      data: {
        operation,
        duration,
        ...context,
        ...additionalData,
      },
    })

    // Send as transaction for significant operations
    if (duration > 1000) { // Operations over 1 second
      Sentry.captureMessage(`Slow Operation: ${operation}`, {
        level: "warning",
        tags: {
          category: "performance",
          operation,
        },
        extra: {
          duration,
          ...context,
          ...additionalData,
        },
      })
    }
  }

  /**
   * Log business events to Sentry
   */
  async logBusinessEvent(
    event: string,
    context: SentryLogContext,
    data?: Record<string, any>
  ): Promise<void> {
    if (!this.enableSentry) return

    Sentry.addBreadcrumb({
      message: `Business Event: ${event}`,
      level: "info",
      category: "business",
      data: {
        event,
        ...context,
        ...data,
      },
    })
  }

  private mapSeverityToSentryLevel(severity: AuditSeverity): Sentry.SeverityLevel {
    switch (severity) {
      case AuditSeverity.LOW:
        return "info"
      case AuditSeverity.MEDIUM:
        return "warning"
      case AuditSeverity.HIGH:
        return "error"
      case AuditSeverity.CRITICAL:
        return "fatal"
      default:
        return "info"
    }
  }

  private getSecuritySeverity(eventType: AuditEventType): AuditSeverity {
    switch (eventType) {
      case AuditEventType.RATE_LIMIT_EXCEEDED:
        return AuditSeverity.MEDIUM
      case AuditEventType.AUTHENTICATION_FAILED:
      case AuditEventType.ACCESS_DENIED:
        return AuditSeverity.HIGH
      case AuditEventType.SUSPICIOUS_ACTIVITY:
        return AuditSeverity.CRITICAL
      default:
        return AuditSeverity.MEDIUM
    }
  }

  private getClientIP(request: NextRequest): string | undefined {
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"
    )
  }
}

// Export singleton instance
export const sentryLogger = new SentryLogger()

// Export convenience functions
export const logSecurityToSentry = sentryLogger.logSecurityEvent.bind(sentryLogger)
export const logSystemErrorToSentry = sentryLogger.logSystemError.bind(sentryLogger)
export const logApiErrorToSentry = sentryLogger.logApiError.bind(sentryLogger)
export const logPerformanceToSentry = sentryLogger.logPerformance.bind(sentryLogger)
export const logBusinessEventToSentry = sentryLogger.logBusinessEvent.bind(sentryLogger)
export const setSentryUserContext = sentryLogger.setUserContext.bind(sentryLogger)
export const setSentryRequestContext = sentryLogger.setRequestContext.bind(sentryLogger)
