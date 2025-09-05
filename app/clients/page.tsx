import { ClientsPageClient } from "./clients-page-client"
import { validateProfileSetup } from "@/lib/profile-validation"

export default async function ClientsPage() {
  await validateProfileSetup()

  return <ClientsPageClient />
}
