"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Settings, X } from "lucide-react"

interface ProfileSetupDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function ProfileSetupDialog({ open, onOpenChange }: ProfileSetupDialogProps) {
  const router = useRouter()

  const handleGoToSettings = () => {
    onOpenChange(false)
    router.push("/settings")
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Profile Setup Required
          </DialogTitle>
          <DialogDescription>
            To create and manage invoices, you need to complete your profile information first. 
            This includes your name and address details that will appear on your invoices.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-medium text-sm">Required Information:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Full name</li>
              <li>• Street address</li>
              <li>• City, state, and country</li>
              <li>• ZIP/postal code</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleGoToSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Go to Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
