"use client"

import { useEffect } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"

interface AuthErrorBoundaryProps {
  readonly children: React.ReactNode
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const { isLoaded, isSignedIn, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If auth is loaded but user is not signed in and we're on a protected route
    if (isLoaded && !isSignedIn && !userId) {
      const currentPath = window.location.pathname
      const protectedRoutes = ["/dashboard", "/settings", "/clients", "/invoices", "/analytics"]
      
      if (protectedRoutes.some(route => currentPath.startsWith(route))) {
        // Redirect to home with redirect URL
        const redirectUrl = new URL("/", window.location.origin)
        redirectUrl.searchParams.set("redirect_url", window.location.href)
        router.push(redirectUrl.toString())
      }
    }
  }, [isLoaded, isSignedIn, userId, router])

  // Show loading state while auth is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show error state if there's an auth issue
  if (isLoaded && !isSignedIn && !userId) {
    const currentPath = window.location.pathname
    const protectedRoutes = ["/dashboard", "/settings", "/clients", "/invoices", "/analytics"]
    
    if (protectedRoutes.some(route => currentPath.startsWith(route))) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                You need to sign in to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={() => {
                  const redirectUrl = new URL("/", window.location.origin)
                  redirectUrl.searchParams.set("redirect_url", window.location.href)
                  router.push(redirectUrl.toString())
                }}
                className="w-full"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return <>{children}</>
}
