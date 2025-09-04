import { InvoiceForm } from "@/components/invoice-form"
import { Navbar } from "@/components/navbar"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ManageInvoicePage({ params }: PageProps) {
  const { id } = await params
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {/* Main Content */}
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <InvoiceForm invoiceId={id} />
        </div>
      </main>
    </div>
  )
}


