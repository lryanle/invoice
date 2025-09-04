"use client"

import { useState, useEffect, forwardRef, useImperativeHandle } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EditCompanyDialog } from "@/components/edit-company-dialog"
import { DeleteCompanyDialog } from "@/components/delete-company-dialog"
import { useToast } from "@/hooks/use-toast"
import { Building, Building2, Mail, MapPin, Edit, Trash2 } from "lucide-react"
import { SkeletonCard } from "@/components/ui/skeleton"

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
  createdAt: string
}

export interface CompanyListRef {
  refreshCompanies: () => void
}

export const CompanyList = forwardRef<CompanyListRef>((props, ref) => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies")
      if (response.ok) {
        const data = await response.json()
        setCompanies(data)
      } else {
        throw new Error("Failed to fetch companies")
      }
    } catch (error) {
      console.error("Error fetching companies:", error)
      toast({
        title: "Error",
        description: "Failed to load companies. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useImperativeHandle(ref, () => ({
    refreshCompanies: fetchCompanies
  }))

  const handleCompanyUpdated = () => {
    fetchCompanies()
  }

  const handleCompanyDeleted = () => {
    fetchCompanies()
    toast({
      title: "Company deleted",
      description: "The company has been successfully deleted.",
    })
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={`company-skeleton-${i}`} />
        ))}
      </div>
    )
  }

  if (companies.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No companies yet</h3>
          <p className="text-muted-foreground mb-4">Add your first company to start creating invoices</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {companies.map((company) => (
        <Card key={company._id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  {company.name}
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {new Date(company.createdAt).toLocaleDateString()}
                </Badge>
              </div>
              <div className="flex gap-1">
                <EditCompanyDialog company={company} onCompanyUpdated={handleCompanyUpdated}>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </EditCompanyDialog>
                <DeleteCompanyDialog company={company} onCompanyDeleted={handleCompanyDeleted}>
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </DeleteCompanyDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{company.email}</span>
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div>{company.address.street1}</div>
                {company.address.street2 && <div>{company.address.street2}</div>}
                <div>
                  {company.address.city}, {company.address.state} {company.address.zip}
                </div>
                <div>{company.address.country}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})
