"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EnhancedChart } from "@/components/enhanced-chart"
import { DateRangeFilterCard } from "@/components/date-range-filter-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, DollarSign, TrendingUp, FileText } from "lucide-react"

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
    completedInvoices: number
    draftInvoices: number
    completionRate: number
    completedRevenue: number
    draftRevenue: number
  }
  lineItemBreakdown?: Array<{
    _id: string
    count: number
    totalRevenue: number
    averagePrice: number
    totalQuantity: number
  }>
  monthlyRevenue?: Array<{
    month: string
    revenue: number
    invoiceCount: number
    completedRevenue: number
    draftRevenue: number
  }>
  weeklyRevenue?: Array<{
    week: string
    revenue: number
    invoiceCount: number
  }>
  recentActivity?: Array<{
    _id: string
    invoiceCount: number
    revenue: number
    completedCount: number
    draftCount: number
  }>
  clientsAnalytics?: Array<{
    _id: string
    clientName: string
    totalInvoices: number
    totalRevenue: number
    averageInvoice: number
    lastInvoiceDate: string
    completedInvoices: number
    completedRevenue: number
    draftInvoices: number
    draftRevenue: number
    completionRate: number
  }>
}

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

export function ClientAnalytics({ clientId }: Readonly<ClientAnalyticsProps>) {
  const [data, setData] = useState<ClientAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        params.append("clientId", clientId)
        if (dateRange.from) params.append("startDate", dateRange.from.toISOString())
        if (dateRange.to) params.append("endDate", dateRange.to.toISOString())

        const response = await fetch(`/api/analytics/clients?${params.toString()}`)
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
  }, [clientId, dateRange])

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>
  }

  if (!data) {
    return <div className="text-center py-8">No analytics data available</div>
  }

  // Show overview of all clients
  if (clientId === "all" && data.clientsAnalytics) {
    return (
      <div className="space-y-6">
        {/* Date Range Filter */}
        <DateRangeFilterCard onDateRangeChange={setDateRange} />

        {/* All Clients Overview */}
        <Card>
          <CardHeader>
            <CardTitle>All Clients Overview</CardTitle>
            <CardDescription>Performance comparison across all clients</CardDescription>
          </CardHeader>
          <CardContent>
            <EnhancedChart
              data={data.clientsAnalytics.slice(0, 10)}
              title="Client Revenue Comparison"
              description="Revenue from completed invoices by client"
              chartType="bar"
              dataKeys={["totalRevenue"]}
              xAxisKey="clientName"
              height={400}
              showControls={true}
            />
          </CardContent>
        </Card>

        {/* Client Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Performance Details</CardTitle>
            <CardDescription>Comprehensive metrics for each client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.clientsAnalytics.map((client) => (
                <div key={client._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{client.clientName}</div>
                    <div className="text-sm text-muted-foreground">
                      {client.totalInvoices} invoices • Last: {new Date(client.lastInvoiceDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
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
                    <div className="text-right">
                      <div className="font-medium text-green-600">${client.completedRevenue.toLocaleString()}</div>
                      <div className="text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-orange-600">${client.draftRevenue.toLocaleString()}</div>
                      <div className="text-muted-foreground">Drafts</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Client Performance Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedChart
            data={data.clientsAnalytics.slice(0, 8)}
            title="Client Invoice Count"
            description="Number of completed invoices by client"
            chartType="bar"
            dataKeys={["totalInvoices"]}
            xAxisKey="clientName"
            height={300}
            showControls={true}
          />

          <EnhancedChart
            data={data.clientsAnalytics.slice(0, 8)}
            title="Client Completion Rates"
            description="Invoice completion percentage by client"
            chartType="bar"
            dataKeys={["completionRate"]}
            xAxisKey="clientName"
            height={300}
            showControls={true}
          />
        </div>
      </div>
    )
  }

  // Show specific client analytics
  if (clientId && clientId !== "all" && data.client && data.stats) {
    return (
      <div className="space-y-6">
        {/* Date Range Filter */}
        <DateRangeFilterCard onDateRangeChange={setDateRange} />

        {/* Client Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{data.client.name} Analytics</span>
              <Badge variant="outline">Individual Client</Badge>
            </CardTitle>
            <CardDescription>Detailed performance metrics for this client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold">{data.stats.totalInvoices}</div>
                <div className="text-sm text-muted-foreground">Total Invoices</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold">${data.stats.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold">${data.stats.averageInvoice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Average Invoice</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold">{data.stats.completionRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-600">${data.stats.completedRevenue.toLocaleString()}</div>
                <div className="text-sm text-green-600">Completed Revenue</div>
                <div className="text-xs text-muted-foreground">{data.stats.completedInvoices} invoices</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-lg font-semibold text-orange-600">${data.stats.draftRevenue.toLocaleString()}</div>
                <div className="text-sm text-orange-600">Draft Revenue</div>
                <div className="text-xs text-muted-foreground">{data.stats.draftInvoices} invoices</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-600">
                  {data.stats.completedInvoices > 0 ? (data.stats.completedRevenue / data.stats.completedInvoices).toFixed(0) : 0}
                </div>
                <div className="text-sm text-blue-600">Avg Completed Invoice</div>
                <div className="text-xs text-muted-foreground">Completed only</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Tabs */}
        <Tabs defaultValue="revenue" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-6">
            {/* Monthly Revenue */}
            {data.monthlyRevenue && data.monthlyRevenue.length > 0 && (
              <EnhancedChart
                data={data.monthlyRevenue}
                title="Monthly Revenue Timeline"
                description={`Revenue trends for ${data.client.name} (completed invoices only)`}
                chartType="line"
                dataKeys={["revenue", "invoiceCount"]}
                xAxisKey="month"
                height={400}
                showControls={true}
              />
            )}

            {/* Weekly Revenue */}
            {data.weeklyRevenue && data.weeklyRevenue.length > 0 && (
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
            )}

            {/* Line Item Breakdown */}
            {data.lineItemBreakdown && data.lineItemBreakdown.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedChart
                  data={data.lineItemBreakdown}
                  title="Revenue by Line Item"
                  description="Revenue distribution by service/product type (completed invoices only)"
                  chartType="pie"
                  dataKeys={["totalRevenue"]}
                  xAxisKey="_id"
                  height={300}
                  showControls={true}
                />

                <EnhancedChart
                  data={data.lineItemBreakdown.slice(0, 8)}
                  title="Line Item Performance"
                  description="Usage and revenue analysis (completed invoices only)"
                  chartType="composed"
                  dataKeys={["totalRevenue", "count", "averagePrice"]}
                  xAxisKey="_id"
                  height={300}
                  showControls={true}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Completion Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Completion Rate</span>
                      <span className="font-semibold">{data.stats.completionRate.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${data.stats.completionRate}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-green-600 font-medium">{data.stats.completedInvoices}</div>
                        <div className="text-muted-foreground">Completed</div>
                      </div>
                      <div>
                        <div className="text-orange-600 font-medium">{data.stats.draftInvoices}</div>
                        <div className="text-muted-foreground">Drafts</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                    Revenue Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Completed Revenue</span>
                      <span className="font-semibold text-green-600">
                        {((data.stats.completedRevenue / data.stats.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draft Revenue</span>
                      <span className="font-semibold text-orange-600">
                        {((data.stats.draftRevenue / data.stats.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(data.stats.completedRevenue / data.stats.totalRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            {/* Recent Activity */}
            {data.recentActivity && data.recentActivity.length > 0 && (
              <EnhancedChart
                data={data.recentActivity}
                title="Recent Activity (Last 30 Days)"
                description={`Daily completed invoice activity for ${data.client.name}`}
                chartType="line"
                dataKeys={["invoiceCount", "revenue"]}
                xAxisKey="_id"
                height={400}
                showControls={true}
              />
            )}

            {/* Activity Summary */}
            {data.recentActivity && data.recentActivity.length > 0 && (
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
                    <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      ${data.recentActivity.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">from completed invoices</div>
                  </CardContent>
                </Card>

              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return <div className="text-center py-8">No data available for the selected client</div>
}
