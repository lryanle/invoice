import { NextRequest, NextResponse } from "next/server"
import { createError, withErrorHandling } from "@/lib/error-handler"

/**
 * Test API endpoint for error handling demonstrations
 * Only available in development mode
 */
async function handleTestError(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    throw createError.forbidden("This endpoint is only available in development")
  }

  // Randomly throw different types of errors for testing
  const errorType = Math.floor(Math.random() * 4)
  
  switch (errorType) {
    case 0:
      throw createError.validationError("Test validation error")
    case 1:
      throw createError.notFound("Test not found error")
    case 2:
      throw createError.internalError("Test internal server error")
    case 3:
      // Return success occasionally
      return NextResponse.json({ 
        success: true, 
        message: "Test API call successful",
        timestamp: new Date().toISOString()
      })
    default:
      throw createError.internalError("Unexpected test error")
  }
}

export const GET = withErrorHandling(handleTestError)
