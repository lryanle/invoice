/**
 * Essential security logging for production
 */

import { NextRequest } from "next/server"

export enum AuditEventType {
  // Critical security events only
  AUTHENTICATION_FAILED = "authentication_failed",
  ACCESS_DENIED = "access_denied",
  SUSPICIOUS_ACTIVITY = "suspicious_activity",
  RATE_LIMIT_EXCEEDED = "rate_limit_exceeded",
  SYSTEM_ERROR = "system_error",
}

export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  eventType: AuditEventType
  severity: AuditSeverity
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
  resource?: string
  action?: string
  details?: Record<string, any>
  metadata?: Record<string, any>
  tags?: string[]
}

class AuditLogger {
  private readonly enableLogging: boolean

  constructor() {
    this.enableLogging = process.env.NODE_ENV === "production"
  }

  /**
   * Log critical security events only
   */
  async log(
    eventType: AuditEventType,
    severity: AuditSeverity,
    request?: NextRequest,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    if (!this.enableLogging) return

    const entry: AuditLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      eventType,
      severity,
      userId,
      ipAddress: this.getClientIP(request),
      userAgent: request?.headers.get("user-agent") || undefined,
      resource: request?.url,
      action: request?.method,
      details,
    }

    // Log to console in production
    console.log(`[SECURITY] ${eventType}:`, {
      id: entry.id,
      timestamp: entry.timestamp,
      userId: entry.userId,
      ip: entry.ipAddress,
      resource: entry.resource,
      details: entry.details,
    })
  }

  /**
   * Log security events
   */
  async logSecurity(
    eventType: AuditEventType,
    request: NextRequest,
    userId?: string,
    details?: Record<string, any>
  ): Promise<void> {
    const severity = this.getSecuritySeverity(eventType)
    await this.log(eventType, severity, request, userId, details)
  }

  /**
   * Log system events
   */
  async logSystem(
    eventType: AuditEventType,
    details?: Record<string, any>
  ): Promise<void> {
    await this.log(eventType, AuditSeverity.MEDIUM, undefined, undefined, details)
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

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private getClientIP(request?: NextRequest): string | undefined {
    if (!request) return undefined
    
    return (
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown"
    )
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger()

// Export convenience functions
export const logSecurity = auditLogger.logSecurity.bind(auditLogger)
export const logSystem = auditLogger.logSystem.bind(auditLogger)
