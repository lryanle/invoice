import { UserSettingsForm } from "@/components/user-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsPageClient } from "./settings-page-client"

interface SettingsPageProps {
  readonly searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const params = await searchParams
  const showIncompleteToast = params.incomplete === "true"

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your default information for invoices</p>
          </div>

          {/* Settings Content */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>This information will appear on your invoices as the sender details</CardDescription>
            </CardHeader>
            <CardContent>
              <UserSettingsForm />
            </CardContent>
          </Card>
        </div>
      </main>
      
      <SettingsPageClient showIncompleteToast={showIncompleteToast} />
    </div>
  )
}
