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
    const clientId = clientIdParam === "all" ? "all" : clientIdParam || undefined
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    
    let dateRange: { start: Date; end: Date } | undefined
    if (startDate && endDate) {
      dateRange = {
        start: new Date(startDate),
        end: new Date(endDate)
      }
    }

    const analytics = await DatabaseService.getClientAnalytics(userId, clientId, dateRange)

    if (clientId && clientId !== "all" && !analytics) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching client analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
