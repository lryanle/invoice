import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { redirect } from "next/navigation"

export async function validateProfileSetup() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  try {
    const profile = await DatabaseService.getUserProfile(userId)
    const profileComplete = profile && profile.fullName && profile.address?.street1
    
    if (!profileComplete) {
      redirect("/settings")
    }
    
    return profile
  } catch (error) {
    console.error("Error validating profile:", error)
    redirect("/settings")
  }
}

export async function getProfileOrRedirect() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  try {
    const profile = await DatabaseService.getUserProfile(userId)
    return profile
  } catch (error) {
    console.error("Error fetching profile:", error)
    return null
  }
}
