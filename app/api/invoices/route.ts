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

  // Helper function to parse numeric values
  const parseNumericValue = (value: any): number => {
    if (typeof value === 'number') return value
    if (typeof value === 'string') return parseFloat(value) || 0
    return 0
  }

  // Validate and normalize line items
  const normalizedLineItems = lineItems.map((item: any) => ({
    name: item.name || '',
    description: item.description || '',
    quantity: parseNumericValue(item.quantity),
    cost: parseNumericValue(item.cost),
    total: 0 // Will be calculated below
  }))

  // Validate required fields for line items
  for (const item of normalizedLineItems) {
    if (!item.name || item.name.trim() === '') {
      throw createError.validationError("Each line item must have a name")
    }
  }

  // Calculate totals for normalized line items
  const subtotal = normalizedLineItems.reduce((sum: number, item) => {
    const itemTotal = item.quantity * item.cost
    item.total = itemTotal
    return sum + itemTotal
  }, 0)
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
    lineItems: normalizedLineItems,
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
