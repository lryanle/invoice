import jsPDF from "jspdf"

interface InvoiceData {
  invoiceNumber: string
  date: string
  dueDate: string
  customerRef?: string
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
    description: string
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
  private readonly doc: jsPDF
  private readonly pageWidth: number
  private readonly pageHeight: number
  private readonly margin: number

  constructor() {
    this.doc = new jsPDF()
    this.pageWidth = this.doc.internal.pageSize.getWidth()
    this.pageHeight = this.doc.internal.pageSize.getHeight()
    this.margin = 15 // Much smaller margins for more space
  }

  generateInvoicePDF(invoiceData: InvoiceData): jsPDF {
    this.addHeader(invoiceData)
    this.addInvoiceDetails(invoiceData)
    this.addBillingInfo(invoiceData)
    this.addLineItems(invoiceData)
    this.addNotesAndTotals(invoiceData)

    return this.doc
  }

  private addHeader(invoiceData: InvoiceData) {
    // Create smaller teal header background
    const headerHeight = 48
    this.doc.setFillColor(21, 93, 252)
    this.doc.rect(0, 0, this.pageWidth, headerHeight, "F")

    // Invoice title (no icon)
    this.doc.setFontSize(30)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(255, 255, 255) // White
    this.doc.text("Invoice", this.margin, 20)

    // Company info on the right side of teal header
    const rightX = this.pageWidth - this.margin
    let yPos = 15
    
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(invoiceData.userProfile.fullName, rightX, yPos, { align: "right" })
    
    yPos += 6
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(invoiceData.userProfile.address.street1, rightX, yPos, { align: "right" })

    if (invoiceData.userProfile.address.street2) {
      yPos += 5
      this.doc.text(invoiceData.userProfile.address.street2, rightX, yPos, { align: "right" })
    }
    
    yPos += 5
    this.doc.text(
      `${invoiceData.userProfile.address.city}, ${invoiceData.userProfile.address.state} ${invoiceData.userProfile.address.zip}`,
      rightX,
      yPos,
      { align: "right" }
    )
    
    yPos += 5
    this.doc.text(invoiceData.userProfile.address.country, rightX, yPos, { align: "right" })
  }

  private addBillingInfo(invoiceData: InvoiceData) {
    // Bill To section on the left side
    let yPos = 60

    // Bill To header
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)
    this.doc.text("BILL TO:", this.margin, yPos)

    yPos += 8
    // Company name in bold
    this.doc.setFontSize(12)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(invoiceData.company.name, this.margin, yPos)

    this.doc.setFontSize(10)
    yPos += 6
    this.doc.setFont("helvetica", "normal")
    this.doc.text(invoiceData.company.address.street1, this.margin, yPos)

    if (invoiceData.company.address.street2) {
      yPos += 5
      this.doc.text(invoiceData.company.address.street2, this.margin, yPos)
    }

    yPos += 5
    this.doc.text(
      `${invoiceData.company.address.city}, ${invoiceData.company.address.state} ${invoiceData.company.address.zip}`,
      this.margin,
      yPos,
    )

    yPos += 5
    this.doc.text(invoiceData.company.address.country, this.margin, yPos)
    
