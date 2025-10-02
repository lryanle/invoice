"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

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

interface UserProfile {
  fullName: string
  email: string
  phone?: string
  currency?: string
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
  description?: string
  quantity: number
  cost: number
  total: number
}

interface LiveInvoicePreviewProps {
  readonly clientId: string
  readonly date: string
  readonly dueDate: string
  readonly customerRef: string
  readonly invoiceNumber: string
  readonly lineItems: LineItem[]
  readonly tax: number
  readonly notes: string
  readonly subtotal: number
  readonly total: number
}

export function LiveInvoicePreview({
  clientId,
  date,
  dueDate,
  customerRef,
  invoiceNumber,
  lineItems,
  tax,
  notes,
  subtotal,
  total,
}: LiveInvoicePreviewProps) {
  const [client, setClient] = useState<Client | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [clientId])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch user profile
      const profileResponse = await fetch("/api/user/profile")
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setUserProfile(profileData)
      }

      // Fetch client if selected
      if (clientId) {
        const clientResponse = await fetch(`/api/clients/${clientId}`)
        if (clientResponse.ok) {
          const clientData = await clientResponse.json()
          setClient(clientData)
        }
      } else {
        setClient(null)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    const currency = userProfile?.currency || "USD"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const validLineItems = lineItems.filter((item) => item.name.trim() !== "")
  const itemsPerPage = 8
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
      <div key={pageNumber} className="bg-white text-black p-8 min-h-[800px] shadow-lg border rounded-lg relative">
        {/* Header with improved spacing */}
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-blue-600">INVOICE</h1>
            <div className="text-sm space-y-1 text-gray-700">
              <div className="flex gap-2">
                <span className="font-semibold min-w-20">Invoice #:</span>
                <span>{invoiceNumber || "Not set"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-20">Date:</span>
                <span>{date ? new Date(date).toLocaleDateString() : "Not set"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-20">Due Date:</span>
                <span>{dueDate ? new Date(dueDate).toLocaleDateString() : "Not set"}</span>
              </div>
              {customerRef && (
                <div className="flex gap-2">
                  <span className="font-semibold min-w-20">Reference:</span>
                  <span>{customerRef}</span>
                </div>
              )}
            </div>
          </div>
          {pageNumber === 0 && (
            <Badge variant="secondary" className="text-xs bg-gray-100">
              Preview
            </Badge>
          )}
        </div>

        {/* From and To sections with improved layout - only on first page */}
        {pageNumber === 0 && (
          <div className="grid grid-cols-2 gap-12 mb-10">
            {/* From Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-blue-600 border-b border-blue-200 pb-1">FROM</h3>
              {userProfile ? (
                <div className="text-sm space-y-1 text-gray-700">
                  <div className="font-semibold text-base text-black">{userProfile.fullName}</div>
                  <div>{userProfile.email}</div>
                  {userProfile.phone && <div>{userProfile.phone}</div>}
                  <div className="pt-2 space-y-1">
                    <div>{userProfile.address.street1}</div>
                    {userProfile.address.street2 && <div>{userProfile.address.street2}</div>}
                    <div>
                      {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zip}
                    </div>
                    <div>{userProfile.address.country}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Please complete your profile settings</div>
              )}
            </div>

            {/* To Section */}
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-blue-600 border-b border-blue-200 pb-1">BILL TO</h3>
              {client ? (
                <div className="text-sm space-y-1 text-gray-700">
                  <div className="font-semibold text-base text-black">{client.name}</div>
                  <div>{client.email}</div>
                  <div className="pt-2 space-y-1">
                    <div>{client.address.street1}</div>
                    {client.address.street2 && <div>{client.address.street2}</div>}
                    <div>
                      {client.address.city}, {client.address.state} {client.address.zip}
                    </div>
                    <div>{client.address.country}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">Please select a client</div>
              )}
            </div>
          </div>
        )}

        {/* Line Items Table with improved spacing */}
        <div className="mb-10">
          {pageNumber === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-t-lg">
              <div className="grid grid-cols-12 gap-4 p-4 text-sm font-bold text-blue-800">
                <div className="col-span-5">DESCRIPTION</div>
                <div className="col-span-2 text-center">QTY</div>
                <div className="col-span-2 text-center">RATE</div>
                <div className="col-span-3 text-right">AMOUNT</div>
              </div>
            </div>
          )}

          {pageItems.length > 0 ? (
            <div className="border border-t-0 border-blue-200 rounded-b-lg">
              {pageItems.map((item, index) => (
                <div
                  key={startIndex + index}
                  className="grid grid-cols-12 gap-4 p-4 text-sm border-b border-gray-100 last:border-b-0"
                >
                  <div className="col-span-5">
                    <div className="font-medium text-black">{item.name}</div>
                    {item.description && (
                      <div className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</div>
                    )}
                  </div>
                  <div className="col-span-2 text-center font-medium">{item.quantity}</div>
                  <div className="col-span-2 text-center">{formatCurrency(item.cost)}</div>
                  <div className="col-span-3 text-right font-semibold">{formatCurrency(item.total)}</div>
                </div>
              ))}
            </div>
          ) : (
            pageNumber === 0 && (
              <div className="border border-t-0 border-blue-200 rounded-b-lg p-8 text-center text-gray-500">
                <div className="text-sm italic">No line items added yet</div>
              </div>
            )
          )}
        </div>

        {/* Totals with improved styling - only on last page */}
        {pageNumber === totalPages - 1 && (
          <div className="flex justify-end mb-10">
            <div className="w-80 bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">{formatCurrency(tax)}</span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes with improved styling - only on last page */}
        {pageNumber === totalPages - 1 && notes && (
          <div className="mb-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-bold text-sm text-blue-600 mb-3">NOTES</h3>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{notes}</div>
          </div>
        )}

        {/* Footer */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="flex justify-between items-center text-xs text-gray-500 border-t border-gray-200 pt-4">
            <div className="italic">Thank you for your business!</div>
            {totalPages > 1 && (
              <div className="font-medium">
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
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {tax > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax:</span>
              <span>{formatCurrency(tax)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span className="text-primary text-lg">{formatCurrency(total)}</span>
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
