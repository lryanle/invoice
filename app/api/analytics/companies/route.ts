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

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get("companyId")

    const db = await connectToDatabase()

    if (companyId) {
      // Get analytics for specific company
      const company = await db.collection("companies").findOne({ _id: new ObjectId(companyId), userId })

      if (!company) {
        return NextResponse.json({ error: "Company not found" }, { status: 404 })
      }

      // Company-specific analytics
      const invoices = await db.collection("invoices").find({ companyId, userId }).toArray()

      const totalInvoices = invoices.length
      const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
      const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

      // Line item breakdown for this company
      const lineItemBreakdown = await db
        .collection("invoices")
        .aggregate([
          { $match: { companyId, userId } },
          { $unwind: "$lineItems" },
          {
            $group: {
              _id: "$lineItems.name",
              count: { $sum: 1 },
              totalRevenue: { $sum: "$lineItems.total" },
              averagePrice: { $avg: "$lineItems.cost" },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()

      // Monthly revenue for this company
      const monthlyRevenue = await db
        .collection("invoices")
        .aggregate([
          { $match: { companyId, userId } },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              revenue: { $sum: "$total" },
              invoiceCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ])
        .toArray()

      return NextResponse.json({
        company,
        stats: {
          totalInvoices,
          totalRevenue,
          averageInvoice,
        },
        lineItemBreakdown,
        monthlyRevenue: monthlyRevenue.map((item) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          revenue: item.revenue,
          invoiceCount: item.invoiceCount,
        })),
      })
    } else {
      // Get analytics for all companies
      const companiesAnalytics = await db
        .collection("invoices")
        .aggregate([
          { $match: { userId } },
          {
            $lookup: {
              from: "companies",
              localField: "companyId",
              foreignField: "_id",
              as: "company",
            },
          },
          { $unwind: "$company" },
          {
            $group: {
              _id: "$companyId",
              companyName: { $first: "$company.name" },
              totalInvoices: { $sum: 1 },
              totalRevenue: { $sum: "$total" },
              averageInvoice: { $avg: "$total" },
              lastInvoiceDate: { $max: "$createdAt" },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()

      return NextResponse.json({ companiesAnalytics })
    }
  } catch (error) {
    console.error("Error fetching company analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
