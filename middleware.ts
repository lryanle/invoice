import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"
import { 
  applySecurityHeaders, 
  checkRateLimit
} from "@/lib/security"
import { 
  isPublicAPIRoute, 
  isProtectedAPIRoute 
} from "@/lib/auth-guards"

// Enhanced route matching with more granular control
const isPublicRouteMatcher = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/api/health"
])

const isProtectedRouteMatcher = createRouteMatcher([
  "/dashboard(.*)", 
  "/settings(.*)", 
  "/clients(.*)", 
  "/invoices(.*)", 
  "/analytics(.*)"
])

export default clerkMiddleware(async (auth, req) => {
  try {
    const response = await handleRequest(auth, req)
    return applySecurityHeaders(response)
  } catch (error) {
    console.error("Middleware error:", error)
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
    return applySecurityHeaders(errorResponse)
  }
})

async function handleRequest(auth: any, req: NextRequest): Promise<NextResponse> {
  const { userId, sessionId } = await auth()
  const pathname = req.nextUrl.pathname
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 200 })
    return applySecurityHeaders(response)
  }
  
  // Rate limiting for all requests
  const rateLimitResult = checkRateLimit(req)
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
  
  const response = NextResponse.next()
  
  // Handle public routes
  if (isPublicRouteMatcher(req)) {
    return response
  }
  
  // Handle API routes
  if (pathname.startsWith("/api/")) {
    return handleAPIRoute(req, userId, sessionId)
  }
  
  // Handle protected routes
  if (isProtectedRouteMatcher(req)) {
    return handleProtectedRoute(req, userId, sessionId)
  }
  
  // Handle home page redirects
  if (pathname === "/") {
    return handleHomePage(req, userId)
  }
  
  // Default: allow the request
  return response
}

async function handleAPIRoute(req: NextRequest, userId: string | null, sessionId: string | null): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname
  
  // Public API routes
  if (isPublicAPIRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Protected API routes
  if (isProtectedAPIRoute(pathname)) {
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }
    
    return NextResponse.next()
  }
  
  // Unknown API route - deny by default
  return NextResponse.json(
    { error: "Route not found" },
    { status: 404 }
  )
}

async function handleProtectedRoute(req: NextRequest, userId: string | null, sessionId: string | null): Promise<NextResponse> {
  if (!userId) {
    const signInUrl = new URL("/", req.url)
    signInUrl.searchParams.set("redirect_url", req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  return NextResponse.next()
}

async function handleHomePage(req: NextRequest, userId: string | null): Promise<NextResponse> {
  if (userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
