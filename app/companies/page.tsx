import { CompaniesPageClient } from "./companies-page-client"
import { validateProfileSetup } from "@/lib/profile-validation"

export default async function CompaniesPage() {
  await validateProfileSetup()

  return <CompaniesPageClient />
}
