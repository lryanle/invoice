import { CompanyList } from "@/components/company-list"
import { CreateCompanyDialog } from "@/components/create-company-dialog"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { validateProfileSetup } from "@/lib/profile-validation"
import { Plus } from "lucide-react"

export default async function CompaniesPage() {
  await validateProfileSetup()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Companies</h1>
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
