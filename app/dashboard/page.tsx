"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Building2, DollarSign, TrendingUp, Plus, BarChart3, Eye, Edit, User, Notebook } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardStats {
  totalInvoices: number
  totalClients: number
  totalInvoicedAmount: number
  averageInvoiceAmount: number
}

interface RecentInvoice {
  _id: string
  invoiceNumber: string
  clientId: string
  total: number
  status: "draft" | "complete"
  date: string
  dueDate: string
  customerRef?: string
}

interface Client {
  _id: string;
  name: string;
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
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
      const invoicesResponse = await fetch("/api/invoices?page=1&limit=5")
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setRecentInvoices(invoicesData.invoices)
      }

      // Fetch clients
      const clientsResponse = await fetch("/api/clients");
      if (clientsResponse.ok) {
        const clientsData = await clientsResponse.json();
        setClients(clientsData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "complete":
        return "default"
      case "draft":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getClientName = (clientId: string) => {
    const client = clients.find(c => c._id === clientId);
    return client?.name || "Unknown Client";
  };

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
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : stats?.totalClients || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalClients === 0 ? "No clients added" : "Active clients"}
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
            {/* Manage Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Manage Invoices
                </CardTitle>
                <CardDescription>View and create invoices for your clients</CardDescription>
              </CardHeader>
              <CardContent className="w-full space-y-3 grid grid-cols-5 gap-4">
                <Link href="/invoices" className="col-span-4">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Invoices
                  </Button>
                </Link>
                <Link href="/invoices/new" className="col-span-1">
                  <Button className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Manage Clients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Manage Clients
                </CardTitle>
                <CardDescription>Add and manage clients you invoice</CardDescription>
              </CardHeader>
              <CardContent className="w-full space-y-3 grid grid-cols-5 gap-4">
                <Link href="/clients" className="col-span-4">
                  <Button variant="outline" className="w-full">
                    <Eye className="mr-2 h-4 w-4" />
                    View Clients
                  </Button>
                </Link>
                <Link href="/clients" className="col-span-1">
                  <Button className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* View Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  View Analytics
                </CardTitle>
                <CardDescription>Insights into your invoicing performance</CardDescription>
              </CardHeader>
              <CardContent className="w-full space-y-3 grid grid-cols-2 gap-4">
                <Link href="/analytics" className="col-span-1">
                  <Button className="w-full" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Personal Stats
                  </Button>
                </Link>
                <Link href="/analytics" className="col-span-1">
                  <Button className="w-full" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Client Stats
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
                        <div key={invoice._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-primary" />
                              <span className="font-medium">{getClientName(invoice.clientId)}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <FileText className="h-4 w-4" />
                              {`Invoice #${invoice.invoiceNumber}`}
                            </div>
                            {invoice.customerRef && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Notebook className="h-4 w-4" />
                                {invoice.customerRef}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm text-muted-foreground">
                                {new Date(invoice.date).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Due: {new Date(invoice.dueDate).toLocaleDateString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(invoice.total)}</div>
                              <Badge variant={getStatusColor(invoice.status)} className="text-xs">
                                {invoice.status.toUpperCase()}
                              </Badge>
                            </div>
                            <Link href={`/invoices/manage/${invoice._id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
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
