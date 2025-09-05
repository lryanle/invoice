import type { ObjectId } from "mongodb"

export interface UserProfile {
  _id?: ObjectId
  clerkUserId: string
  email: string
  fullName: string
  phone?: string
  currency: string // Added currency field for multi-currency support
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

export interface Client {
  _id?: ObjectId
  userId: string // Clerk user ID
  name: string
  email: string
  invoiceCounter: number // Added invoice counter for auto-incrementing invoice numbers
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
  description: string // Added description field for line items
  quantity: number
  cost: number
  total: number
}

export interface Invoice {
  _id?: ObjectId
  userId: string // Clerk user ID
  clientId: string // Client ObjectId as string
  invoiceNumber: string
  date: Date
  dueDate: Date
  customerRef?: string // Customer reference field
  lineItems: LineItem[]
  subtotal: number
  tax?: number
  total: number
  status: "draft" | "complete"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
