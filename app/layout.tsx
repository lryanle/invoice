import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"
import { ConditionalNavbar } from "@/components/conditional-navbar"
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
  return (
    <ClerkProvider>
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
          <ConditionalNavbar />
          <Suspense fallback={null}>{children}</Suspense>
          <Toaster />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}
