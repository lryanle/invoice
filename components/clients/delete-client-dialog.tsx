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
import { useErrorHandler, fetchWithErrorHandling, parseApiError } from "@/lib/client-error-handler"
import { Loader2 } from "lucide-react"

interface Client {
  _id: string
  name: string
}

interface DeleteClientDialogProps {
  readonly children: React.ReactNode
  readonly client: Client
  readonly onClientDeleted?: () => void
}

export function DeleteClientDialog({ children, client, onClientDeleted }: DeleteClientDialogProps) {
  const [loading, setLoading] = useState(false)
  const { handleError } = useErrorHandler()

  const handleDelete = async () => {
    setLoading(true)

    try {
      const response = await fetchWithErrorHandling(`/api/clients/${client._id}`, {
        method: "DELETE",
      }, "delete-client")

      if (response.ok) {
        onClientDeleted?.()
      } else {
        const errorData = await parseApiError(response)
        throw errorData
      }
    } catch (error) {
      handleError(error, "delete-client")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Client</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{client.name}"? This action cannot be undone. All invoices associated with
            this client will remain but the client information will be removed.
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
              "Delete Client"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
