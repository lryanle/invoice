import { UserSettingsForm } from "@/components/user-settings-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">User Settings</h1>
          <p className="text-muted-foreground">Configure your default information for invoices</p>
        </div>

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
    </div>
  )
}
