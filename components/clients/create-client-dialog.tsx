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

interface ClientFormData {
  name: string
  email: string
  address: {
    street1: string
    street2: string
    city: string
    state: string
    country: string
    zip: string
  }
}

interface CreateClientDialogProps {
  readonly children: React.ReactNode
  readonly onClientCreated?: () => void
}

export function CreateClientDialog({ children, onClientCreated }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<ClientFormData>({
    name: "",
    email: "",
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      country: "",
      zip: "",
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
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Client created",
          description: "The client has been successfully added.",
        })
        setOpen(false)
        setFormData({
          name: "",
          email: "",
          address: {
            street1: "",
            street2: "",
            city: "",
            state: "",
            country: "",
            zip: "",
          },
        })
        onClientCreated?.()
      } else {
        throw new Error("Failed to create client")
      }
    } catch (error) {
      console.error("Error creating client:", error)
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] min-h-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            Add New Client
          </DialogTitle>
          <DialogDescription>Add a client that you'll be sending invoices to</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="overflow-y-auto max-h-[calc(90vh-200px)] min-h-[200px] space-y-4 p-1">
            {/* Client Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name <span className="text-red-500">*</span></Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Client Email <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
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
                  <Label htmlFor="street1">Street Address 1 <span className="text-red-500">*</span></Label>
                  <Input
                    id="street1"
                    value={formData.address.street1}
                    onChange={(e) => updateFormData("address.street1", e.target.value)}
                    placeholder="Enter street address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="street2">Street Address 2</Label>
                  <Input
                    id="street2"
                    value={formData.address.street2}
                    onChange={(e) => updateFormData("address.street2", e.target.value)}
                    placeholder="Suite, floor, etc. (optional)"
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
                    <Input
                      id="city"
                      value={formData.address.city}
                      onChange={(e) => updateFormData("address.city", e.target.value)}
                      placeholder="Enter city"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province <span className="text-red-500">*</span></Label>
                    <Input
                      id="state"
                      value={formData.address.state}
                      onChange={(e) => updateFormData("address.state", e.target.value)}
                      placeholder="Enter state"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                    <Input
                      id="country"
                      value={formData.address.country}
                      onChange={(e) => updateFormData("address.country", e.target.value)}
                      placeholder="Enter country"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code <span className="text-red-500">*</span></Label>
                    <Input
                      id="zip"
                      value={formData.address.zip}
                      onChange={(e) => updateFormData("address.zip", e.target.value)}
                      placeholder="Enter ZIP code"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="py-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
