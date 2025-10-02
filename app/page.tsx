"use client"

import { SignedIn, SignedOut, SignInButton, useAuth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Building2, DollarSign, Download, Loader2 } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HomePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isLoaded, isSignedIn } = useAuth()
  const redirectUrl = searchParams.get("redirect_url")

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const targetUrl = redirectUrl || "/dashboard"
      router.push(targetUrl)
    }
  }, [isLoaded, isSignedIn, redirectUrl, router])

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-foreground font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">invoice.lryanle.com</CardTitle>
              <CardDescription>Professional invoice management with PDF export and client tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Create Invoices</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Building2 className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Manage Clients</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Track Payments</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Download className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Export PDF</span>
                </div>
              </div>
              <SignInButton 
                mode="modal"
                forceRedirectUrl={redirectUrl || "/dashboard"}
              >
                <Button className="w-full" size="lg">
                  Sign In with Google
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
      
      <SignedIn>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-foreground font-medium">Redirecting to dashboard...</span>
          </div>
        </div>
      </SignedIn>
    </div>
  )
}
