import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/settings(.*)", "/clients(.*)", "/invoices(.*)", "/analytics(.*)"])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  // If user is not logged in and trying to access protected routes, redirect to home
  if (isProtectedRoute(req) && !userId) {
    return NextResponse.redirect(new URL("/", req.url))
  }
  
  // If user is logged in and trying to access home page, redirect to dashboard
  if (req.nextUrl.pathname === "/" && userId) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
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
