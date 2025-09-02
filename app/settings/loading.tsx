export default function SettingsLoading() {
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
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-8 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-48 bg-muted animate-pulse rounded" />
          </div>

          {/* Form skeleton */}
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="space-y-4">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className="h-9 w-full bg-muted animate-pulse rounded" />
            </div>

            <div className="space-y-4">
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-9 w-full bg-muted animate-pulse rounded" />
            </div>

            <div className="space-y-4">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-9 w-full bg-muted animate-pulse rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-9 w-full bg-muted animate-pulse rounded" />
                </div>
              ))}
            </div>

            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </main>
    </div>
  )
}
