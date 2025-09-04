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
    const itemName = searchParams.get("itemName")

    if (!itemName) {
      return NextResponse.json({ error: "Item name is required" }, { status: 400 })
    }

    const recentCost = await DatabaseService.getRecentCostForItem(userId, itemName)
    
    return NextResponse.json({ 
      itemName,
      recentCost: recentCost || 0
    })
  } catch (error) {
    console.error("Error fetching recent cost:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent cost" },
      { status: 500 }
    )
  }
}
