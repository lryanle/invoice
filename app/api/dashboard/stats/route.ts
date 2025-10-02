import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user profile using email-based lookup to ensure clerkUserId is up to date
    const userProfile = await DatabaseService.getUserProfileByClerkId(userId)
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get all invoices and clients for the user using email as the primary identifier
    const [invoices, clients] = await Promise.all([
      DatabaseService.getInvoicesByUser(userProfile.email),
      DatabaseService.getClientsByUser(userProfile.email)
    ])

    const totalInvoices = invoices.length
    const totalClients = clients.length
    const totalInvoicedAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const averageInvoiceAmount = totalInvoices > 0 ? totalInvoicedAmount / totalInvoices : 0

    return NextResponse.json({
      totalInvoices,
      totalClients,
      totalInvoicedAmount,
      averageInvoiceAmount,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
