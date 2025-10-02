/**
 * Enterprise-grade Clerk configuration and environment variable validation
 */

import { logSystem, AuditEventType } from "./audit-logger"

export interface ClerkConfig {
  publishableKey: string
  secretKey: string
  webhookSecret?: string
  domain?: string
  isProduction: boolean
  isConfigured: boolean
}

export function validateClerkConfig(): ClerkConfig {
  const requiredEnvVars = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  }

  const optionalEnvVars = {
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    NEXT_PUBLIC_CLERK_DOMAIN: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    const error = new Error(
      `Missing required Clerk environment variables: ${missingVars.join(", ")}`
    )
    
    // Log configuration error
    logSystem(AuditEventType.SYSTEM_ERROR, {
      error: "Missing Clerk environment variables",
      missingVars,
      environment: process.env.NODE_ENV
    })
    
    throw error
  }

  // Validate key formats
  if (!requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_")) {
    const error = new Error("Invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format")
    logSystem(AuditEventType.SYSTEM_ERROR, {
      error: "Invalid Clerk publishable key format",
      key: requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 10) + "..."
    })
    throw error
  }

  if (!requiredEnvVars.CLERK_SECRET_KEY?.startsWith("sk_")) {
    const error = new Error("Invalid CLERK_SECRET_KEY format")
    logSystem(AuditEventType.SYSTEM_ERROR, {
      error: "Invalid Clerk secret key format",
      key: requiredEnvVars.CLERK_SECRET_KEY?.substring(0, 10) + "..."
    })
    throw error
  }

  // Determine if this is production
  const isProduction = process.env.NODE_ENV === "production"
  const isTestKey = requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_test_")
  const isLiveKey = requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.startsWith("pk_live_")

  // Validate environment consistency
  if (isProduction && isTestKey) {
    console.warn("WARNING: Using test Clerk keys in production environment")
    logSystem(AuditEventType.SYSTEM_ERROR, {
      error: "Test Clerk keys detected in production",
      environment: process.env.NODE_ENV
    })
  }

  if (!isProduction && isLiveKey) {
    console.warn("WARNING: Using live Clerk keys in non-production environment")
    logSystem(AuditEventType.SYSTEM_ERROR, {
      error: "Live Clerk keys detected in non-production",
      environment: process.env.NODE_ENV
    })
  }

  const config: ClerkConfig = {
    publishableKey: requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: requiredEnvVars.CLERK_SECRET_KEY,
    webhookSecret: optionalEnvVars.CLERK_WEBHOOK_SECRET,
    domain: optionalEnvVars.NEXT_PUBLIC_CLERK_DOMAIN,
    isProduction,
    isConfigured: true,
  }

  // Log successful configuration
  logSystem(AuditEventType.SYSTEM_ERROR, {
    message: "Clerk configuration validated successfully",
    environment: process.env.NODE_ENV,
    isProduction,
    hasWebhookSecret: !!config.webhookSecret,
    hasCustomDomain: !!config.domain
  })

  return config
}

export function getClerkConfig(): ClerkConfig {
  try {
    return validateClerkConfig()
  } catch (error) {
    console.error("Clerk configuration error:", error)
    
    // In production, we want to fail fast
    if (process.env.NODE_ENV === "production") {
      throw error
    }
    
    // In development, provide fallback values with warnings
    console.warn("Using fallback Clerk configuration for development")
    
    return {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      secretKey: process.env.CLERK_SECRET_KEY || "",
      webhookSecret: process.env.CLERK_WEBHOOK_SECRET,
      domain: process.env.NEXT_PUBLIC_CLERK_DOMAIN,
      isProduction: false,
      isConfigured: false,
    }
  }
}

/**
 * Get Clerk configuration for client-side usage
 */
export function getClerkClientConfig() {
  const config = getClerkConfig()
  
  return {
    publishableKey: config.publishableKey,
    domain: config.domain,
    isProduction: config.isProduction,
    isConfigured: config.isConfigured,
  }
}

/**
 * Validate webhook secret
 */
export function validateWebhookSecret(secret?: string): boolean {
  if (!secret) {
    return false
  }
  
  // Webhook secrets should be at least 32 characters
  if (secret.length < 32) {
    return false
  }
  
  return true
}

/**
 * Get webhook configuration
 */
export function getWebhookConfig() {
  const config = getClerkConfig()
  
  if (!config.webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is required for webhook processing")
  }
  
  if (!validateWebhookSecret(config.webhookSecret)) {
    throw new Error("Invalid CLERK_WEBHOOK_SECRET format")
  }
  
  return {
    secret: config.webhookSecret,
    isProduction: config.isProduction,
  }
}
