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

    if (!companyId) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 })
    }

    const invoiceNumber = await DatabaseService.generateInvoiceNumber(userId, companyId)
    return NextResponse.json({ invoiceNumber })
  } catch (error) {
    console.error("Error generating invoice number:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
