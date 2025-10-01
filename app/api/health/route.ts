import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Basic health check
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      clerk: {
        publishableKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        secretKey: !!process.env.CLERK_SECRET_KEY,
      },
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
