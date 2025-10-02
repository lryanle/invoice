/**
 * Enterprise-grade authentication guards and middleware utilities
 */

import { NextRequest, NextResponse } from "next/server"
import {
  authenticateRequest,
  checkRateLimit,
  validateCSRFToken,
  logSecurityEvent
} from "./security"

// Route patterns for different access levels
export const ROUTE_PATTERNS = {
  API_PUBLIC: [
    "/api/health",
    "/api/webhooks",
  ],
  API_PROTECTED: [
    "/api/user",
    "/api/clients",
    "/api/invoices", 
    "/api/analytics",
    "/api/dashboard",
  ],
} as const

export interface AuthContext {
  userId: string
  sessionId: string
  isAuthenticated: boolean
}

/**
 * Determine if an API route is public
 */
export function isPublicAPIRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.API_PUBLIC.some(pattern => 
    pathname === pattern || pathname.startsWith(pattern + "/")
  )
}

/**
 * Determine if an API route is protected
 */
export function isProtectedAPIRoute(pathname: string): boolean {
  return ROUTE_PATTERNS.API_PROTECTED.some(pattern => 
    pathname === pattern || pathname.startsWith(pattern + "/")
  )
}

/**
 * Authentication guard for API routes
 */
export async function withAuth(
  handler: (request: NextRequest, context: AuthContext) => Promise<NextResponse>,
  options: {
    requireCSRF?: boolean
    rateLimit?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { requireCSRF = false, rateLimit = true } = options

    try {
      // Rate limiting
      if (rateLimit) {
        const rateLimitResult = checkRateLimit(request)
        if (!rateLimitResult.allowed) {
          logSecurityEvent("RATE_LIMIT_EXCEEDED", request)
          return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429 }
          )
        }
      }

      // CSRF protection for state-changing operations
      if (requireCSRF && ["POST", "PUT", "DELETE", "PATCH"].includes(request.method)) {
        if (!validateCSRFToken(request)) {
          logSecurityEvent("CSRF_TOKEN_INVALID", request)
          return NextResponse.json(
            { error: "Invalid CSRF token" },
            { status: 403 }
          )
        }
      }

      // Authentication
      const authResult = await authenticateRequest(request)
      if (!authResult.isAuthenticated) {
        logSecurityEvent("AUTHENTICATION_FAILED", request, undefined, {
          error: authResult.error
        })
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        )
      }

      // Create auth context
      const authContext: AuthContext = {
        userId: authResult.userId!,
        sessionId: authResult.sessionId!,
        isAuthenticated: true,
      }

      // Call the actual handler
      return await handler(request, authContext)

    } catch (error) {
      console.error("Auth guard error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}

/**
 * Public API route guard (no authentication required)
 */
export function withPublicAPI(
  handler: (request: NextRequest) => Promise<NextResponse>,
  options: { rateLimit?: boolean } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { rateLimit = true } = options

    try {
      // Rate limiting
      if (rateLimit) {
        const rateLimitResult = checkRateLimit(request)
        if (!rateLimitResult.allowed) {
          logSecurityEvent("RATE_LIMIT_EXCEEDED", request)
          return NextResponse.json(
            { error: "Rate limit exceeded" },
            { status: 429 }
          )
        }
      }

      return await handler(request)

    } catch (error) {
      console.error("Public API guard error:", error)
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      )
    }
  }
}
