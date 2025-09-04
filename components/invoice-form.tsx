"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LineItemsSection } from "@/components/line-items-section"
import { LiveInvoicePreview } from "@/components/live-invoice-preview"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CalendarIcon, Building, FileText, Save, Download, Loader2, Plus } from "lucide-react"
import { CreateCompanyDialog } from "./create-company-dialog"
import { formatCompanyNameForFilename } from "@/lib/utils"

function formatDate(date: Date | undefined) {
  if (!date) {
    return ""
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })
}

function isValidDate(date: Date | undefined) {
  if (!date) {
    return false
  }
  return !isNaN(date.getTime())
}

interface Company {
  _id: string
  name: string
  email: string
}

interface LineItem {
  name: string
  description: string
  quantity: number
  cost: number
  total: number
}

interface InvoiceFormData {
  companyId: string
  date: string
  dueDate: string
  customerRef: string
  invoiceNumber: string
  lineItems: LineItem[]
  tax: number
  notes: string
}

interface InvoiceFormProps {
  invoiceId?: string
}

export function InvoiceForm({ invoiceId }: InvoiceFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Date state for calendar components
  const [dateOpen, setDateOpen] = useState(false)
  const [dueDateOpen, setDueDateOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
  const [dateMonth, setDateMonth] = useState<Date | undefined>(date)
  const [dueDateMonth, setDueDateMonth] = useState<Date | undefined>(dueDate)
  const [dateValue, setDateValue] = useState(formatDate(date))
  const [dueDateValue, setDueDateValue] = useState(formatDate(dueDate))

  const [formData, setFormData] = useState<InvoiceFormData>({
    companyId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    customerRef: "",
    invoiceNumber: "",
    lineItems: [{ name: "", description: "", quantity: 1.0, cost: 0, total: 0 }],
    tax: 0,
    notes: "",
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  // Load existing invoice for edit mode
  useEffect(() => {
    const loadInvoice = async () => {
      if (!invoiceId) return
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`)
        if (res.ok) {
          const data = await res.json()
          const invoiceDate = new Date(data.date)
          const invoiceDueDate = new Date(data.dueDate)
          
          setFormData({
            companyId: data.companyId || "",
            date: invoiceDate.toISOString().split("T")[0],
            dueDate: invoiceDueDate.toISOString().split("T")[0],
            customerRef: data.customerRef || "",
            invoiceNumber: data.invoiceNumber || "",
            lineItems: data.lineItems || [{ name: "", description: "", quantity: 1.0, cost: 0, total: 0 }],
            tax: data.tax || 0,
            notes: data.notes || "",
          })
          
          // Update calendar state
          setDate(invoiceDate)
          setDueDate(invoiceDueDate)
          setDateMonth(invoiceDate)
          setDueDateMonth(invoiceDueDate)
          setDateValue(formatDate(invoiceDate))
          setDueDateValue(formatDate(invoiceDueDate))
        }
      } catch (e) {
        console.error("Error loading invoice:", e)
      }
    }
    loadInvoice()
  }, [invoiceId])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
        
        // Auto-select the most recent company if creating a new invoice
        if (!invoiceId) {
          await fetchRecentCompany(data)
        }
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRecentCompany = async (companies: Company[]) => {
    try {
      const response = await fetch("/api/user/recent-company")
      if (response.ok) {
        const data = await response.json()
        if (data.companyId && companies.some(c => c._id === data.companyId)) {
          // Update form data with the recent company
          setFormData(prev => ({
            ...prev,
            companyId: data.companyId
          }))
          
          // Generate invoice number for the selected company
          await generateInvoiceNumber(data.companyId)
        }
      }
    } catch (error) {
      console.error("Error fetching recent company:", error)
    }
  }

  const updateFormData = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const generateInvoiceNumber = async (companyId: string) => {
    if (!companyId) return
    try {
      const response = await fetch(`/api/invoices/generate-number?companyId=${companyId}`)
      if (response.ok) {
        const data = await response.json()
        updateFormData("invoiceNumber", data.invoiceNumber)
      }
    } catch (error) {
      console.error("Error generating invoice number:", error)
    }
  }

  const updateLineItems = (lineItems: LineItem[]) => {
    updateFormData("lineItems", lineItems)
  }

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + formData.tax
  }

  const handleSave = async (status: "draft" | "complete" = "draft") => {
    if (!formData.companyId) {
      toast({
        title: "Error",
        description: "Please select a company for this invoice.",
        variant: "destructive",
      })
      return
    }

    if (!formData.invoiceNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number.",
        variant: "destructive",
      })
      return
    }

    if (formData.lineItems.length === 0 || formData.lineItems.every((item) => !item.name)) {
      toast({
        title: "Error",
        description: "Please add at least one line item.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const isEdit = Boolean(invoiceId)
      const endpoint = isEdit ? `/api/invoices/${invoiceId}` : "/api/invoices"
      const method = isEdit ? "PUT" : "POST"
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status,
          lineItems: formData.lineItems.filter((item) => item.name.trim() !== ""),
        }),
      })

      if (response.ok) {
        const invoice = await response.json()
        toast({
          title: isEdit ? "Invoice updated" : "Invoice saved",
          description: isEdit ? "Invoice was updated successfully." : `Invoice has been saved as ${status}.`,
        })

        router.push("/invoices")
      } else {
        throw new Error("Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving invoice:", error)
      toast({
        title: "Error",
        description: "Failed to save invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAndExport = async () => {
    if (!formData.companyId) {
      toast({
        title: "Error",
        description: "Please select a company for this invoice.",
        variant: "destructive",
      })
      return
    }

    if (!formData.invoiceNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter an invoice number.",
        variant: "destructive",
      })
      return
    }

    if (formData.lineItems.length === 0 || formData.lineItems.every((item) => !item.name)) {
      toast({
        title: "Error",
        description: "Please add at least one line item.",
        variant: "destructive",
      })
      return
    }

    setExporting(true)

    try {
      const isEdit = Boolean(invoiceId)
      // First save/update the invoice
      const endpoint = isEdit ? `/api/invoices/${invoiceId}` : "/api/invoices"
      const method = isEdit ? "PUT" : "POST"
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "complete",
          lineItems: formData.lineItems.filter((item) => item.name.trim() !== ""),
        }),
      })

      if (response.ok) {
        const invoice = await response.json()

        // Then generate and download PDF
        const pdfId = isEdit ? invoiceId : invoice._id
        const pdfResponse = await fetch(`/api/invoices/${pdfId}/pdf`)
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          
          // Get filename from response headers
          const contentDisposition = pdfResponse.headers.get('content-disposition')
          const filename = contentDisposition?.match(/filename="(.+)"/)?.[1] || `invoice-${invoice.invoiceNumber}.pdf`
          a.download = filename
          
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)

          toast({
            title: "Success",
            description: "Invoice saved and PDF downloaded successfully.",
          })

          router.push("/invoices")
        } else {
          throw new Error("Failed to generate PDF")
        }
      } else {
        throw new Error("Failed to save invoice")
      }
    } catch (error) {
      console.error("Error saving and exporting invoice:", error)
      toast({
        title: "Error",
        description: "Failed to save and export invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Form Section */}
      <div className="space-y-6">
        {/* Invoice Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Invoice Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
              <span className="flex items-center gap-2">
                <Select value={formData.companyId} onValueChange={(value) => {
                  updateFormData("companyId", value)
                  // Auto-generate invoice number if field is empty
                  if (!formData.invoiceNumber.trim()) {
                    generateInvoiceNumber(value)
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company._id} value={company._id}>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          {company.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <CreateCompanyDialog>
                  <Button variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CreateCompanyDialog>
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="customerRef">Customer Reference</Label>
                <Input
                  id="customerRef"
                  value={formData.customerRef || ""}
                  onChange={(e) => updateFormData("customerRef", e.target.value)}
                  placeholder="e.g., Project Alpha, Website Redesign, etc."
                />
              </div>
              <div className="space-y-2 col-span-1">
                <Label htmlFor="invoiceNumber">Invoice Number <span className="text-red-500">*</span></Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber || ""}
                  onChange={(e) => updateFormData("invoiceNumber", e.target.value)}
                  placeholder="e.g., 1, 2, 3..."
                  required
                />
              </div>
            </div>


            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Invoice Date <span className="text-red-500">*</span></Label>
                <div className="relative flex gap-2">
                  <Input
                    id="date"
                    value={dateValue}
                    placeholder="January 01, 2025"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      setDateValue(e.target.value)
                      if (isValidDate(newDate)) {
                        setDate(newDate)
                        setDateMonth(newDate)
                        updateFormData("date", newDate.toISOString().split("T")[0])
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setDateOpen(true)
                      }
                    }}
                  />
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        month={dateMonth}
                        onMonthChange={setDateMonth}
                        onSelect={(selectedDate) => {
                          setDate(selectedDate)
                          setDateValue(formatDate(selectedDate))
                          if (selectedDate) {
                            updateFormData("date", selectedDate.toISOString().split("T")[0])
                          }
                          setDateOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
                <div className="relative flex gap-2">
                  <Input
                    id="dueDate"
                    value={dueDateValue}
                    placeholder="January 31, 2025"
                    className="bg-background pr-10"
                    onChange={(e) => {
                      const newDate = new Date(e.target.value)
                      setDueDateValue(e.target.value)
                      if (isValidDate(newDate)) {
                        setDueDate(newDate)
                        setDueDateMonth(newDate)
                        updateFormData("dueDate", newDate.toISOString().split("T")[0])
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault()
                        setDueDateOpen(true)
                      }
                    }}
                  />
                  <Popover open={dueDateOpen} onOpenChange={setDueDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        id="due-date-picker"
                        variant="ghost"
                        className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select due date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        captionLayout="dropdown"
                        month={dueDateMonth}
                        onMonthChange={setDueDateMonth}
                        onSelect={(selectedDate) => {
                          setDueDate(selectedDate)
                          setDueDateValue(formatDate(selectedDate))
                          if (selectedDate) {
                            updateFormData("dueDate", selectedDate.toISOString().split("T")[0])
                          }
                          setDueDateOpen(false)
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <LineItemsSection lineItems={formData.lineItems} onLineItemsChange={updateLineItems} />
          </CardContent>
        </Card>

        {/* Additional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax">Tax Amount ($)</Label>
              <Input
                id="tax"
                type="number"
                step="0.01"
                min="0"
                value={formData.tax}
                onChange={(e) => updateFormData("tax", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Add any additional notes or terms..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => handleSave("draft")}
            disabled={saving || exporting}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </>
            )}
          </Button>
          <Button
            onClick={() => handleSave("complete")}
            disabled={saving || exporting}
            className="flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={handleSaveAndExport} disabled={saving || exporting} className="flex-1">
            {exporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Save & Export PDF
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live Invoice Preview */}
      <div className="space-y-6  min-h-[500px] h-[80vh]">
        <LiveInvoicePreview
          companyId={formData.companyId}
          date={formData.date}
          dueDate={formData.dueDate}
          customerRef={formData.customerRef}
          invoiceNumber={formData.invoiceNumber}
          lineItems={formData.lineItems}
          tax={formData.tax}
          notes={formData.notes}
          subtotal={calculateSubtotal()}
          total={calculateTotal()}
        />
      </div>
    </div>
  )
}
