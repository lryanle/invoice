import { InvoiceForm } from "@/components/invoice-form"
import { ProfileValidationWrapper } from "@/components/profile-validation-wrapper"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ManageInvoicePage({ params }: PageProps) {
  const { id } = await params
  
  return (
    <ProfileValidationWrapper>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="p-6">
          <div className="mx-auto max-w-7xl space-y-6">
            <InvoiceForm invoiceId={id} />
          </div>
        </main>
      </div>
    </ProfileValidationWrapper>
  )
}


