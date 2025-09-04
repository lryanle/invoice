import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Users, Building2, DollarSign, Download } from "lucide-react"
import Link from "next/link"

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

      <SignedIn>
        <div className="flex min-h-screen items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-primary">invoice.lryanle.com</CardTitle>
              <CardDescription className="text-lg">
                Get started by setting up your profile and creating your first client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/dashboard">
                  <Button className="w-full h-20 text-lg" variant="default">
                    <FileText className="mr-2 h-6 w-6" />
                    Go to Dashboard
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button className="w-full h-20 text-lg bg-transparent" variant="outline">
                    <Users className="mr-2 h-6 w-6" />
                    Setup Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </SignedIn>
    </div>
  )
}
