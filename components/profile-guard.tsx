"use client"

import type React from "react"

import { useUser } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

export function ProfileGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()
  const [hasProfile, setHasProfile] = useState<boolean | null>(null)
  const [showDialog, setShowDialog] = useState(false)

  // Allow access to dashboard and settings pages
  const allowedPaths = ["/dashboard", "/settings"]
  const isAllowedPath = allowedPaths.includes(pathname)

  useEffect(() => {
    if (!user) return

    const checkProfile = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const profile = await response.json()
          const profileComplete = profile && profile.fullName && profile.address?.street1
          setHasProfile(profileComplete)

          if (!profileComplete && !isAllowedPath) {
            setShowDialog(true)
          }
        } else {
          setHasProfile(false)
          if (!isAllowedPath) {
            setShowDialog(true)
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error)
        setHasProfile(false)
        if (!isAllowedPath) {
          setShowDialog(true)
        }
      }
    }

    checkProfile()
  }, [user, pathname, isAllowedPath])

  const handleSetupProfile = () => {
    setShowDialog(false)
    router.push("/settings")
  }

  if (hasProfile === null) {
    return <div>Loading...</div>
  }

  return (
    <>
      {children}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profile Setup Required</DialogTitle>
            <DialogDescription>
              You need to complete your profile setup before accessing this page. Please fill in your basic information
              and address details.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSetupProfile}>Setup Profile</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
