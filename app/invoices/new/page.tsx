import { InvoiceForm } from "@/components/invoice-form"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { FileText, ArrowLeft, Settings } from "lucide-react"
import Link from "next/link"

export default function NewInvoicePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <FileText className="h-8 w-8 text-primary" />
            </Link>
            <h1 className="text-xl font-bold text-primary">Invoice Generator Pro</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </Link>
            <UserButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Page Header */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Create New Invoice</h2>
            <p className="text-muted-foreground">Generate a professional invoice for your client</p>
          </div>

          {/* Invoice Form */}
          <InvoiceForm />
        </div>
      </main>
    </div>
  )
}
