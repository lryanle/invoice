import { SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Building2, DollarSign, Download } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SignedOut>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-primary">invoice.lryanle.com</CardTitle>
              <CardDescription>Professional invoice management with PDF export and company tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <FileText className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Create Invoices</span>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <Building2 className="h-8 w-8 text-primary" />
                  <span className="text-sm text-muted-foreground">Manage Companies</span>
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
              <SignInButton mode="modal">
                <Button className="w-full" size="lg">
                  Sign In with Google
                </Button>
              </SignInButton>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
    </div>
  )
}
