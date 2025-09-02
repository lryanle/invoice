import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get total invoices count
    const totalInvoices = await db.collection("invoices").countDocuments({ userId })

    // Get total companies count
    const totalCompanies = await db.collection("companies").countDocuments({ userId })

    // Get total invoiced amount
    const invoiceAmounts = await db
      .collection("invoices")
      .aggregate([{ $match: { userId } }, { $group: { _id: null, total: { $sum: "$total" } } }])
      .toArray()

    const totalInvoicedAmount = invoiceAmounts.length > 0 ? invoiceAmounts[0].total : 0

    // Calculate average invoice amount
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
