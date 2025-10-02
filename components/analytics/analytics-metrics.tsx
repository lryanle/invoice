"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, CheckCircle, Clock, Target } from "lucide-react"

interface BasicStats {
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

interface AnalyticsMetricsProps {
  readonly stats: BasicStats
  readonly className?: string
}

export function AnalyticsMetrics({ stats, className }: AnalyticsMetricsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "text-green-600" : "text-red-600"
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Total Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getGrowthIcon(stats.revenueGrowth)}
            <span className={getGrowthColor(stats.revenueGrowth)}>
              {formatPercentage(stats.revenueGrowth)}
            </span>
            <span>vs last period</span>
          </div>
          <div className="text-xs text-green-600 mt-1">From completed invoices only</div>
        </CardContent>
      </Card>

      {/* Total Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Invoices</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Badge variant="default" className="text-xs">
              {stats.completedInvoices} completed
            </Badge>
            <Badge variant="outline" className="text-xs">
              {stats.draftInvoices} drafts
            </Badge>
          </div>
          <div className="text-xs text-green-600 mt-1">Submitted invoices only</div>
        </CardContent>
      </Card>

      {/* Average Invoice */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Invoice</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats.averageInvoice)}</div>
          <div className="text-xs text-muted-foreground">
            Range: {formatCurrency(stats.minInvoice)} - {formatCurrency(stats.maxInvoice)}
          </div>
          <div className="text-xs text-green-600 mt-1">Completed invoices only</div>
        </CardContent>
      </Card>

      {/* Total Clients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClients}</div>
          <div className="text-xs text-muted-foreground">
            Active client relationships
          </div>
        </CardContent>
      </Card>

      {/* Completion Rate */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">
            {stats.completedInvoices} of {stats.totalInvoices} invoices completed
          </div>
        </CardContent>
      </Card>

      {/* Completed Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed Revenue</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats.completedRevenue)}
          </div>
          <div className="text-xs text-muted-foreground">
            Avg: {formatCurrency(stats.avgCompletedInvoice)} per invoice
          </div>
        </CardContent>
      </Card>

      {/* Draft Revenue */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Draft Revenue</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(stats.draftRevenue)}
          </div>
          <div className="text-xs text-muted-foreground">
            Avg: {formatCurrency(stats.avgDraftInvoice)} per invoice
          </div>
        </CardContent>
      </Card>

      {/* Draft vs Completed Breakdown */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Invoice Status</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Completed</span>
              <span className="font-medium">
                {stats.completedInvoices} invoices
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-600">Drafts</span>
              <span className="font-medium">
                {stats.draftInvoices} invoices
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ 
                  width: `${stats.completedInvoices + stats.draftInvoices > 0 ? (stats.completedInvoices / (stats.completedInvoices + stats.draftInvoices)) * 100 : 0}%` 
                }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Only completed invoices are included in revenue calculations
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
