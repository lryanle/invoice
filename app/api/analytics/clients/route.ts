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
    const clientIdParam = searchParams.get("clientId")
    const clientId = clientIdParam === "all" ? undefined : clientIdParam

    const analytics = await DatabaseService.getClientAnalytics(userId, clientId)

    if (clientId && !analytics) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    if (clientId) {
      return NextResponse.json(analytics)
    } else {
      return NextResponse.json({ clientsAnalytics: analytics })
    }
  } catch (error) {
    console.error("Error fetching client analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
