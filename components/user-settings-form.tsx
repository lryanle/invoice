"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, User, Phone, Mail, MapPin, DollarSign } from "lucide-react"

interface UserProfile {
  fullName: string
  email: string
  phone: string
  currency: string
  address: {
    street1: string
    street2: string
    city: string
    state: string
    country: string
    zip: string
  }
}

const currencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
]

export function UserSettingsForm() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    fullName: "",
    email: "",
    phone: "",
    currency: "USD",
    address: {
      street1: "",
      street2: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },
  })

  useEffect(() => {
    if (user) {
      // Pre-populate with Clerk user data
      setProfile((prev) => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      }))

      // Fetch existing profile from database
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/user/profile")
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setProfile({
            fullName: data.fullName || "",
            email: data.email || "",
            phone: data.phone || "",
            currency: data.currency || "USD",
            address: data.address || {
              street1: "",
              street2: "",
              city: "",
              state: "",
              country: "",
              zip: "",
            },
          })
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch("/api/user/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profile),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "Your profile information has been updated successfully.",
        })
      } else {
        throw new Error("Failed to save profile")
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateProfile = (field: string, value: string) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1]
      setProfile((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }))
    } else {
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
            <Input
              id="fullName"
              value={profile.fullName}
              onChange={(e) => updateProfile("fullName", e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile("email", e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => updateProfile("phone", e.target.value)}
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Default Currency</Label>
            <Select value={profile.currency} onValueChange={(value) => updateProfile("currency", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      {currency.symbol} {currency.name} ({currency.code})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Address Information */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Address Information</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street1">Street Address 1 <span className="text-red-500">*</span></Label>
            <Input
              id="street1"
              value={profile.address.street1}
              onChange={(e) => updateProfile("address.street1", e.target.value)}
              placeholder="Enter street address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="street2">Street Address 2</Label>
            <Input
              id="street2"
              value={profile.address.street2}
              onChange={(e) => updateProfile("address.street2", e.target.value)}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
              <Input
                id="city"
                value={profile.address.city}
                onChange={(e) => updateProfile("address.city", e.target.value)}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State/Province <span className="text-red-500">*</span></Label>
              <Input
                id="state"
                value={profile.address.state}
                onChange={(e) => updateProfile("address.state", e.target.value)}
                placeholder="Enter state or province"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
              <Input
                id="country"
                value={profile.address.country}
                onChange={(e) => updateProfile("address.country", e.target.value)}
                placeholder="Enter country"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip">ZIP/Postal Code <span className="text-red-500">*</span></Label>
              <Input
                id="zip"
                value={profile.address.zip}
                onChange={(e) => updateProfile("address.zip", e.target.value)}
                placeholder="Enter ZIP or postal code"
                required
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button type="submit" disabled={saving} className="min-w-32">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
