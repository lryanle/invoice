import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the most recent invoice to find the last used client
    const invoices = await DatabaseService.getInvoicesByUser(userId)
    
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ clientId: null })
    }

    const lastInvoice = invoices[0] // Already sorted by createdAt desc
    const client = await DatabaseService.getClientById(lastInvoice.clientId)

    if (!client) {
      return NextResponse.json({ clientId: null })
    }

    return NextResponse.json({ 
      clientId: client._id.toString(),
      clientName: client.name 
    })
  } catch (error) {
    console.error("Error fetching recent client:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent client" },
      { status: 500 }
    )
  }
}
