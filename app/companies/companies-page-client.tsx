"use client"

import { useRef } from "react"
import { CompanyList, CompanyListRef } from "@/components/company-list"
import { CreateCompanyDialog } from "@/components/create-company-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function CompaniesPageClient() {
  const companyListRef = useRef<CompanyListRef>(null)

  const handleCompanyCreated = () => {
    // Trigger a refresh of the company list
    if (companyListRef.current) {
      companyListRef.current.refreshCompanies()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-foreground">Companies</h1>
              <p className="text-muted-foreground">Manage companies you send invoices to</p>
            </div>
            <CreateCompanyDialog onCompanyCreated={handleCompanyCreated}>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Company
              </Button>
            </CreateCompanyDialog>
          </div>

          {/* Company List */}
          <CompanyList ref={companyListRef} />
        </div>
      </main>
    </div>
  )
}
