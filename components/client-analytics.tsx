"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ClientAnalyticsProps {
  clientId: string
}

interface ClientAnalyticsData {
  client?: {
    _id: string
    name: string
  }
  stats?: {
    totalInvoices: number
    totalRevenue: number
    averageInvoice: number
  }
  lineItemBreakdown?: Array<{
    _id: string
    count: number
    totalRevenue: number
    averagePrice: number
  }>
  monthlyRevenue?: Array<{
    month: string
    revenue: number
    invoiceCount: number
  }>
  clientsAnalytics?: Array<{
    _id: string
    clientName: string
    totalInvoices: number
    totalRevenue: number
    averageInvoice: number
    lastInvoiceDate: string
  }>
}

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#06b6d4", "#f97316"]

export function ClientAnalytics({ clientId }: ClientAnalyticsProps) {
  const [data, setData] = useState<ClientAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const url = clientId ? `/api/analytics/clients?clientId=${clientId}` : "/api/analytics/clients"

        const response = await fetch(url)
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error("Error fetching client analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [clientId])

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  // Show overview of all clients
  if (!clientId && data.clientsAnalytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Clients Overview</CardTitle>
            <CardDescription>Performance comparison across all clients</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                totalRevenue: { label: "Total Revenue", color: "hsl(var(--chart-1))" },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.clientsAnalytics.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="clientName" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="totalRevenue" fill="var(--color-totalRevenue)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.clientsAnalytics.slice(0, 6).map((client) => (
            <Card key={client._id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{client.clientName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue:</span>
                  <span className="font-medium">${client.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Invoices:</span>
                  <span className="font-medium">{client.totalInvoices}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Avg Invoice:</span>
                  <span className="font-medium">${client.averageInvoice.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Show specific client analytics
  if (clientId && data.client && data.stats) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{data.client.name} Analytics</CardTitle>
            <CardDescription>Detailed performance metrics for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{data.stats.totalInvoices}</div>
                <div className="text-sm text-muted-foreground">Total Invoices</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${data.stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">${data.stats.averageInvoice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Average Invoice</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Timeline</CardTitle>
              <CardDescription>Monthly revenue for {data.client.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {data.lineItemBreakdown && data.lineItemBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Line Item Breakdown</CardTitle>
              <CardDescription>Revenue distribution by service/product type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  totalRevenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.lineItemBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ _id, totalRevenue }) => `${_id}: $${totalRevenue.toFixed(0)}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="totalRevenue"
                    >
                      {data.lineItemBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return <div className="text-center py-8">No data available for the selected client</div>
}
