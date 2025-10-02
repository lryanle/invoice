import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { withErrorHandling, createError } from "@/lib/error-handler"

async function handleGetInvoices(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    throw createError.unauthorized("Authentication required to access invoices")
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  const { invoices, totalCount } = await DatabaseService.getInvoicesByUserPaginated(userId, offset, limit)
  
  return NextResponse.json({
    invoices,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    }
  })
}

export const GET = withErrorHandling(handleGetInvoices)

async function handleCreateInvoice(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    throw createError.unauthorized("Authentication required to create invoices")
  }

  const body = await request.json()
  const { clientId, date, dueDate, customerRef, invoiceNumber, lineItems, tax, notes, status = "draft" } = body

  // Validate required fields
  if (!clientId || !date || !dueDate || !lineItems || !Array.isArray(lineItems) || lineItems.length === 0) {
    throw createError.validationError("Missing required fields: clientId, date, dueDate, and lineItems are required")
  }

  // Validate line items
  for (const item of lineItems) {
    if (!item.description || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
      throw createError.validationError("Each line item must have description, quantity, and price")
    }
  }

  // Calculate totals
  const subtotal = lineItems.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0)
  const total = subtotal + (tax || 0)

  // Use provided invoice number or generate next number for client
  const finalInvoiceNumber = invoiceNumber || await DatabaseService.generateInvoiceNumber(userId, clientId)

  const invoiceId = await DatabaseService.createInvoice({
    userId,
    clientId,
    invoiceNumber: finalInvoiceNumber,
    date: new Date(date),
    dueDate: new Date(dueDate),
    customerRef,
    lineItems,
    subtotal,
    tax,
    total,
    status,
    notes,
  })

  const invoice = await DatabaseService.getInvoiceById(invoiceId.toString())
  return NextResponse.json(invoice, { status: 201 })
}

export const POST = withErrorHandling(handleCreateInvoice)
