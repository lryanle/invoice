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
import { Loader2, Building2, Mail, MapPin } from "lucide-react"

interface CompanyFormData {
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

interface CreateCompanyDialogProps {
  children: React.ReactNode
  onCompanyCreated?: () => void
}

export function CreateCompanyDialog({ children, onCompanyCreated }: CreateCompanyDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState<CompanyFormData>({
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
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Company created",
          description: "The company has been successfully added.",
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
        onCompanyCreated?.()
      } else {
        throw new Error("Failed to create company")
      }
    } catch (error) {
      console.error("Error creating company:", error)
      toast({
        title: "Error",
        description: "Failed to create company. Please try again.",
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
            <Building2 className="h-5 w-5 text-primary" />
            Add New Company
          </DialogTitle>
          <DialogDescription>Add a company that you'll be sending invoices to</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  placeholder="Enter company email"
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
              <Label className="text-sm font-medium">Company Address</Label>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street1">Street Address 1 *</Label>
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
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => updateFormData("address.city", e.target.value)}
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State/Province *</Label>
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
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={formData.address.country}
                    onChange={(e) => updateFormData("address.country", e.target.value)}
                    placeholder="Enter country"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP/Postal Code *</Label>
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

          <DialogFooter>
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
                "Create Company"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
