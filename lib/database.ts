import { getDatabase } from "./mongodb"
import type { UserProfile, Client, Invoice } from "./models/user"
import { ObjectId, type Db } from "mongodb"

// Type aliases for better readability
type UserProfileInput = Omit<UserProfile, "_id" | "createdAt" | "updatedAt">
type ClientInput = Omit<Client, "_id" | "createdAt" | "updatedAt">
type InvoiceInput = Omit<Invoice, "_id" | "createdAt" | "updatedAt">

export async function connectToDatabase() {
  return await getDatabase()
}

export class DatabaseService {
  private static dbInstance: Db | null = null
  
  private static async getDb(): Promise<Db> {
    this.dbInstance ??= await getDatabase()
    return this.dbInstance
  }

  // User Profile Operations
  static async createUserProfile(profile: UserProfileInput) {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection<UserProfile>("users").insertOne({
      ...profile,
      createdAt: now,
      updatedAt: now,
    })

    return result.insertedId
  }

  static async getUserProfile(clerkUserId: string) {
    const db = await this.getDb()
    return await db.collection<UserProfile>("users").findOne({ clerkUserId })
  }

  static async updateUserProfile(clerkUserId: string, updates: Partial<UserProfile>) {
    const db = await this.getDb()
    const now = new Date()

    return await db
      .collection<UserProfile>("users")
      .updateOne({ clerkUserId }, { $set: { ...updates, updatedAt: now } })
  }

  // Client Operations
  static async createClient(client: ClientInput) {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection<Client>("clients").insertOne({
      ...client,
      createdAt: now,
      updatedAt: now,
    })

    return result.insertedId
  }

  static async getClientsByUser(userId: string) {
    const db = await this.getDb()
    return await db.collection<Client>("clients").find({ userId }).sort({ name: 1 }).toArray()
  }

  static async getClientById(id: string) {
    const db = await this.getDb()
    return await db.collection<Client>("clients").findOne({ _id: new ObjectId(id) })
  }

