import { ProfileValidationWrapper } from "@/components/forms/profile-validation-wrapper"
import { InvoicesPageClient } from "./invoices-page-client"

export default function InvoicesPage() {
  return (
    <ProfileValidationWrapper>
      <InvoicesPageClient />
    </ProfileValidationWrapper>
  )
}
