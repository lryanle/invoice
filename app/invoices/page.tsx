import { validateProfileForInvoices } from "@/lib/profile-validation"
import { InvoicesPageClient } from "./invoices-page-client"

export default async function InvoicesPage() {
  await validateProfileForInvoices()

  return <InvoicesPageClient />
}
