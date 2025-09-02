"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { LineItemsSection } from "@/components/line-items-section"
import { LiveInvoicePreview } from "@/components/live-invoice-preview"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { CalendarDays, Building2, FileText, Save, Download, Loader2 } from "lucide-react"

interface Company {
  _id: string
  name: string
  email: string
}

interface LineItem {
  name: string
  quantity: number
  cost: number
  total: number
}

interface InvoiceFormData {
  companyId: string
  date: string
  dueDate: string
  lineItems: LineItem[]
  tax: number
  notes: string
}

export function InvoiceForm() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const [formData, setFormData] = useState<InvoiceFormData>({
    companyId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days from now
    lineItems: [{ name: "", quantity: 1, cost: 0, total: 0 }],
    tax: 0,
    notes: "",
  })

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
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

  const updateFormData = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
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

  const handleSave = async (status: "draft" | "sent" = "draft") => {
    if (!formData.companyId) {
      toast({
        title: "Error",
        description: "Please select a company for this invoice.",
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
      const response = await fetch("/api/invoices", {
        method: "POST",
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
          title: "Invoice saved",
          description: `Invoice has been saved as ${status}.`,
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
      // First save the invoice
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          status: "sent",
          lineItems: formData.lineItems.filter((item) => item.name.trim() !== ""),
        }),
      })

      if (response.ok) {
        const invoice = await response.json()

        // Then generate and download PDF
        const pdfResponse = await fetch(`/api/invoices/${invoice._id}/pdf`)
        if (pdfResponse.ok) {
          const blob = await pdfResponse.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = `invoice-${invoice.invoiceNumber}.pdf`
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
              <Label htmlFor="company">Company *</Label>
              <Select value={formData.companyId} onValueChange={(value) => updateFormData("companyId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {company.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Invoice Date *</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date *</Label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateFormData("dueDate", e.target.value)}
                    className="pl-10"
                    required
                  />
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
      <div className="space-y-6">
        <LiveInvoicePreview
          companyId={formData.companyId}
          date={formData.date}
          dueDate={formData.dueDate}
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
