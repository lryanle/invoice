"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SkeletonStatCard, SkeletonChart } from "@/components/ui/skeleton"

interface UserAnalyticsData {
  basicStats: {
    totalInvoices: number
    totalClients: number
    totalRevenue: number
    averageInvoice: number
    maxInvoice: number
    minInvoice: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    invoiceCount: number
  }>
  statusDistribution: Array<{
    _id: string
    count: number
    totalAmount: number
  }>
  topLineItems: Array<{
    _id: string
    count: number
    totalRevenue: number
    averagePrice: number
  }>
  recentActivity: Array<{
    _id: string
    invoiceCount: number
    revenue: number
  }>
}

const COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6"]

export function UserAnalytics() {
  const [data, setData] = useState<UserAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/analytics/user")
        if (response.ok) {
          const analyticsData = await response.json()
          setData(analyticsData)
        }
      } catch (error) {
        console.error("Error fetching user analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Basic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        {/* Revenue Timeline */}
        <SkeletonChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <SkeletonChart />
          {/* Top Line Items */}
          <SkeletonChart />
        </div>

        {/* Recent Activity */}
        <SkeletonChart />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Basic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.basicStats.totalInvoices}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.basicStats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.basicStats.averageInvoice.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.basicStats.totalClients}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Timeline</CardTitle>
          <CardDescription>Monthly revenue and invoice count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
              invoiceCount: { label: "Invoice Count", color: "hsl(var(--chart-2))" },
            }}
            className="h-[300px]"
          >
            <LineChart data={data.monthlyRevenue} width={533} height={300}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="invoiceCount"
                stroke="var(--color-invoiceCount)"
                strokeWidth={2}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status Distribution</CardTitle>
            <CardDescription>Breakdown of invoice statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Count", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <PieChart width={444} height={250}>
                <Pie
                  data={data.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ _id, count }) => `${_id}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${entry._id}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Top Line Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Line Items</CardTitle>
            <CardDescription>Most frequently used line items</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                count: { label: "Usage Count", color: "hsl(var(--chart-1))" },
              }}
              className="h-[250px]"
            >
              <BarChart data={data.topLineItems.slice(0, 5)} layout="horizontal" width={444} height={250}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="_id" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity (Last 30 Days)</CardTitle>
          <CardDescription>Daily invoice creation and revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              invoiceCount: { label: "Invoices", color: "hsl(var(--chart-1))" },
              revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
            }}
            className="h-[200px]"
          >
            <BarChart data={data.recentActivity} width={356} height={200}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="invoiceCount" fill="var(--color-invoiceCount)" />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
