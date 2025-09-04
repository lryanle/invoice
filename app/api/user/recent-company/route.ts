import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the most recent invoice to find the last used company
    const invoices = await DatabaseService.getInvoicesByUser(userId)
    
    if (!invoices || invoices.length === 0) {
      return NextResponse.json({ companyId: null })
    }

    const lastInvoice = invoices[0] // Already sorted by createdAt desc
    const company = await DatabaseService.getCompanyById(lastInvoice.companyId)

    if (!company) {
      return NextResponse.json({ companyId: null })
    }

    return NextResponse.json({ 
      companyId: company._id.toString(),
      companyName: company.name 
    })
  } catch (error) {
    console.error("Error fetching recent company:", error)
    return NextResponse.json(
      { error: "Failed to fetch recent company" },
      { status: 500 }
    )
  }
}
