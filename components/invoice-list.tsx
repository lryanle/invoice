"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditInvoiceDialog } from "@/components/edit-invoice-dialog"
import { DeleteInvoiceDialog } from "@/components/delete-invoice-dialog"
import { useToast } from "@/hooks/use-toast"
import { FileText, Loader2, Calendar, DollarSign, Download, Edit, Trash2 } from "lucide-react"
import { SkeletonCard } from "@/components/skeleton-card" // Import SkeletonCard component

interface Invoice {
  _id: string
  invoiceNumber: string
  companyId: string
  date: string
  dueDate: string
  total: number
  status: "draft" | "sent" | "paid" | "overdue"
  createdAt: string
}

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const response = await fetch("/api/invoices")
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        throw new Error("Failed to fetch invoices")
      }
    } catch (error) {
      console.error("Error fetching invoices:", error)
      toast({
        title: "Error",
        description: "Failed to load invoices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async (invoiceId: string, invoiceNumber: string) => {
    setDownloadingId(invoiceId)
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `invoice-${invoiceNumber}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast({
          title: "PDF Downloaded",
          description: "Invoice PDF has been downloaded successfully.",
        })
      } else {
        throw new Error("Failed to download PDF")
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const handleInvoiceUpdated = () => {
    fetchInvoices()
  }

  const handleInvoiceDeleted = () => {
    fetchInvoices()
    toast({
      title: "Invoice deleted",
      description: "The invoice has been successfully deleted.",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary"
      case "sent":
        return "default"
      case "paid":
        return "default"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
          <p className="text-muted-foreground mb-4">Create your first invoice to get started</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {invoices.map((invoice) => (
        <Card key={invoice._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {invoice.invoiceNumber}
                </CardTitle>
                <Badge variant={getStatusColor(invoice.status)} className="text-xs">
                  {invoice.status.toUpperCase()}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-primary">${invoice.total.toFixed(2)}</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadPDF(invoice._id, invoice.invoiceNumber)}
                disabled={downloadingId === invoice._id}
                className="flex-1"
              >
                {downloadingId === invoice._id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>

              <EditInvoiceDialog invoice={invoice} onInvoiceUpdated={handleInvoiceUpdated}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </EditInvoiceDialog>

              <DeleteInvoiceDialog invoice={invoice} onInvoiceDeleted={handleInvoiceDeleted}>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive bg-transparent">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DeleteInvoiceDialog>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
