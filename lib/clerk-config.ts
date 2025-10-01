/**
 * Clerk configuration and environment variable validation
 */

export function validateClerkConfig() {
  const requiredEnvVars = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  }

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key)

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required Clerk environment variables: ${missingVars.join(", ")}`
    )
  }

  // Validate key formats
  if (!requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith("pk_")) {
    throw new Error("Invalid NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY format")
  }

  if (!requiredEnvVars.CLERK_SECRET_KEY?.startsWith("sk_")) {
    throw new Error("Invalid CLERK_SECRET_KEY format")
  }

  return {
    publishableKey: requiredEnvVars.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: requiredEnvVars.CLERK_SECRET_KEY,
  }
}

export function getClerkConfig() {
  try {
    return validateClerkConfig()
  } catch (error) {
    console.error("Clerk configuration error:", error)
    
    // In production, we want to fail fast
    if (process.env.NODE_ENV === "production") {
      throw error
    }
    
    // In development, provide fallback values
    return {
      publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "",
      secretKey: process.env.CLERK_SECRET_KEY || "",
    }
  }
}
