import type React from "react"
import type { Metadata } from "next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalNavbar } from "@/components/layout/conditional-navbar"
import { AuthErrorBoundary } from "@/components/error/auth-error-boundary"
import { SentryUserContextProvider } from "@/components/error/sentry-user-context"
import { ErrorBoundaryWrapper } from "@/components/error/error-boundary-wrapper"
import { getClerkConfig } from "@/lib/clerk-config"
import { GlobalErrorHandler } from "@/components/error/global-error-handler"
import "./globals.css"

export const metadata: Metadata = {
  title: "invoice.lryanle.com",
  description: "Easy invoice management",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const clerkConfig = getClerkConfig()
  
  return (
    <ClerkProvider
      publishableKey={clerkConfig.publishableKey}
      signInUrl="/"
      signUpUrl="/"
      appearance={{
        elements: {
          formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
          card: "bg-card text-card-foreground",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          socialButtonsBlockButtonText: "text-foreground",
          formFieldInput: "bg-background border-input text-foreground",
          footerActionLink: "text-primary hover:text-primary/80",
        },
      }}
      // Use new redirect props instead of deprecated ones
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
    >
      <html lang="en">
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link
          rel="icon"
          href="/icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <link
          rel="apple-touch-icon"
          href="/apple-icon?<generated>"
          type="image/<generated>"
          sizes="<generated>"
        />
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
          <GlobalErrorHandler>
            <ErrorBoundaryWrapper context="app-layout">
              <AuthErrorBoundary>
                <SentryUserContextProvider>
                  <ConditionalNavbar />
                  <Suspense fallback={null}>{children}</Suspense>
                  <Toaster />
                  <Analytics />
                </SentryUserContextProvider>
              </AuthErrorBoundary>
            </ErrorBoundaryWrapper>
          </GlobalErrorHandler>
        </body>
      </html>
    </ClerkProvider>
  )
}
