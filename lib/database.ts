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
  static async getClientAnalytics(userId: string, clientId?: string) {
    const db = await this.getDb()
    
    if (clientId) {
      // Get analytics for specific client
      const client = await db.collection("clients").findOne({ _id: new ObjectId(clientId), userId })
      if (!client) return null

      const invoices = await db.collection<Invoice>("invoices").find({ clientId, userId }).toArray()
      
      const totalInvoices = invoices.length
      const totalRevenue = invoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0)
      const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0

      // Line item breakdown for this client
      const lineItemBreakdown = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId } },
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

      // Monthly revenue for this client
      const monthlyRevenue = await db
        .collection("invoices")
        .aggregate([
          { $match: { clientId, userId } },
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

      return {
        client,
        stats: { totalInvoices, totalRevenue, averageInvoice },
        lineItemBreakdown,
        monthlyRevenue: monthlyRevenue.map((item: any) => ({
          month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
          revenue: item.revenue,
          invoiceCount: item.invoiceCount,
        })),
      }
    } else {
      // Get analytics for all clients
      return await db
        .collection("invoices")
        .aggregate([
          { $match: { userId } },
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
            },
          },
          { $sort: { totalRevenue: -1 } },
        ])
        .toArray()
    }
  }

  static async getUserAnalytics(userId: string) {
    const db = await this.getDb()

    // Get basic stats using existing methods
    const [invoices, clients] = await Promise.all([
      this.getInvoicesByUser(userId),
      this.getClientsByUser(userId)
    ])

    const totalInvoices = invoices.length
    const totalClients = clients.length
    const totalRevenue = invoices.reduce((sum: number, inv: Invoice) => sum + inv.total, 0)
    const averageInvoice = totalInvoices > 0 ? totalRevenue / totalInvoices : 0
    const maxInvoice = totalInvoices > 0 ? Math.max(...invoices.map((inv: Invoice) => inv.total)) : 0
    const minInvoice = totalInvoices > 0 ? Math.min(...invoices.map((inv: Invoice) => inv.total)) : 0

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

    return {
      basicStats: {
        totalInvoices,
        totalClients,
        totalRevenue,
        averageInvoice,
        maxInvoice,
        minInvoice,
      },
      monthlyRevenue: monthlyRevenue.map((item: any) => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        revenue: item.revenue,
        invoiceCount: item.invoiceCount,
      })),
      statusDistribution,
      topLineItems,
      recentActivity,
    }
  }
}
