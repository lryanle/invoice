import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { withErrorHandling, createError } from "@/lib/error-handler"

async function handleGetInvoice(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to access invoice")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid invoice ID is required")
  }

  const invoice = await DatabaseService.getInvoiceById(id)

  if (!invoice || invoice.userId !== userId) {
    throw createError.notFound("Invoice not found")
  }

  return NextResponse.json(invoice)
}

export const GET = withErrorHandling(handleGetInvoice)

async function handleUpdateInvoice(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to update invoice")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid invoice ID is required")
  }

  const body = await request.json()
  const { clientId, date, dueDate, customerRef, invoiceNumber, lineItems, tax, notes, status } = body

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

  // Verify ownership
  const invoice = await DatabaseService.getInvoiceById(id)
  if (!invoice || invoice.userId !== userId) {
    throw createError.notFound("Invoice not found")
  }

  // Calculate totals for normalized line items
  const subtotal = normalizedLineItems.reduce((sum: number, item) => {
    const itemTotal = item.quantity * item.cost
    item.total = itemTotal
    return sum + itemTotal
  }, 0)
  const total = subtotal + (tax || 0)

  await DatabaseService.updateInvoice(id, {
    clientId,
    invoiceNumber,
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

  const updatedInvoice = await DatabaseService.getInvoiceById(id)
  return NextResponse.json(updatedInvoice)
}

export const PUT = withErrorHandling(handleUpdateInvoice)

async function handleDeleteInvoice(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  const { id } = await params

  if (!userId) {
    throw createError.unauthorized("Authentication required to delete invoice")
  }

  if (!id || typeof id !== 'string') {
    throw createError.validationError("Valid invoice ID is required")
  }

  // Verify ownership
  const invoice = await DatabaseService.getInvoiceById(id)
  if (!invoice || invoice.userId !== userId) {
    throw createError.notFound("Invoice not found")
  }

  await DatabaseService.deleteInvoice(id)
  return NextResponse.json({ success: true })
}

export const DELETE = withErrorHandling(handleDeleteInvoice)
