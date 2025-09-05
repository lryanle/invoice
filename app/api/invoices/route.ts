import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoices = await DatabaseService.getInvoicesByUser(userId)
    return NextResponse.json(invoices)
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, date, dueDate, customerRef, invoiceNumber, lineItems, tax, notes, status = "draft" } = body

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.total, 0)
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
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
