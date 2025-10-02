"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@clerk/nextjs"

interface ProfileValidationResult {
  isValid: boolean
  isLoading: boolean
  error: string | null
}

export function useProfileValidation(): ProfileValidationResult {
  const { isLoaded, userId } = useAuth()
  const [isValid, setIsValid] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !userId) {
      setIsLoading(false)
      return
    }

    const validateProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/user/profile")
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile")
        }

        const profile = await response.json()
        
        // Check if profile is complete
        const profileComplete = profile?.fullName && profile.address?.street1
        
        setIsValid(profileComplete)
      } catch (err) {
        console.error("Error validating profile:", err)
        setError(err instanceof Error ? err.message : "Unknown error")
        setIsValid(false)
      } finally {
        setIsLoading(false)
      }
    }

    validateProfile()
  }, [isLoaded, userId])

  return { isValid, isLoading, error }
}
