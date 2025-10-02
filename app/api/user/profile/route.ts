import { type NextRequest, NextResponse } from "next/server"
import { withAuth, AuthContext } from "@/lib/auth-guards"
import { DatabaseService } from "@/lib/database"

async function handleGetProfile(request: NextRequest, context: AuthContext) {
  try {
    const profile = await DatabaseService.getUserProfile(context.userId)
    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const GET = withAuth(handleGetProfile)

async function handleUpdateProfile(request: NextRequest, context: AuthContext) {
  try {
    const body = await request.json()
    const { fullName, email, phone, address, currency } = body

    // Validate input
    if (!fullName || !email) {
      return NextResponse.json({ error: "Full name and email are required" }, { status: 400 })
    }

    // Check if profile exists
    const existingProfile = await DatabaseService.getUserProfile(context.userId)

    if (existingProfile) {
      // Update existing profile
      await DatabaseService.updateUserProfile(context.userId, {
        fullName,
        email,
        phone,
        currency: currency || "USD",
        address: address || {
          street1: "",
          city: "",
          state: "",
          zip: "",
          country: ""
        },
      })
    } else {
      // Create new profile
      await DatabaseService.createUserProfile({
        clerkUserId: context.userId,
        fullName,
        email,
        phone,
        currency: currency || "USD",
        address: address || {
          street1: "",
          city: "",
          state: "",
          zip: "",
          country: ""
        },
      })
    }

    const updatedProfile = await DatabaseService.getUserProfile(context.userId)
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("Error saving user profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export const POST = withAuth(handleUpdateProfile)
