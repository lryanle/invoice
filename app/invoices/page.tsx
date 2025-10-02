import { ProfileValidationWrapper } from "@/components/profile-validation-wrapper"
import { InvoicesPageClient } from "./invoices-page-client"

export default function InvoicesPage() {
  return (
    <ProfileValidationWrapper>
      <InvoicesPageClient />
    </ProfileValidationWrapper>
  )
}
