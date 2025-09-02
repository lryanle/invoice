import jsPDF from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  userProfile: {
    fullName: string
    email: string
    phone?: string
    address: {
      street1: string
      street2?: string
      city: string
      state: string
      country: string
      zip: string
    }
  }
  company: {
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
  }
  lineItems: Array<{
    name: string
    quantity: number
    cost: number
    total: number
  }>
  subtotal: number
  tax: number
  total: number
  notes?: string
}

export class PDFGenerator {
  private doc: jsPDF
  private pageWidth: number
  private pageHeight: number
  private margin: number

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 20
  }

  generateInvoicePDF(invoiceData: InvoiceData): jsPDF {
    this.addHeader(invoiceData)
    this.addInvoiceDetails(invoiceData)
    this.addBillingInfo(invoiceData)
    this.addLineItems(invoiceData)
    this.addTotals(invoiceData)
    this.addNotes(invoiceData)
    this.addFooter()

    return this.doc
  }

  private addHeader(invoiceData: InvoiceData) {
    // Company header
    this.doc.setFontSize(24)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("INVOICE", this.pageWidth - this.margin, 30, { align: "right" })

    // Invoice number and date
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(`Invoice #: ${invoiceData.invoiceNumber}`, this.pageWidth - this.margin, 45, { align: "right" })
    this.doc.text(`Date: ${new Date(invoiceData.date).toLocaleDateString()}`, this.pageWidth - this.margin, 55, {
      align: "right",
    })
    this.doc.text(`Due Date: ${new Date(invoiceData.dueDate).toLocaleDateString()}`, this.pageWidth - this.margin, 65, {
      align: "right",
    })
  }

  private addInvoiceDetails(invoiceData: InvoiceData) {
    let yPos = 30

    // From section
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("From:", this.margin, yPos)

    yPos += 10
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(invoiceData.userProfile.fullName, this.margin, yPos)

    yPos += 8
    this.doc.text(invoiceData.userProfile.email, this.margin, yPos)

    if (invoiceData.userProfile.phone) {
      yPos += 8
      this.doc.text(invoiceData.userProfile.phone, this.margin, yPos)
    }

    yPos += 8
    this.doc.text(invoiceData.userProfile.address.street1, this.margin, yPos)

    if (invoiceData.userProfile.address.street2) {
      yPos += 8
      this.doc.text(invoiceData.userProfile.address.street2, this.margin, yPos)
    }

    yPos += 8
    this.doc.text(
      `${invoiceData.userProfile.address.city}, ${invoiceData.userProfile.address.state} ${invoiceData.userProfile.address.zip}`,
      this.margin,
      yPos,
    )

    yPos += 8
    this.doc.text(invoiceData.userProfile.address.country, this.margin, yPos)
  }

  private addBillingInfo(invoiceData: InvoiceData) {
    let yPos = 100

    // Bill To section
    this.doc.setFontSize(14)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Bill To:", this.margin, yPos)

    yPos += 10
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(invoiceData.company.name, this.margin, yPos)

    yPos += 8
    this.doc.text(invoiceData.company.email, this.margin, yPos)

    yPos += 8
    this.doc.text(invoiceData.company.address.street1, this.margin, yPos)

    if (invoiceData.company.address.street2) {
      yPos += 8
      this.doc.text(invoiceData.company.address.street2, this.margin, yPos)
    }

    yPos += 8
    this.doc.text(
      `${invoiceData.company.address.city}, ${invoiceData.company.address.state} ${invoiceData.company.address.zip}`,
      this.margin,
      yPos,
    )

    yPos += 8
    this.doc.text(invoiceData.company.address.country, this.margin, yPos)
  }

  private addLineItems(invoiceData: InvoiceData) {
    let yPos = 180

    // Table header
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")

    // Draw table header background
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(this.margin, yPos - 5, this.pageWidth - 2 * this.margin, 15, "F")

    // Header text
    this.doc.text("Description", this.margin + 5, yPos + 5)
    this.doc.text("Qty", this.pageWidth - 80, yPos + 5, { align: "center" })
    this.doc.text("Rate", this.pageWidth - 50, yPos + 5, { align: "center" })
    this.doc.text("Amount", this.pageWidth - this.margin - 5, yPos + 5, { align: "right" })

    yPos += 20

    // Line items
    this.doc.setFont("helvetica", "normal")
    invoiceData.lineItems.forEach((item) => {
      // Check if we need a new page
      if (yPos > this.pageHeight - 60) {
        this.doc.addPage()
        yPos = 30
      }

      this.doc.text(item.name, this.margin + 5, yPos)
      this.doc.text(item.quantity.toString(), this.pageWidth - 80, yPos, { align: "center" })
      this.doc.text(`$${item.cost.toFixed(2)}`, this.pageWidth - 50, yPos, { align: "center" })
      this.doc.text(`$${item.total.toFixed(2)}`, this.pageWidth - this.margin - 5, yPos, { align: "right" })

      yPos += 15
    })

    // Draw table border
    this.doc.setDrawColor(200, 200, 200)
    this.doc.rect(this.margin, 175, this.pageWidth - 2 * this.margin, yPos - 175)
  }

  private addTotals(invoiceData: InvoiceData) {
    let yPos = Math.max(220, 180 + invoiceData.lineItems.length * 15 + 30)

    const totalsX = this.pageWidth - 80

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "normal")

    // Subtotal
    this.doc.text("Subtotal:", totalsX - 30, yPos)
    this.doc.text(`$${invoiceData.subtotal.toFixed(2)}`, this.pageWidth - this.margin, yPos, { align: "right" })

    yPos += 15

    // Tax
    if (invoiceData.tax > 0) {
      this.doc.text("Tax:", totalsX - 30, yPos)
      this.doc.text(`$${invoiceData.tax.toFixed(2)}`, this.pageWidth - this.margin, yPos, { align: "right" })
      yPos += 15
    }

    // Total
    this.doc.setFont("helvetica", "bold")
    this.doc.setFontSize(14)
    this.doc.text("Total:", totalsX - 30, yPos)
    this.doc.text(`$${invoiceData.total.toFixed(2)}`, this.pageWidth - this.margin, yPos, { align: "right" })

    // Draw line above total
    this.doc.setDrawColor(0, 0, 0)
    this.doc.line(totalsX - 35, yPos - 5, this.pageWidth - this.margin, yPos - 5)
  }

  private addNotes(invoiceData: InvoiceData) {
    if (!invoiceData.notes) return

    let yPos = Math.max(280, 240 + invoiceData.lineItems.length * 15)

    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text("Notes:", this.margin, yPos)

    yPos += 10
    this.doc.setFont("helvetica", "normal")

    // Split notes into lines to fit page width
    const lines = this.doc.splitTextToSize(invoiceData.notes, this.pageWidth - 2 * this.margin)
    this.doc.text(lines, this.margin, yPos)
  }

  private addFooter() {
    const footerY = this.pageHeight - 20

    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.setTextColor(128, 128, 128)
    this.doc.text("Thank you for your business!", this.pageWidth / 2, footerY, { align: "center" })
  }
}