    // Add line separator
    yPos += 8
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin * (2/3), yPos, this.pageWidth - this.margin * (2/3), yPos)
  }

  private addInvoiceDetails(invoiceData: InvoiceData) {
    // Invoice details in top right of white area
    const rightX = this.pageWidth - this.margin
    const invoiceDetailsOffset = rightX - 55
    let yPos = 60
    
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)
    
    // Invoice number
    this.doc.text("INVOICE #", invoiceDetailsOffset, yPos)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(invoiceData.invoiceNumber, rightX, yPos, { align: "right" })
    
    yPos += 8
    // Date
    this.doc.setFont("helvetica", "bold")
    this.doc.text("DATE", invoiceDetailsOffset, yPos)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(new Date(invoiceData.date).toLocaleDateString(), rightX, yPos, { align: "right" })
    
    yPos += 8
    // Due Date
    this.doc.setFont("helvetica", "bold")
    this.doc.text("INVOICE DUE DATE", invoiceDetailsOffset, yPos)
    this.doc.setFont("helvetica", "normal")
    this.doc.text(new Date(invoiceData.dueDate).toLocaleDateString(), rightX, yPos, { align: "right" })
    
    // Customer Reference (if provided)
    if (invoiceData.customerRef) {
      yPos += 8
      this.doc.setFont("helvetica", "bold")
      this.doc.text("REFERENCE", invoiceDetailsOffset, yPos)
      this.doc.setFont("helvetica", "normal")
      this.doc.text(invoiceData.customerRef, rightX, yPos, { align: "right" })
    }
  }

  private addLineItems(invoiceData: InvoiceData) {
    let yPos = 107

    // Table headers
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)

    // Column positions
    const col1 = this.margin // Item name
    const col2 = this.margin + 33 // Description
    const col5 = this.pageWidth - this.margin*1.25 // Amount/Total
    const col4 = col5 - (this.margin*1.25 + 5) // Price
    const col3 = col4 - (this.margin*1.25 + 5) // Quantity

    // Header text
    this.doc.text("ITEMS", col1, yPos)
    this.doc.text("DESCRIPTION", col2, yPos)
    this.doc.text("QTY", col3, yPos, { align: "right" })
    this.doc.text("PRICE", col4, yPos, { align: "right" })
    this.doc.text("AMOUNT", col5, yPos, { align: "right" })

    yPos += 8

    // Line items
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)
    
    invoiceData.lineItems.forEach((item, index) => {
      // Check if we need a new page
      if (yPos > this.pageHeight - 40) {
        this.doc.addPage()
        yPos = 30
      }

      // Item data with text wrapping
      const itemText = item.name
      const descriptionText = item.description
      const quantityText = item.quantity.toString()
      const priceText = `$${item.cost.toFixed(2)}`
      const amountText = `$${item.total.toFixed(2)}`

      // Calculate if text needs wrapping based on new column positions
      const itemWidth = col2 - col1 - 5 // Space between item and description columns
      const descriptionWidth = col3 - col2 - 10 // Space between description and quantity columns
      const quantityWidth = col4 - col3 - 5 // Space between quantity and price columns
      const priceWidth = col5 - col4 - 5 // Space between price and amount columns
      const amountWidth = 30 // Fixed width for amount column

      // Split text if needed
      const itemLines = this.doc.splitTextToSize(itemText, itemWidth)
      const descriptionLines = this.doc.splitTextToSize(descriptionText, descriptionWidth)
      const quantityLines = this.doc.splitTextToSize(quantityText, quantityWidth)
      const priceLines = this.doc.splitTextToSize(priceText, priceWidth)
      const amountLines = this.doc.splitTextToSize(amountText, amountWidth)

      // Calculate max lines for this row
      const maxLines = Math.max(
        itemLines.length,
        descriptionLines.length,
        quantityLines.length,
        priceLines.length,
        amountLines.length
      )

      // Draw each line
      for (let line = 0; line < maxLines; line++) {
        if (line < itemLines.length) {
          this.doc.text(itemLines[line], col1, yPos + (line * 4))
        }
        if (line < descriptionLines.length) {
          this.doc.text(descriptionLines[line], col2, yPos + (line * 4))
        }
        if (line < quantityLines.length) {
          this.doc.text(quantityLines[line], col3, yPos + (line * 4), { align: "right" })
        }
        if (line < priceLines.length) {
          this.doc.text(priceLines[line], col4, yPos + (line * 4), { align: "right" })
        }
        if (line < amountLines.length) {
          this.doc.text(amountLines[line], col5, yPos + (line * 4), { align: "right" })
        }
      }

      yPos += (maxLines * 4) + 4
    })
  }

  private addNotesAndTotals(invoiceData: InvoiceData) {
    // Calculate position based on line items
    let yPos = this.pageHeight - 30
    
    // Total section (right side, teal background) - thinner
    const totalWidth = (this.margin * 2) + (`$${invoiceData.total.toFixed(2)}`.length * 4)
    const totalX = this.pageWidth - totalWidth
    const notesHeight = 30
    
    // Draw background for total - extend to margins
    this.doc.setFillColor(21, 93, 252)
    this.doc.rect(totalX, yPos, totalWidth, notesHeight, "F")
    
    // Total text
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(255, 255, 255) // White
    this.doc.text("TOTAL (USD):", totalX + totalWidth - (this.margin), yPos + 8, { align: "right" })
    
    // Total amount
    this.doc.setFontSize(24)
    this.doc.setFont("helvetica", "bold")
    this.doc.text(`$${invoiceData.total.toFixed(2)}`, totalX + totalWidth - (this.margin), yPos + this.margin + 3, { align: "right" })
    
    // Draw light blue background for notes - extend to margins
    this.doc.setFillColor(190, 219, 255)
    this.doc.rect(0, yPos, totalX, notesHeight, "F")
    
    // Notes header
    this.doc.setFontSize(10)
    this.doc.setFont("helvetica", "bold")
    this.doc.setTextColor(0, 0, 0)
    this.doc.text("NOTES:", this.margin, yPos + 8)
    
    // Notes content
    if (invoiceData.notes) {
    this.doc.setFont("helvetica", "normal")
    this.doc.setFontSize(10)
      const lines = this.doc.splitTextToSize(invoiceData.notes, totalX - this.margin * 1.5)
      this.doc.text(lines, this.margin, yPos + 13)
    }
  }
}
