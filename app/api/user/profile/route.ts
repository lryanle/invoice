import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await DatabaseService.getUserProfile(userId)
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { fullName, email, phone, address } = body

    // Check if profile exists
    const existingProfile = await DatabaseService.getUserProfile(userId)

    if (existingProfile) {
      // Update existing profile
      await DatabaseService.updateUserProfile(userId, {
        fullName,
        email,
        phone,
        address,
      })
    } else {
      // Create new profile
      await DatabaseService.createUserProfile({
        clerkUserId: userId,
        fullName,
        email,
        phone,
        address,
      })
    }

    const updatedProfile = await DatabaseService.getUserProfile(userId)
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error saving user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
