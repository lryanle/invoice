/**
 * Enterprise-grade security utilities for authentication and authorization
 */

import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { auth } from "@clerk/nextjs/server"
import { Webhook } from "svix"
import { getCSPForEnvironment } from "./csp-override"

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security configuration
export const SECURITY_CONFIG = {
  RATE_LIMIT: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100, // per window
    MAX_API_REQUESTS: 1000, // per window for API
  },
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    REFRESH_THRESHOLD: 60 * 60 * 1000, // 1 hour before expiry
  },
  CSRF: {
    TOKEN_HEADER: "x-csrf-token",
    COOKIE_NAME: "csrf-token",
  },
  HEADERS: {
    CORS_ORIGINS: process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"],
  },
} as const

/**
 * Security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
  const allowedOrigins = SECURITY_CONFIG.HEADERS.CORS_ORIGINS.join(", ")
  
  // Use environment-specific CSP
  const csp = getCSPForEnvironment()
  
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": csp,
    "Access-Control-Allow-Origin": allowedOrigins,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-csrf-token",
    "Access-Control-Allow-Credentials": "true",
  }
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(response: NextResponse): NextResponse {
  const headers = getSecurityHeaders()
  
  Object.entries(headers).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

/**
 * Rate limiting implementation
 */
export function checkRateLimit(
  request: NextRequest,
  maxRequests: number = SECURITY_CONFIG.RATE_LIMIT.MAX_REQUESTS
): { allowed: boolean; remaining: number; resetTime: number } {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
  const now = Date.now()
  const windowMs = SECURITY_CONFIG.RATE_LIMIT.WINDOW_MS
  
  const key = `${ip}:${Math.floor(now / windowMs)}`
  const current = rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs }
  
  // Clean up expired entries
  if (now > current.resetTime) {
    rateLimitStore.delete(key)
    const newKey = `${ip}:${Math.floor(now / windowMs)}`
    rateLimitStore.set(newKey, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs }
  }
  
  if (current.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: current.resetTime }
  }
  
  current.count++
  rateLimitStore.set(key, current)
  
  return { 
    allowed: true, 
    remaining: maxRequests - current.count, 
    resetTime: current.resetTime 
  }
}

/**
 * CSRF token generation and validation
 */
export function generateCSRFToken(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get(SECURITY_CONFIG.CSRF.TOKEN_HEADER)
  const cookieToken = request.cookies.get(SECURITY_CONFIG.CSRF.COOKIE_NAME)?.value
  
  if (!token || !cookieToken) {
    return false
  }
  
  return token === cookieToken
}

/**
 * Enhanced authentication with additional security checks
 */
export async function authenticateRequest(request: NextRequest): Promise<{
  userId: string | null
  sessionId: string | null
  isAuthenticated: boolean
  error?: string
}> {
  try {
    const { userId, sessionId } = await auth()
    
    if (!userId) {
      return {
        userId: null,
        sessionId: null,
        isAuthenticated: false,
        error: "No active session"
      }
    }
    
    // Additional security checks
    const userAgent = request.headers.get("user-agent")
    if (!userAgent || userAgent.length < 10) {
      return {
        userId: null,
        sessionId: null,
        isAuthenticated: false,
        error: "Invalid user agent"
      }
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
    ]
    
    if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
      return {
        userId: null,
        sessionId: null,
        isAuthenticated: false,
        error: "Suspicious user agent"
      }
    }
    
    return {
      userId,
      sessionId,
      isAuthenticated: true
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return {
      userId: null,
      sessionId: null,
      isAuthenticated: false,
      error: "Authentication failed"
    }
  }
}

/**
 * Webhook signature verification for Clerk
 */
export async function verifyWebhookSignature(
  request: NextRequest,
  webhookSecret: string
): Promise<{ isValid: boolean; payload?: any; error?: string }> {
  try {
    const payload = await request.text()
    const headersList = await headers()
    
    const svixId = headersList.get("svix-id")
    const svixTimestamp = headersList.get("svix-timestamp")
    const svixSignature = headersList.get("svix-signature")
    
    if (!svixId || !svixTimestamp || !svixSignature) {
      return { isValid: false, error: "Missing required headers" }
    }
    
    const svixHeaders = {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }
    
    const wh = new Webhook(webhookSecret)
    const evt = wh.verify(payload, svixHeaders)
    
    return { isValid: true, payload: evt }
  } catch (error) {
    console.error("Webhook verification error:", error)
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Verification failed" 
    }
  }
}

/**
 * Request logging for security auditing
 */
export function logSecurityEvent(
  event: string,
  request: NextRequest,
  userId?: string | null,
  additionalData?: Record<string, any>
): void {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    method: request.method,
    url: request.url,
    userAgent: request.headers.get("user-agent"),
    ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
    userId,
    ...additionalData,
  }
  
  // In production, send to your logging service
  console.log(`[SECURITY] ${event}:`, JSON.stringify(logData))
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize request body
 */
export function validateRequestBody(body: any, schema?: any): {
  isValid: boolean
  data?: any
  error?: string
} {
  try {
    if (!body || typeof body !== "object") {
      return { isValid: false, error: "Invalid request body" }
    }
    
    // Basic sanitization
    const sanitized = JSON.parse(JSON.stringify(body), (key, value) => {
      if (typeof value === "string") {
        return sanitizeInput(value)
      }
      return value
    })
    
    // Schema validation can be added here if needed
    
    return { isValid: true, data: sanitized }
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : "Invalid JSON" 
    }
  }
}

/**
 * Create a secure error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  request?: NextRequest
): NextResponse {
  const response = NextResponse.json(
    { 
      error: message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === "development" && { 
        debug: "Development mode - additional error details available" 
      })
    },
    { status }
  )
  
  if (request) {
    logSecurityEvent("ERROR_RESPONSE", request, undefined, { message, status })
  }
  
  return applySecurityHeaders(response)
}

/**
 * Create a success response with security headers
 */
export function createSuccessResponse(
  data: any,
  status: number = 200,
  request?: NextRequest
): NextResponse {
  const response = NextResponse.json(data, { status })
  
  if (request) {
    logSecurityEvent("SUCCESS_RESPONSE", request, undefined, { status })
  }
  
  return applySecurityHeaders(response)
}
