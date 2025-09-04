import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all invoices and companies for the user
    const [invoices, companies] = await Promise.all([
      DatabaseService.getInvoicesByUser(userId),
      DatabaseService.getCompaniesByUser(userId)
    ])

    const totalInvoices = invoices.length
    const totalCompanies = companies.length
    const totalInvoicedAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0)
    const averageInvoiceAmount = totalInvoices > 0 ? totalInvoicedAmount / totalInvoices : 0

    return NextResponse.json({
      totalInvoices,
      totalCompanies,
      totalInvoicedAmount,
      averageInvoiceAmount,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
