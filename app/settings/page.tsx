import { UserSettingsForm } from "@/components/forms/user-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
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
    </div>
  )
}
