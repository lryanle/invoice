import { Suspense } from "react"
import { Navbar } from "@/components/navbar"
import { AnalyticsDashboard } from "@/components/analytics-dashboard"
import { validateProfileSetup } from "@/lib/profile-validation"

export default async function AnalyticsPage() {
  await validateProfileSetup()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your invoicing performance and client relationships
          </p>
        </div>

        <Suspense fallback={<div className="text-center py-8">Loading analytics...</div>}>
          <AnalyticsDashboard />
        </Suspense>
      </main>
    </div>
  )
}
