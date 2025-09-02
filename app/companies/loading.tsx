import { SkeletonCard } from "@/components/ui/skeleton"

export default function CompaniesLoading() {
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
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          </div>

          {/* Company cards skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
