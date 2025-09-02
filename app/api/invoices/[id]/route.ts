import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const invoice = await DatabaseService.getInvoiceById(id)

    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    return NextResponse.json(invoice)
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, date, dueDate, lineItems, tax, notes, status } = body

    // Verify ownership
    const invoice = await DatabaseService.getInvoiceById(id)
    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Calculate totals
    const subtotal = lineItems.reduce((sum: number, item: any) => sum + item.total, 0)
    const total = subtotal + (tax || 0)

    await DatabaseService.updateInvoice(id, {
      companyId,
      date: new Date(date),
      dueDate: new Date(dueDate),
      lineItems,
      subtotal,
      tax,
      total,
      status,
      notes,
    })

    const updatedInvoice = await DatabaseService.getInvoiceById(id)
    return NextResponse.json(updatedInvoice)
  } catch (error) {
    console.error("Error updating invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const invoice = await DatabaseService.getInvoiceById(id)
    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    await DatabaseService.deleteInvoice(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
