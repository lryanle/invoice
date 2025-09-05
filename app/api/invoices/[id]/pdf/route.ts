import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { DatabaseService } from "@/lib/database"
import { PDFGenerator } from "@/lib/pdf-generator"
import { formatClientNameForFilename } from "@/lib/utils"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    const { id } = await params

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get invoice
    const invoice = await DatabaseService.getInvoiceById(id)
    if (!invoice || invoice.userId !== userId) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 })
    }

    // Get user profile
    const userProfile = await DatabaseService.getUserProfile(userId)
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    // Get client
    const client = await DatabaseService.getClientById(invoice.clientId)
    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Generate PDF
    const pdfGenerator = new PDFGenerator()
    const pdf = pdfGenerator.generateInvoicePDF({
      invoiceNumber: invoice.invoiceNumber,
      date: invoice.date.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      customerRef: invoice.customerRef,
      userProfile,
      client,
      lineItems: invoice.lineItems,
      subtotal: invoice.subtotal,
      tax: invoice.tax || 0,
      total: invoice.total,
      notes: invoice.notes,
    })

    // Return PDF as buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"))

    const formattedClientName = formatClientNameForFilename(client.name)
    const filename = `invoice-${formattedClientName}-${invoice.invoiceNumber}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
