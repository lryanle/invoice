import type { ObjectId } from "mongodb"

export interface UserProfile {
  _id?: ObjectId
  clerkUserId: string
  email: string
  fullName: string
  phone?: string
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    country: string
    zip: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface Company {
  _id?: ObjectId
  userId: string // Clerk user ID
  name: string
  email: string
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    country: string
    zip: string
  }
  createdAt: Date
  updatedAt: Date
}

export interface LineItem {
  name: string
  quantity: number
  cost: number
  total: number
}

export interface Invoice {
  _id?: ObjectId
  userId: string // Clerk user ID
  companyId: string // Company ObjectId as string
  invoiceNumber: string
  date: Date
  dueDate: Date
  lineItems: LineItem[]
  subtotal: number
  tax?: number
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