  static async updateClient(id: string, updates: Partial<Client>) {
    const db = await this.getDb()
    const now = new Date()

    return await db
      .collection<Client>("clients")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: now } })
  }

  static async deleteClient(id: string) {
    const db = await this.getDb()
    return await db.collection<Client>("clients").deleteOne({ _id: new ObjectId(id) })
  }

  // Invoice Operations
  static async createInvoice(invoice: InvoiceInput) {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection<Invoice>("invoices").insertOne({
      ...invoice,
      createdAt: now,
      updatedAt: now,
    })

    return result.insertedId
  }

  static async getInvoicesByUser(userId: string) {
    const db = await this.getDb()
    return await db.collection<Invoice>("invoices").find({ userId }).sort({ createdAt: -1 }).toArray()
  }

  static async getInvoicesByUserPaginated(userId: string, offset: number, limit: number) {
    const db = await this.getDb()
    const collection = db.collection<Invoice>("invoices")
    
    const [invoices, totalCount] = await Promise.all([
      collection.find({ userId }).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
      collection.countDocuments({ userId })
    ])
    
    return { invoices, totalCount }
  }

  static async getInvoicesByClient(clientId: string) {
    const db = await this.getDb()
    return await db.collection<Invoice>("invoices").find({ clientId }).sort({ createdAt: -1 }).toArray()
  }

  static async getInvoiceById(id: string) {
    const db = await this.getDb()
    return await db.collection<Invoice>("invoices").findOne({ _id: new ObjectId(id) })
  }

  static async updateInvoice(id: string, updates: Partial<Invoice>) {
    const db = await this.getDb()
    const now = new Date()

    return await db
      .collection<Invoice>("invoices")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: now } })
  }

  static async deleteInvoice(id: string) {
    const db = await this.getDb()
    return await db.collection<Invoice>("invoices").deleteOne({ _id: new ObjectId(id) })
  }

  // Get top 10 most common line item names for a user with usage count and recent cost
  static async getTopLineItems(userId: string, limit = 10) {
    const db = await this.getDb()

    const pipeline = [
      { $match: { userId } },
      { $unwind: "$lineItems" },
      { 
        $group: { 
          _id: "$lineItems.name", 
          count: { $sum: 1 },
          recentCost: { $last: "$lineItems.cost" },
          lastUsed: { $max: "$createdAt" }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { name: "$_id", count: 1, recentCost: 1, lastUsed: 1, _id: 0 } },
    ]

    return await db.collection<Invoice>("invoices").aggregate(pipeline).toArray()
  }

  // Get the most recent cost for a specific line item
  static async getRecentCostForItem(userId: string, itemName: string) {
    const db = await this.getDb()
    
    const pipeline = [
      { $match: { userId } },
      { $unwind: "$lineItems" },
      { $match: { "lineItems.name": itemName } },
      { $sort: { createdAt: -1 } },
      { $limit: 1 },
      { $project: { cost: "$lineItems.cost", _id: 0 } }
    ]

    const result = await db.collection<Invoice>("invoices").aggregate(pipeline).toArray()
    return result.length > 0 ? result[0].cost : null
  }

  // Generate next invoice number for a specific client
  static async generateInvoiceNumber(userId: string, clientId: string) {
    const db = await this.getDb()
    const lastInvoice = await db.collection<Invoice>("invoices").findOne(
      { userId, clientId }, 
      { sort: { createdAt: -1 } }
    )

    if (!lastInvoice) {
      return "1"
    }

    // Extract the numeric part from the invoice number
    const lastNumber = Number.parseInt(lastInvoice.invoiceNumber) || 0
    return String(lastNumber + 1)
  }

  // Get the default invoice number (always "1")
  static getDefaultInvoiceNumber() {
    return "1"
  }

  // Analytics methods
  static async getClientAnalytics(userId: string, clientId?: string, dateRange?: { start: Date; end: Date }) {
    const db = await this.getDb()
    
    // Build match criteria with optional date range - only include completed invoices
    const matchCriteria: any = { userId, status: "complete" }
    if (dateRange) {
      matchCriteria.date = { $gte: dateRange.start, $lte: dateRange.end }
    }
    
    if (clientId && clientId !== "all") {
      // Get analytics for specific client
      const client = await db.collection("clients").findOne({ _id: new ObjectId(clientId), userId })
      if (!client) return null

      const invoices = await db.collection<Invoice>("invoices").find({ clientId, userId }).toArray()
      
      // Filter to only completed invoices and by date range if provided
      const completedInvoices = invoices.filter(inv => 
        inv.status === 'complete' && 
        (!dateRange || (inv.date >= dateRange.start && inv.date <= dateRange.end))
      )
      
      const draftInvoices = invoices.filter(inv => 
        inv.status === 'draft' && 
        (!dateRange || (inv.date >= dateRange.start && inv.date <= dateRange.end))
      )
      
      const totalInvoices = completedInvoices.length
      const totalRevenue = completedInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0)
      const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

      // Calculate additional metrics
      const completionRate = (invoices.length > 0) ? (completedInvoices.length / invoices.length) * 100 : 0
      const completedRevenue = completedInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const draftRevenue = draftInvoices.reduce((sum, inv) => sum + inv.total, 0)

      // Line item breakdown for this client - only completed invoices
      const lineItemBreakdown = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId, status: "complete", ...(dateRange ? { date: { $gte: dateRange.start, $lte: dateRange.end } } : {}) } },
          { $unwind: "$lineItems" },
          {
            $group: {
              _id: "$lineItems.name",
              count: { $sum: 1 },
              totalRevenue: { $sum: "$lineItems.total" },
              averagePrice: { $avg: "$lineItems.cost" },
              totalQuantity: { $sum: "$lineItems.quantity" },
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()

      // Monthly revenue for this client - only completed invoices
      const monthlyRevenue = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId, status: "complete", ...(dateRange ? { date: { $gte: dateRange.start, $lte: dateRange.end } } : {}) } },
          {
            $group: {
              _id: {
                year: { $year: "$date" },
                month: { $month: "$date" },
              },
              revenue: { $sum: "$total" },
              invoiceCount: { $sum: 1 },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ])
        .toArray()

      // Weekly revenue for this client (last 12 weeks) - only completed invoices
      const twelveWeeksAgo = new Date()
      twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
      
      const weeklyRevenue = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId, status: "complete", date: { $gte: twelveWeeksAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-W%U", date: "$date" } },
              revenue: { $sum: "$total" },
              invoiceCount: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()

      // Recent activity for this client (last 30 days) - only completed invoices
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentActivity = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId, status: "complete", date: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              invoiceCount: { $sum: 1 },
              revenue: { $sum: "$total" },
              completedCount: { $sum: 1 }, // All are completed
              draftCount: { $sum: 0 }, // No drafts in this query
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray()

      return {
        client,
        stats: { 
          totalInvoices, 
          totalRevenue, 
          averageInvoice,
          completedInvoices: completedInvoices.length,
          draftInvoices: draftInvoices.length,
          completionRate,
          completedRevenue,
          draftRevenue,
        },
        lineItemBreakdown,
        monthlyRevenue: monthlyRevenue.map((item: any) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          revenue: item.revenue,
          invoiceCount: item.invoiceCount,
          completedRevenue: item.revenue, // All revenue is from completed invoices
          draftRevenue: 0, // No draft revenue included
        })),
        weeklyRevenue: weeklyRevenue.map((item: any) => ({
          week: item._id,
          revenue: item.revenue,
          invoiceCount: item.invoiceCount,
        })),
        recentActivity,
      }
    } else {
      // Get analytics for all clients - only completed invoices
      const clientsAnalytics = await db
        .collection("invoices")
        .aggregate([
          { $match: matchCriteria },
          {
            $lookup: {
              from: "clients",
              localField: "clientId",
              foreignField: "_id",
              as: "client",
            },
          },
          { $unwind: "$client" },
          {
            $group: {
              _id: "$clientId",
              clientName: { $first: "$client.name" },
              totalInvoices: { $sum: 1 },
              totalRevenue: { $sum: "$total" },
              averageInvoice: { $avg: "$total" },
              lastInvoiceDate: { $max: "$createdAt" },
              completedInvoices: { $sum: 1 }, // All are completed since we filtered by status
              completedRevenue: { $sum: "$total" }, // All revenue is from completed invoices
              draftInvoices: { $sum: 0 }, // No drafts in this query
              draftRevenue: { $sum: 0 }, // No draft revenue
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()

      // Calculate completion rates for each client (need to get total invoices including drafts)
      const allInvoicesByClient = await db
        .collection("invoices")
        .aggregate([
          { $match: { userId, ...(dateRange ? { date: { $gte: dateRange.start, $lte: dateRange.end } } : {}) } },
          {
            $group: {
              _id: "$clientId",
              totalInvoicesAll: { $sum: 1 },
              completedInvoicesAll: { $sum: { $cond: [{ $eq: ["$status", "complete"] }, 1, 0] } },
            },
          },
        ])
        .toArray()

      // Merge completion rates
      const clientsWithCompletionRate = clientsAnalytics.map(client => {
        const allInvoices = allInvoicesByClient.find(ai => ai._id.toString() === client._id.toString())
        return {
          ...client,
          completionRate: allInvoices && allInvoices.totalInvoicesAll > 0 
            ? (allInvoices.completedInvoicesAll / allInvoices.totalInvoicesAll) * 100 
            : 0
        }
      })

      return { clientsAnalytics: clientsWithCompletionRate }
    }
  }

  static async getUserAnalytics(userId: string, dateRange?: { start: Date; end: Date }) {
    const db = await this.getDb()

    // Build match criteria with optional date range - only include completed invoices
    const matchCriteria: any = { userId, status: "complete" }
    if (dateRange) {
      matchCriteria.date = { $gte: dateRange.start, $lte: dateRange.end }
    }

    // Get basic stats using existing methods
    const [invoices, clients] = await Promise.all([
      this.getInvoicesByUser(userId),
      this.getClientsByUser(userId)
    ])

    // Filter to only completed invoices and by date range if provided
    const completedInvoices = invoices.filter(inv => 
      inv.status === 'complete' && 
      (!dateRange || (inv.date >= dateRange.start && inv.date <= dateRange.end))
    )
    
    const draftInvoices = invoices.filter(inv => 
      inv.status === 'draft' && 
      (!dateRange || (inv.date >= dateRange.start && inv.date <= dateRange.end))
    )

    const totalInvoices = completedInvoices.length
    const totalClients = clients.length
    const totalRevenue = completedInvoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0)
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
    const maxInvoice = totalInvoices > 0 ? Math.max(...completedInvoices.map((inv: Invoice) => inv.total)) : 0
    const minInvoice = totalInvoices > 0 ? Math.min(...completedInvoices.map((inv: Invoice) => inv.total)) : 0

    // Calculate additional metrics
    const completionRate = (invoices.length > 0) ? (completedInvoices.length / invoices.length) * 100 : 0
    
    // Calculate average invoice value by status
    const avgCompletedInvoice = completedInvoices.length > 0 
      ? completedInvoices.reduce((sum, inv) => sum + inv.total, 0) / completedInvoices.length 
      : 0
    const avgDraftInvoice = draftInvoices.length > 0 
      ? draftInvoices.reduce((sum, inv) => sum + inv.total, 0) / draftInvoices.length 
      : 0

    // Revenue by status
    const completedRevenue = completedInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const draftRevenue = draftInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Monthly revenue timeline - only completed invoices
    const monthlyRevenue = await db
      .collection("invoices")
      .aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              month: { $month: "$date" },
            },
            revenue: { $sum: "$total" },
            invoiceCount: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ])
      .toArray()

    // Weekly revenue (last 12 weeks) - only completed invoices
    const twelveWeeksAgo = new Date()
    twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84)
    
    const weeklyRevenue = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId, status: "complete", date: { $gte: twelveWeeksAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-W%U", date: "$date" } },
            revenue: { $sum: "$total" },
            invoiceCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Invoice status distribution - include all invoices for status breakdown
    const statusDistribution = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId, ...(dateRange ? { date: { $gte: dateRange.start, $lte: dateRange.end } } : {}) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalAmount: { $sum: { $cond: [{ $eq: ["$status", "complete"] }, "$total", 0] } },
          },
        },
      ])
      .toArray()

    // Top line items - only from completed invoices
    const topLineItems = await db
      .collection("invoices")
      .aggregate([
        { $match: matchCriteria },
        { $unwind: "$lineItems" },
        {
          $group: {
            _id: "$lineItems.name",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$lineItems.total" },
            averagePrice: { $avg: "$lineItems.cost" },
            totalQuantity: { $sum: "$lineItems.quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 15 },
      ])
      .toArray()

    // Client performance metrics - only completed invoices
    const clientPerformance = await db
      .collection("invoices")
      .aggregate([
        { $match: matchCriteria },
        {
          $lookup: {
            from: "clients",
            localField: "clientId",
            foreignField: "_id",
            as: "client",
          },
        },
        { $unwind: "$client" },
        {
          $group: {
            _id: "$clientId",
            clientName: { $first: "$client.name" },
            totalInvoices: { $sum: 1 },
            totalRevenue: { $sum: "$total" },
            averageInvoice: { $avg: "$total" },
            lastInvoiceDate: { $max: "$createdAt" },
            completedInvoices: { $sum: 1 }, // All are completed since we filtered by status
            completedRevenue: { $sum: "$total" }, // All revenue is from completed invoices
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ])
      .toArray()

    // Recent activity (last 30 days) - only completed invoices
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentActivity = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId, status: "complete", date: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            invoiceCount: { $sum: 1 },
            revenue: { $sum: "$total" },
            completedCount: { $sum: 1 }, // All are completed
            draftCount: { $sum: 0 }, // No drafts in this query
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray()

    // Payment trends (based on due dates)
    const paymentTrends = await db
      .collection("invoices")
      .aggregate([
        { $match: { userId, status: "complete" } },
        {
          $addFields: {
            daysToPayment: {
              $divide: [
                { $subtract: ["$updatedAt", "$createdAt"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        },
        {
          $group: {
            _id: null,
            avgDaysToPayment: { $avg: "$daysToPayment" },
            minDaysToPayment: { $min: "$daysToPayment" },
            maxDaysToPayment: { $max: "$daysToPayment" },
          }
        }
      ])
      .toArray()

    // Revenue growth calculation
    const currentPeriod = monthlyRevenue.slice(-6) // Last 6 months
    const previousPeriod = monthlyRevenue.slice(-12, -6) // Previous 6 months
    const currentPeriodRevenue = currentPeriod.reduce((sum, item) => sum + item.revenue, 0)
    const previousPeriodRevenue = previousPeriod.reduce((sum, item) => sum + item.revenue, 0)
    const revenueGrowth = previousPeriodRevenue > 0 
      ? ((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100 
      : 0

    return {
      basicStats: {
        totalInvoices,
        totalClients,
        totalRevenue,
        averageInvoice,
        maxInvoice,
        minInvoice,
        completedInvoices: completedInvoices.length,
        draftInvoices: draftInvoices.length,
        completionRate,
        avgCompletedInvoice,
        avgDraftInvoice,
        completedRevenue,
        draftRevenue,
        revenueGrowth,
      },
      monthlyRevenue: monthlyRevenue.map((item: any) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        revenue: item.revenue,
        invoiceCount: item.invoiceCount,
        completedRevenue: item.revenue, // All revenue is from completed invoices
        draftRevenue: 0, // No draft revenue included
      })),
      weeklyRevenue: weeklyRevenue.map((item: any) => ({
        week: item._id,
        revenue: item.revenue,
        invoiceCount: item.invoiceCount,
      })),
      statusDistribution,
      topLineItems,
      clientPerformance,
      recentActivity,
      paymentTrends: paymentTrends[0] || { avgDaysToPayment: 0, minDaysToPayment: 0, maxDaysToPayment: 0 },
    }
  }
}
