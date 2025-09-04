"use client"

import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

interface SettingsPageClientProps {
  showIncompleteToast: boolean
}

export function SettingsPageClient({ showIncompleteToast }: SettingsPageClientProps) {
  const { toast } = useToast()

  useEffect(() => {
    if (showIncompleteToast) {
      toast({
        title: "Profile Setup Required",
        description: "Please complete your profile information to access invoice features.",
        variant: "default",
      })
    }
  }, [showIncompleteToast, toast])

  return null
}