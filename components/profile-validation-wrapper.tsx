"use client"

import { useState, useEffect } from "react"
import { useProfileValidation } from "@/hooks/use-profile-validation"
import { ProfileSetupDialog } from "@/components/profile-setup-dialog"

interface ProfileValidationWrapperProps {
  readonly children: React.ReactNode
  readonly requireProfile?: boolean
}

export function ProfileValidationWrapper({ 
  children, 
  requireProfile = true 
}: ProfileValidationWrapperProps) {
  const { isValid, isLoading } = useProfileValidation()
  const [showDialog, setShowDialog] = useState(false)

  useEffect(() => {
    if (!isLoading && requireProfile && !isValid) {
      setShowDialog(true)
    }
  }, [isValid, isLoading, requireProfile])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-foreground font-medium">Loading...</span>
        </div>
      </div>
    )
  }

  if (requireProfile && !isValid) {
    return (
      <>
        <ProfileSetupDialog 
          open={showDialog} 
          onOpenChange={setShowDialog}
        />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="text-muted-foreground">
              Profile setup required to access this page.
            </div>
          </div>
        </div>
      </>
    )
  }

  return <>{children}</>
}
