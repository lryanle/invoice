import type { ObjectId } from "mongodb"

export interface UserProfile {
  _id?: ObjectId
  clerkUserId: string
  email: string
  fullName: string
  phone?: string
  currency: string
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
  userId: string
  name: string
  email: string
  invoiceCounter: number
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
  description?: string
  quantity: number
  cost: number
  total: number
}

export interface Invoice {
  _id?: ObjectId
  userId: string
  clientId: string
  invoiceNumber: string
  date: Date
  dueDate: Date
  customerRef?: string
  lineItems: LineItem[]
  subtotal: number
  tax?: number
  total: number
  status: "draft" | "complete"
  notes?: string
  createdAt: Date
  updatedAt: Date
}
