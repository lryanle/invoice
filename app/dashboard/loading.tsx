import { SkeletonStatCard, SkeletonTable } from "@/components/ui/skeleton"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar skeleton */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="ml-auto flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
          </div>

          {/* Quick actions skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-48 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-9 w-full bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>

          {/* Recent invoices skeleton */}
          <SkeletonTable />
        </div>
      </main>
    </div>
  )
}
