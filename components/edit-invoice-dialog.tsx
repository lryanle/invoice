"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { FileText } from "lucide-react"

interface Invoice {
  _id: string
  invoiceNumber: string
  status: string
}

interface EditInvoiceDialogProps {
  children: React.ReactNode
  invoice: Invoice
  onInvoiceUpdated?: () => void
}

export function EditInvoiceDialog({ children, invoice, onInvoiceUpdated }: EditInvoiceDialogProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const handleEdit = () => {
    // For now, just show a message that editing will be implemented
    toast({
      title: "Edit Invoice",
      description: "Invoice editing functionality will be implemented in the live preview system.",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Edit Invoice
          </DialogTitle>
          <DialogDescription>Edit invoice {invoice.invoiceNumber}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Invoice editing functionality will be available in the live preview system.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleEdit}>Edit Invoice</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
