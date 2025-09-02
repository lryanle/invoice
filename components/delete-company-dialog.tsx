"use client"

import type React from "react"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface Company {
  _id: string
  name: string
}

interface DeleteCompanyDialogProps {
  children: React.ReactNode
  company: Company
  onCompanyDeleted?: () => void
}

export function DeleteCompanyDialog({ children, company, onCompanyDeleted }: DeleteCompanyDialogProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/companies/${company._id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        onCompanyDeleted?.()
      } else {
        throw new Error("Failed to delete company")
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      toast({
        title: "Error",
        description: "Failed to delete company. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Company</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{company.name}"? This action cannot be undone. All invoices associated with
            this company will remain but the company information will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Company"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
