import { NextRequest, NextResponse } from "next/server"
import { withPublicAPI } from "@/lib/auth-guards"
import { getClerkConfig } from "@/lib/clerk-config"

async function handleHealthCheck(request: NextRequest) {
  try {
    const clerkConfig = getClerkConfig()
    
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      clerk: {
        configured: !!(clerkConfig.publishableKey && clerkConfig.secretKey),
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export const GET = withPublicAPI(handleHealthCheck, { rateLimit: false })
