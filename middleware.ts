import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)", 
  "/settings(.*)", 
  "/clients(.*)", 
  "/invoices(.*)", 
  "/analytics(.*)"
])

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhooks(.*)",
  "/api/health"
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // Allow public routes to pass through
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }
  
  // If user is not logged in and trying to access protected routes, redirect to home
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL("/", req.url)
    signInUrl.searchParams.set("redirect_url", req.url)
    return NextResponse.redirect(signInUrl)
  }
  
  // If user is logged in and trying to access home page, redirect to dashboard
  if (req.nextUrl.pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }
  
  // For API routes, ensure user is authenticated
  if (req.nextUrl.pathname.startsWith("/api/") && !isPublicRoute(req) && !userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
