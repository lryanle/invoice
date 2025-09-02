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

    // Basic stats
    const totalInvoices = await db.collection("invoices").countDocuments({ userId })
    const totalCompanies = await db.collection("companies").countDocuments({ userId })

    // Revenue analytics
    const revenueData = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            averageInvoice: { $avg: "$total" },
            maxInvoice: { $max: "$total" },
            minInvoice: { $min: "$total" },
          },
        },
      ])
      .toArray()

    // Monthly revenue timeline
    const monthlyRevenue = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId } },
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

    // Invoice status distribution
    const statusDistribution = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: "$total" },
          },
        },
      ])
      .toArray()

    // Top line items
    const topLineItems = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId } },
        { $unwind: "$lineItems" },
        {
          $group: {
            _id: "$lineItems.name",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$lineItems.total" },
            averagePrice: { $avg: "$lineItems.cost" },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId, createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            invoiceCount: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    return NextResponse.json({
      basicStats: {
        totalInvoices,
        totalCompanies,
        totalRevenue: revenueData[0]?.totalRevenue || 0,
        averageInvoice: revenueData[0]?.averageInvoice || 0,
        maxInvoice: revenueData[0]?.maxInvoice || 0,
        minInvoice: revenueData[0]?.minInvoice || 0,
      },
      monthlyRevenue: monthlyRevenue.map((item) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        revenue: item.revenue,
        invoiceCount: item.invoiceCount,
      })),
      statusDistribution,
      topLineItems,
      recentActivity,
    })
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
