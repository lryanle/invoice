"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  ComposedChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon,
  AreaChart as AreaChartIcon,
  ScatterChart as ScatterChartIcon,
  TrendingUp,
  Calendar
} from "lucide-react"

interface ChartData {
  [key: string]: any
}

interface EnhancedChartProps {
  readonly data: ChartData[]
  readonly title: string
  readonly description?: string
  readonly className?: string
  readonly chartType?: "line" | "bar" | "pie" | "area" | "scatter" | "composed"
  readonly dataKeys?: string[]
  readonly xAxisKey?: string
  readonly height?: number
  readonly showControls?: boolean
  readonly showTimeRange?: boolean
  readonly onTimeRangeChange?: (range: string) => void
  readonly allowedChartTypes?: string[]
}

const CHART_TYPES = [
  { value: "line", label: "Line Chart", icon: LineChartIcon },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "area", label: "Area Chart", icon: AreaChartIcon },
  { value: "pie", label: "Pie Chart", icon: PieChartIcon },
  { value: "scatter", label: "Scatter Plot", icon: ScatterChartIcon },
  { value: "composed", label: "Composed Chart", icon: TrendingUp },
]

const TIME_RANGES = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "6m", label: "Last 6 months" },
  { value: "1y", label: "Last year" },
  { value: "all", label: "All time" },
]

const COLORS = [
  "#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", 
  "#06b6d4", "#f97316", "#84cc16", "#ec4899", "#6366f1"
]

export function EnhancedChart({
  data,
  title,
  description,
  className,
  chartType: initialChartType = "line",
  dataKeys = ["value"],
  xAxisKey = "name",
  height = 300,
  showControls = true,
  showTimeRange = false,
  onTimeRangeChange,
  allowedChartTypes,
}: EnhancedChartProps) {
  const [chartType, setChartType] = useState(initialChartType)
  const [selectedDataKeys, setSelectedDataKeys] = useState(dataKeys)
  const [timeRange, setTimeRange] = useState("all")

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value)
    onTimeRangeChange?.(value)
  }

  const handleDataKeyToggle = (key: string) => {
    setSelectedDataKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const renderChart = () => {
    const commonProps = {
      data,
      width: "100%",
      height: height,
    }

    switch (chartType) {
      case "line":
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedDataKeys.map((key, index) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        )

      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey={xAxisKey} 
              angle={-45} 
              textAnchor="end" 
              height={80}
              interval={0}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedDataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={COLORS[index % COLORS.length]}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )

      case "area":
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedDataKeys.map((key, index) => (
              <Area
                key={key}
                type="monotone"
                dataKey={key}
                stackId="1"
                stroke={COLORS[index % COLORS.length]}
                fill={COLORS[index % COLORS.length]}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        )

      case "pie":
        return (
          <PieChart width={400} height={height}>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey={selectedDataKeys[0] || "value"}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        )

      case "scatter":
        return (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Scatter
              dataKey={selectedDataKeys[0] || "value"}
              fill={COLORS[0]}
            />
          </ScatterChart>
        )

      case "composed":
        return (
          <ComposedChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xAxisKey} />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            {selectedDataKeys.map((key, index) => {
              if (index === 0) {
                return (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    radius={[4, 4, 0, 0]}
                  />
                )
              } else {
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                )
              }
            })}
          </ComposedChart>
        )

      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          {showTimeRange && (
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {showControls && (
          <div className="mb-6 space-y-4">
            <Tabs value={chartType} onValueChange={(value) => setChartType(value as any)}>
              <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                {CHART_TYPES
                  .filter(type => !allowedChartTypes || allowedChartTypes.includes(type.value))
                  .map((type) => {
                    const Icon = type.icon
                    return (
                      <TabsTrigger key={type.value} value={type.value} className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{type.label}</span>
                      </TabsTrigger>
                    )
                  })}
              </TabsList>
            </Tabs>

            {dataKeys.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-muted-foreground">Data Series:</span>
            {dataKeys.map((key, index) => (
              <Button
                key={`${key}-${index}`}
                variant={selectedDataKeys.includes(key) ? "default" : "outline"}
                size="sm"
                onClick={() => handleDataKeyToggle(key)}
                className="text-xs"
              >
                {key}
              </Button>
            ))}
              </div>
            )}
          </div>
        )}

        <ChartContainer
          config={selectedDataKeys.reduce((config, key, index) => {
            config[key] = { 
              label: key, 
              color: `hsl(${210 + index * 30}, 70%, 50%)` 
            }
            return config
          }, {} as Record<string, { label: string; color: string }>)}
          className="w-full"
        >
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
