"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AnalyticsMetrics } from "@/components/analytics/analytics-metrics"
import { EnhancedChart } from "@/components/charts/enhanced-chart"
import { DateRangeFilterCard } from "@/components/filters/date-range-filter-card"
import { SkeletonStatCard, SkeletonChart } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Clock, CheckCircle, DollarSign } from "lucide-react"

interface UserAnalyticsData {
  basicStats: {
    totalInvoices: number
    totalClients: number
    totalRevenue: number
    averageInvoice: number
    maxInvoice: number
    minInvoice: number
    completedInvoices: number
    draftInvoices: number
    completionRate: number
    avgCompletedInvoice: number
    avgDraftInvoice: number
    completedRevenue: number
    draftRevenue: number
    revenueGrowth: number
  }
  monthlyRevenue: Array<{
    month: string
    revenue: number
    invoiceCount: number
    completedRevenue: number
    draftRevenue: number
  }>
  weeklyRevenue: Array<{
    week: string
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
    totalQuantity: number
  }>
  clientPerformance: Array<{
    _id: string
    clientName: string
    totalInvoices: number
    totalRevenue: number
    averageInvoice: number
    lastInvoiceDate: string
    completedInvoices: number
    completedRevenue: number
    completionRate: number
  }>
  recentActivity: Array<{
    _id: string
    invoiceCount: number
    revenue: number
    completedCount: number
    draftCount: number
  }>
  paymentTrends: {
    avgDaysToPayment: number
    minDaysToPayment: number
    maxDaysToPayment: number
  }
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function UserAnalytics() {
  const [data, setData] = useState<UserAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (dateRange.from) params.append("startDate", dateRange.from.toISOString())
        if (dateRange.to) params.append("endDate", dateRange.to.toISOString())
        
        const response = await fetch(`/api/analytics/user?${params.toString()}`)
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
  }, [dateRange])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Date Range Filter */}
        <DateRangeFilterCard onDateRangeChange={setDateRange} />
        
        {/* Basic Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
          <SkeletonStatCard />
        </div>

        {/* Charts */}
        <SkeletonChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    )
  }

  if (!data) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <DateRangeFilterCard onDateRangeChange={setDateRange} />

      {/* Enhanced Metrics */}
      <AnalyticsMetrics stats={data.basicStats} />

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Client Insights</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          {/* Revenue Timeline */}
          <EnhancedChart
            data={data.monthlyRevenue}
            title="Revenue Timeline"
            description="Monthly revenue from completed invoices only"
            chartType="line"
            dataKeys={["revenue", "invoiceCount"]}
            xAxisKey="month"
            height={400}
            showControls={true}
          />

          {/* Weekly Revenue */}
          <EnhancedChart
            data={data.weeklyRevenue}
            title="Weekly Revenue Trend"
            description="Last 12 weeks revenue from completed invoices"
            chartType="area"
            dataKeys={["revenue", "invoiceCount"]}
            xAxisKey="week"
            height={300}
            showControls={true}
          />

          {/* Revenue Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EnhancedChart
              data={data.monthlyRevenue.slice(-6)}
              title="Recent Monthly Invoice Volume"
              description="Invoice count trends over the last 6 months"
              chartType="bar"
              dataKeys={["invoiceCount"]}
              xAxisKey="month"
              height={300}
              showControls={false}
            />

            <EnhancedChart
              data={data.topLineItems.slice(0, 8)}
              title="Top Revenue Line Items"
              description="Most profitable services and products (completed invoices only)"
              chartType="bar"
              dataKeys={["totalRevenue"]}
              xAxisKey="_id"
              height={300}
              showControls={true}
              allowedChartTypes={["bar", "pie"]}
            />
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {data.basicStats.completionRate.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  {data.basicStats.completedInvoices} of {data.basicStats.totalInvoices} invoices
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-blue-500" />
                  Avg Payment Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.paymentTrends.avgDaysToPayment.toFixed(0)} days
                </div>
                <div className="text-xs text-muted-foreground">
                  Range: {data.paymentTrends.minDaysToPayment.toFixed(0)} - {data.paymentTrends.maxDaysToPayment.toFixed(0)} days
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-purple-500" />
                  Revenue Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold flex items-center">
                  {data.basicStats.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-5 w-5 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 mr-1 text-red-500" />
                  )}
                  {data.basicStats.revenueGrowth >= 0 ? '+' : ''}{data.basicStats.revenueGrowth.toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  vs previous period
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Line Items Performance */}
          <EnhancedChart
            data={data.topLineItems.slice(0, 10)}
            title="Line Items Performance"
            description="Revenue and usage analysis by service/product"
            chartType="composed"
            dataKeys={["totalRevenue", "count", "averagePrice"]}
            xAxisKey="_id"
            height={400}
            showControls={true}
          />
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          {/* Client Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Client Performance Overview</CardTitle>
              <CardDescription>Revenue and activity metrics by client</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.clientPerformance.slice(0, 10).map((client, index) => (
                  <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{client.clientName}</div>
                      <div className="text-sm text-muted-foreground">
                        {client.totalInvoices} invoices • Last: {new Date(client.lastInvoiceDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-right">
                        <div className="font-medium">${client.totalRevenue.toLocaleString()}</div>
                        <div className="text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${client.averageInvoice.toFixed(0)}</div>
                        <div className="text-muted-foreground">Avg Invoice</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={client.completionRate >= 80 ? "default" : "secondary"}>
                          {client.completionRate.toFixed(0)}%
                        </Badge>
                        <div className="text-muted-foreground">Complete</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Client Revenue Chart */}
          <EnhancedChart
            data={data.clientPerformance.slice(0, 8)}
            title="Top Clients by Revenue"
            description="Revenue contribution by top performing clients"
            chartType="bar"
            dataKeys={["totalRevenue", "completedRevenue"]}
            xAxisKey="clientName"
            height={400}
            showControls={true}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {/* Recent Activity */}
          <EnhancedChart
            data={data.recentActivity}
            title="Recent Activity (Last 30 Days)"
            description="Daily completed invoice activity and revenue"
            chartType="line"
            dataKeys={["invoiceCount", "revenue"]}
            xAxisKey="_id"
            height={400}
            showControls={true}
          />

          {/* Activity Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data.recentActivity.reduce((sum, day) => sum + day.invoiceCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">completed in last 30 days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  ${data.recentActivity.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">from completed invoices</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
