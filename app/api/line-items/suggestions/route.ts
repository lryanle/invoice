import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const suggestions = await DatabaseService.getTopLineItems(userId, 10)
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error("Error fetching line item suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
