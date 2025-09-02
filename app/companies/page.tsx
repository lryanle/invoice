import { CompanyList } from "@/components/company-list"
import { CreateCompanyDialog } from "@/components/create-company-dialog"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { FileText, Plus, Settings } from "lucide-react"
import Link from "next/link"

export default function CompaniesPage() {
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
                Dashboard
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
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-foreground">Companies</h2>
              <p className="text-muted-foreground">Manage companies you send invoices to</p>
            </div>
            <CreateCompanyDialog>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </CreateCompanyDialog>
          </div>

          {/* Company List */}
          <CompanyList />
        </div>
      </main>
    </div>
  )
}
