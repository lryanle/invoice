import { type NextRequest, NextResponse } from "next/server"
import { withAuth } from "@/lib/auth-guards"
import { generateCSRFToken, SECURITY_CONFIG } from "@/lib/security"

async function handleGetCSRFToken(request: NextRequest) {
  const token = generateCSRFToken()
  
  const response = NextResponse.json({ token })
  
  // Set the CSRF token as an HTTP-only cookie
  response.cookies.set(SECURITY_CONFIG.CSRF.COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  })
  
  return response
}

export const GET = withAuth(handleGetCSRFToken)
