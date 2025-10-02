import { InvoiceForm } from "@/components/invoices/invoice-form"
import { ProfileValidationWrapper } from "@/components/forms/profile-validation-wrapper"

export default function NewInvoicePage() {
  return (
    <ProfileValidationWrapper>
      <div className="min-h-screen bg-background">
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
    </ProfileValidationWrapper>
  )
}
