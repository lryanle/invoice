"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserAnalytics } from "@/components/user-analytics"
import { CompanyAnalytics } from "@/components/company-analytics"

interface Company {
  _id: string
  name: string
}

export function AnalyticsDashboard() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch("/api/companies")
        if (response.ok) {
          const data = await response.json()
          setCompanies(data)
        }
      } catch (error) {
        console.error("Error fetching companies:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <div className="space-y-6">
      <Tabs defaultValue="user" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="user">User Analytics</TabsTrigger>
          <TabsTrigger value="company">Company Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="space-y-6">
          <UserAnalytics />
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Selection</CardTitle>
              <CardDescription>
                Select a company to view detailed analytics, or leave blank to see overview of all companies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Select a company (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies Overview</SelectItem>
                  {companies.map((company) => (
                    <SelectItem key={company._id} value={company._id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <CompanyAnalytics companyId={selectedCompany} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
