"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface Company {
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

interface UserProfile {
  fullName: string
  email: string
  phone?: string
  address: {
    street1: string
    street2?: string
    city: string
    state: string
    country: string
    zip: string
  }
}

interface LineItem {
  name: string
  quantity: number
  cost: number
  total: number
}

interface LiveInvoicePreviewProps {
  companyId: string
  date: string
  dueDate: string
  lineItems: LineItem[]
  tax: number
  notes: string
  subtotal: number
  total: number
}

export function LiveInvoicePreview({
  companyId,
  date,
  dueDate,
  lineItems,
  tax,
  notes,
  subtotal,
  total,
}: LiveInvoicePreviewProps) {
  const [company, setCompany] = useState<Company | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [invoiceNumber] = useState(`INV-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`)

  useEffect(() => {
    fetchData()
  }, [companyId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch user profile
      const profileResponse = await fetch("/api/user/profile")
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      }

      // Fetch company if selected
      if (companyId) {
        const companyResponse = await fetch(`/api/companies/${companyId}`)
        if (companyResponse.ok) {
          const companyData = await companyResponse.json()
          setCompany(companyData)
        }
      } else {
        setCompany(null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const validLineItems = lineItems.filter((item) => item.name.trim() !== "")
  const itemsPerPage = 10
  const totalPages = Math.ceil(validLineItems.length / itemsPerPage)

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  const renderPage = (pageNumber: number) => {
    const startIndex = pageNumber * itemsPerPage
    const endIndex = Math.min(startIndex + itemsPerPage, validLineItems.length)
    const pageItems = validLineItems.slice(startIndex, endIndex)

    return (
      <div key={pageNumber} className="bg-white text-black p-8 min-h-[800px] shadow-lg border">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-primary">INVOICE</h1>
            <div className="text-sm space-y-1">
              <div>
                <span className="font-semibold">Invoice #:</span> {invoiceNumber}
              </div>
              <div>
                <span className="font-semibold">Date:</span> {date ? new Date(date).toLocaleDateString() : "Not set"}
              </div>
              <div>
                <span className="font-semibold">Due Date:</span>{" "}
                {dueDate ? new Date(dueDate).toLocaleDateString() : "Not set"}
              </div>
            </div>
          </div>
          {pageNumber === 0 && (
            <Badge variant="secondary" className="text-xs">
              Preview
            </Badge>
          )}
        </div>

        {/* From and To sections - only on first page */}
        {pageNumber === 0 && (
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* From */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">FROM:</h3>
              {userProfile ? (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{userProfile.fullName}</div>
                  <div>{userProfile.email}</div>
                  {userProfile.phone && <div>{userProfile.phone}</div>}
                  <div>{userProfile.address.street1}</div>
                  {userProfile.address.street2 && <div>{userProfile.address.street2}</div>}
                  <div>
                    {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zip}
                  </div>
                  <div>{userProfile.address.country}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Please complete your profile settings</div>
              )}
            </div>

            {/* To */}
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-primary">BILL TO:</h3>
              {company ? (
                <div className="text-sm space-y-1">
                  <div className="font-medium">{company.name}</div>
                  <div>{company.email}</div>
                  <div>{company.address.street1}</div>
                  {company.address.street2 && <div>{company.address.street2}</div>}
                  <div>
                    {company.address.city}, {company.address.state} {company.address.zip}
                  </div>
                  <div>{company.address.country}</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Please select a company</div>
              )}
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="mb-8">
          {pageNumber === 0 && (
            <div className="grid grid-cols-12 gap-2 bg-muted p-3 text-sm font-semibold border-b">
              <div className="col-span-6">DESCRIPTION</div>
              <div className="col-span-2 text-center">QTY</div>
              <div className="col-span-2 text-center">RATE</div>
              <div className="col-span-2 text-right">AMOUNT</div>
            </div>
          )}

          {pageItems.length > 0 ? (
            <div className="space-y-0">
              {pageItems.map((item, index) => (
                <div key={startIndex + index} className="grid grid-cols-12 gap-2 p-3 text-sm border-b">
                  <div className="col-span-6">{item.name}</div>
                  <div className="col-span-2 text-center">{item.quantity}</div>
                  <div className="col-span-2 text-center">${item.cost.toFixed(2)}</div>
                  <div className="col-span-2 text-right">${item.total.toFixed(2)}</div>
                </div>
              ))}
            </div>
          ) : (
            pageNumber === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <div className="text-sm">No line items added yet</div>
              </div>
            )
          )}
        </div>

        {/* Totals - only on last page */}
        {pageNumber === totalPages - 1 && (
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes - only on last page */}
        {pageNumber === totalPages - 1 && notes && (
          <div className="mb-8">
            <h3 className="font-semibold text-sm text-primary mb-2">NOTES:</h3>
            <div className="text-sm whitespace-pre-wrap">{notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <div>Thank you for your business!</div>
            {totalPages > 1 && (
              <div>
                Page {pageNumber + 1} of {totalPages}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Live Invoice Preview</span>
            {totalPages > 1 && <Badge variant="outline">{totalPages} pages</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[800px] overflow-y-auto">
            <div className="space-y-4 p-4">
              {Array.from({ length: Math.max(1, totalPages) }, (_, i) => renderPage(i))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items:</span>
            <span>{validLineItems.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-primary text-lg">${total.toFixed(2)}</span>
          </div>
          {totalPages > 1 && (
            <>
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pages:</span>
                <span>{totalPages}</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
