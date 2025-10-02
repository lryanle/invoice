/**
 * Enterprise-grade error handling and monitoring system
 */

import { NextRequest, NextResponse } from "next/server"
import { logSystem, AuditEventType, AuditSeverity } from "./audit-logger"

export enum ErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export interface ErrorDetails {
  code: ErrorCode
  message: string
  details?: Record<string, any>
  timestamp: string
  requestId?: string
  userId?: string
  severity: AuditSeverity
  retryable: boolean
  retryAfter?: number
}

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly details?: Record<string, any>
  public readonly severity: AuditSeverity
  public readonly retryable: boolean
  public readonly retryAfter?: number

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: number = 500,
    details?: Record<string, any>,
    severity: AuditSeverity = AuditSeverity.MEDIUM,
    retryable: boolean = false,
    retryAfter?: number
  ) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.severity = severity
    this.retryable = retryable
    this.retryAfter = retryAfter
  }
}

// Essential error creators
export const createError = {
  unauthorized: (message: string = "Authentication required") =>
    new AppError(ErrorCode.UNAUTHORIZED, message, 401),

  forbidden: (message: string = "Access denied") =>
    new AppError(ErrorCode.FORBIDDEN, message, 403),

  notFound: (message: string = "Resource not found") =>
    new AppError(ErrorCode.RESOURCE_NOT_FOUND, message, 404),

  validationError: (message: string = "Validation failed") =>
    new AppError(ErrorCode.VALIDATION_ERROR, message, 400),

  rateLimitExceeded: () =>
    new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, "Rate limit exceeded", 429),

  internalError: (message: string = "Internal server error") =>
    new AppError(ErrorCode.INTERNAL_SERVER_ERROR, message, 500),
}

/**
 * Global error handler for API routes
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleError(error, args[0] as NextRequest)
    }
  }
}

/**
 * Handle errors and create appropriate responses
 */
export async function handleError(
  error: unknown,
  request?: NextRequest
): Promise<NextResponse> {
  const errorId = generateErrorId()

  // Log critical errors only
  if (error instanceof AppError && error.severity === AuditSeverity.CRITICAL) {
    await logSystem(AuditEventType.SYSTEM_ERROR, {
      errorId,
      error: error.message,
      code: error.code
    })
  }

  // Handle different error types
  if (error instanceof AppError) {
    return createAppErrorResponse(error, request, errorId)
  }

  // Handle unknown errors
  return handleUnknownError(error, request, errorId)
}

/**
 * Create error response
 */
function createAppErrorResponse(
  error: AppError,
  request?: NextRequest,
  errorId?: string
): NextResponse {
  const response = NextResponse.json(
    {
      error: {
        code: error.code,
        message: error.message,
        details: process.env.NODE_ENV === "development" ? error.details : undefined,
        timestamp: new Date().toISOString(),
        errorId,
        retryable: error.retryable,
        ...(error.retryAfter && { retryAfter: error.retryAfter }),
      },
    },
    { status: error.statusCode }
  )

  // Add retry headers if applicable
  if (error.retryAfter) {
    response.headers.set("Retry-After", error.retryAfter.toString())
  }

  // Add security headers
  response.headers.set("X-Error-ID", errorId || "unknown")
  response.headers.set("X-Error-Code", error.code)

  return response
}


/**
 * Handle unknown errors
 */
function handleUnknownError(
  error: unknown,
  request?: NextRequest,
  errorId?: string
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "An unexpected error occurred",
        timestamp: new Date().toISOString(),
        errorId,
        ...(process.env.NODE_ENV === "development" && {
          details: error instanceof Error ? error.message : String(error),
        }),
      },
    },
    { status: 500 }
  )
}


/**
 * Generate unique error ID
 */
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(
  error: AppError,
  request?: NextRequest,
  errorId?: string
): NextResponse {
  return createAppErrorResponse(error, request, errorId)
}
