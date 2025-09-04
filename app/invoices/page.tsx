import { validateProfileSetup } from "@/lib/profile-validation"
import { InvoicesPageClient } from "./invoices-page-client"

export default async function InvoicesPage() {
  // Validate profile setup server-side - redirects if incomplete
  await validateProfileSetup()

  return <InvoicesPageClient />
}
