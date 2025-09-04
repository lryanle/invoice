import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/database"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Find the most recent invoice to get the last used company
    const lastInvoice = await db
      .collection("invoices")
      .findOne(
        { userId },
        { 
          sort: { createdAt: -1 },
          projection: { companyId: 1 }
        }
      )

    if (!lastInvoice) {
      return NextResponse.json({ companyId: null })
    }

    // Get the company details
    const company = await db
      .collection("companies")
      .findOne(
        { _id: new ObjectId(lastInvoice.companyId), userId },
        { projection: { _id: 1, name: 1 } }
      )

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
