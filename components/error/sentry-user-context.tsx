"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import * as Sentry from "@sentry/nextjs"

interface SentryUserContextProviderProps {
  readonly children: React.ReactNode
}

export function SentryUserContextProvider({ children }: SentryUserContextProviderProps) {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Set user context in Sentry
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || undefined,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      })

      // Set additional context
      Sentry.setContext("user", {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || undefined,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        createdAt: user.createdAt,
        lastSignInAt: user.lastSignInAt,
        hasImage: !!user.imageUrl,
        emailVerified: user.emailAddresses[0]?.verification?.status === "verified",
      })

      // Set tags for better filtering
      Sentry.setTag("user.verified", user.emailAddresses[0]?.verification?.status === "verified")
      Sentry.setTag("user.hasImage", !!user.imageUrl)
    } else if (isLoaded && !user) {
      // Clear user context when logged out
      Sentry.setUser(null)
    }
  }, [user, isLoaded])

  return <>{children}</>
}

/**
 * Hook to manually set Sentry user context
 */
export function useSentryUserContext() {
  const { user, isLoaded } = useUser()

  const setUserContext = () => {
    if (isLoaded && user) {
      Sentry.setUser({
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || undefined,
        username: user.username || undefined,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      })
    }
  }

  const clearUserContext = () => {
    Sentry.setUser(null)
  }

  const setUserTag = (key: string, value: string) => {
    Sentry.setTag(`user.${key}`, value)
  }

  const setUserContextData = (data: Record<string, any>) => {
    Sentry.setContext("user", data)
  }

  return {
    setUserContext,
    clearUserContext,
    setUserTag,
    setUserContextData,
    user,
    isLoaded,
  }
}
