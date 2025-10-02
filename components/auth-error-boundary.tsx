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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="text-foreground font-medium">Loading...</span>
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 dark:bg-destructive/20">
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold text-foreground">
                  Authentication Required
                </CardTitle>
                <CardDescription className="text-base text-muted-foreground max-w-md mx-auto">
                  You need to sign in to access this page. Please authenticate to continue.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button 
                onClick={() => {
                  const redirectUrl = new URL("/", window.location.origin)
                  redirectUrl.searchParams.set("redirect_url", window.location.href)
                  router.push(redirectUrl.toString())
                }}
                className="w-full h-11 text-base font-medium"
                size="lg"
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
