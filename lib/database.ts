import { getDatabase } from "./mongodb"
import type { UserProfile, Company, Invoice } from "./models/user"
import { ObjectId } from "mongodb"

export class DatabaseService {
  private static async getDb() {
    return await getDatabase()
  }

  // User Profile Operations
  static async createUserProfile(profile: Omit<UserProfile, "_id" | "createdAt" | "updatedAt">) {
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

  // Company Operations
  static async createCompany(company: Omit<Company, "_id" | "createdAt" | "updatedAt">) {
    const db = await this.getDb()
    const now = new Date()

    const result = await db.collection<Company>("companies").insertOne({
      ...company,
      createdAt: now,
      updatedAt: now,
    })

    return result.insertedId
  }

  static async getCompaniesByUser(userId: string) {
    const db = await this.getDb()
    return await db.collection<Company>("companies").find({ userId }).sort({ name: 1 }).toArray()
  }

  static async getCompanyById(id: string) {
    const db = await this.getDb()
    return await db.collection<Company>("companies").findOne({ _id: new ObjectId(id) })
  }

  static async updateCompany(id: string, updates: Partial<Company>) {
    const db = await this.getDb()
    const now = new Date()

    return await db
      .collection<Company>("companies")
      .updateOne({ _id: new ObjectId(id) }, { $set: { ...updates, updatedAt: now } })
  }

  static async deleteCompany(id: string) {
    const db = await this.getDb()
    return await db.collection<Company>("companies").deleteOne({ _id: new ObjectId(id) })
  }

  // Invoice Operations
  static async createInvoice(invoice: Omit<Invoice, "_id" | "createdAt" | "updatedAt">) {
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

  static async getInvoicesByCompany(companyId: string) {
    const db = await this.getDb()
    return await db.collection<Invoice>("invoices").find({ companyId }).sort({ createdAt: -1 }).toArray()
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

  // Get top 10 most common line item names for a user
  static async getTopLineItems(userId: string, limit = 10) {
    const db = await this.getDb()

    const pipeline = [
      { $match: { userId } },
      { $unwind: "$lineItems" },
      { $group: { _id: "$lineItems.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { name: "$_id", count: 1, _id: 0 } },
    ]

    return await db.collection<Invoice>("invoices").aggregate(pipeline).toArray()
  }

  // Generate next invoice number for a user
  static async generateInvoiceNumber(userId: string) {
    const db = await this.getDb()
    const lastInvoice = await db.collection<Invoice>("invoices").findOne({ userId }, { sort: { createdAt: -1 } })

    if (!lastInvoice) {
      return "INV-001"
    }

    const lastNumber = Number.parseInt(lastInvoice.invoiceNumber.split("-")[1] || "0")
    return `INV-${String(lastNumber + 1).padStart(3, "0")}`
  }
}
