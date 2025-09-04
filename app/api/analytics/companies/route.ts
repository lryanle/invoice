import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    const analytics = await DatabaseService.getCompanyAnalytics(userId, companyId || undefined)

    if (companyId && !analytics) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    if (companyId) {
      return NextResponse.json(analytics)
    } else {
      return NextResponse.json({ companiesAnalytics: analytics })
    }
  } catch (error) {
    console.error("Error fetching company analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
