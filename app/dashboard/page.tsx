"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Building2, DollarSign, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalInvoices: number
  totalCompanies: number
  totalInvoicedAmount: number
  averageInvoiceAmount: number
}

interface RecentInvoice {
  _id: string
  invoiceNumber: string
  companyName: string
  total: number
  status: string
  date: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const statsResponse = await fetch("/api/dashboard/stats")
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch recent invoices
      const invoicesResponse = await fetch("/api/invoices?limit=5")
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setRecentInvoices(invoicesData)
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Overview of your invoice management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalInvoices || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalInvoices === 0 ? "No invoices yet" : "Total generated"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalCompanies || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalCompanies === 0 ? "No companies added" : "Active clients"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-20" /> : formatCurrency(stats?.totalInvoicedAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalInvoicedAmount === 0 ? "No revenue yet" : "Total revenue"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-20" /> : formatCurrency(stats?.averageInvoiceAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.averageInvoiceAmount === 0 ? "No average yet" : "Per invoice"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  Create Invoice
                </CardTitle>
                <CardDescription>Generate a new invoice for your clients</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/invoices">
                  <Button className="w-full">Go to Invoices</Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Manage Companies
                </CardTitle>
                <CardDescription>Add and manage companies you invoice</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/companies">
                  <Button className="w-full">
                    View Companies
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  View All Invoices
                </CardTitle>
                <CardDescription>Browse and manage all your invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/invoices">
                  <Button className="w-full">
                    View Invoices
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Your latest invoice activity</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                if (loading) {
                  return (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }, (_, i) => (
                        <div key={`skeleton-${i}`} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <div className="text-right space-y-2">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                }
                
                if (recentInvoices.length > 0) {
                  return (
                    <div className="space-y-4">
                      {recentInvoices.map((invoice) => (
                        <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="space-y-1">
                            <div className="font-medium">{invoice.invoiceNumber}</div>
                            <div className="text-sm text-muted-foreground">{invoice.companyName}</div>
                          </div>
                          <div className="text-right space-y-1">
                            <div className="font-medium">{formatCurrency(invoice.total)}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="pt-4">
                        <Link href="/invoices">
                          <Button variant="outline" className="w-full bg-transparent">
                            View All Invoices
                          </Button>
                        </Link>
                      </div>
                    </div>
                  )
                }
                
                return (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No recent invoices</p>
                    <p className="text-sm">Create your first invoice to get started</p>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
