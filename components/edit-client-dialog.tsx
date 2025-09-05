"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Building, Mail, MapPin } from "lucide-react"

interface Client {
  _id: string
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

interface EditClientDialogProps {
  children: React.ReactNode
  client: Client
  onClientUpdated?: () => void
}

export function EditClientDialog({ children, client, onClientUpdated }: EditClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    address: {
      street1: client.address.street1,
      street2: client.address.street2 || "",
      city: client.address.city,
      state: client.address.state,
      country: client.address.country,
      zip: client.address.zip,
    },
  })

  const updateFormData = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/clients/${client._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Client updated",
          description: "The client has been successfully updated.",
        })
        setOpen(false)
        onClientUpdated?.()
      } else {
        throw new Error("Failed to update client")
      }
    } catch (error) {
      console.error("Error updating client:", error)
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Edit Client
          </DialogTitle>
          <DialogDescription>Update the client information</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Client Name <span className="text-red-500">*</span></Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Client Email <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter client email"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Address Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
                              <Label className="text-sm font-medium">Client Address</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-street1">Street Address 1 <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-street1"
                  value={formData.address.street1}
                  onChange={(e) => updateFormData("address.street1", e.target.value)}
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-street2">Street Address 2</Label>
                <Input
                  id="edit-street2"
                  value={formData.address.street2}
                  onChange={(e) => updateFormData("address.street2", e.target.value)}
                  placeholder="Suite, floor, etc. (optional)"
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">City <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-city"
                    value={formData.address.city}
                    onChange={(e) => updateFormData("address.city", e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-state">State/Province <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-state"
                    value={formData.address.state}
                    onChange={(e) => updateFormData("address.state", e.target.value)}
                    placeholder="Enter state"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-country">Country <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-country"
                    value={formData.address.country}
                    onChange={(e) => updateFormData("address.country", e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-zip">ZIP/Postal Code <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-zip"
                    value={formData.address.zip}
                    onChange={(e) => updateFormData("address.zip", e.target.value)}
                    placeholder="Enter ZIP code"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
