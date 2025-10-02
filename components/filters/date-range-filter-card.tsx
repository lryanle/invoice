"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface DateRange {
  from: Date | undefined
  to: Date | undefined
}

interface DateRangeFilterCardProps {
  readonly onDateRangeChange: (dateRange: DateRange) => void
  readonly className?: string
}

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "Last 6 months", days: 180 },
  { label: "Last year", days: 365 },
  { label: "All time", days: null },
]

export function DateRangeFilterCard({ onDateRangeChange, className }: DateRangeFilterCardProps) {
  const [dateRange, setDateRange] = useState<DateRange>({ from: undefined, to: undefined })
  const [isOpen, setIsOpen] = useState(false)

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange)
    onDateRangeChange(newDateRange)
    setIsOpen(false)
  }

  const handlePresetClick = (days: number | null) => {
    if (days === null) {
      // All time
      handleDateRangeChange({ from: undefined, to: undefined })
    } else {
      const to = new Date()
      const from = new Date()
      from.setDate(from.getDate() - days)
      handleDateRangeChange({ from, to })
    }
  }

  const clearDateRange = () => {
    handleDateRangeChange({ from: undefined, to: undefined })
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Date Range Filter</CardTitle>
        <CardDescription>
          Filter analytics data by date range
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESET_RANGES.map((preset) => (
            <Button
              key={preset.label}
              variant="outline"
              size="sm"
              onClick={() => handlePresetClick(preset.days)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {(() => {
                  if (!dateRange.from) return <span>Pick a date range</span>
                  if (!dateRange.to) return format(dateRange.from, "LLL dd, y")
                  return (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  )
                })()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange.from}
                selected={dateRange}
                onSelect={(range) => {
                  if (range) {
                    handleDateRangeChange({
                      from: range.from,
                      to: range.to,
                    })
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {(dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearDateRange}
              className="text-xs"
            >
              Clear
            </Button>
          )}
        </div>

        {dateRange.from && dateRange.to && (
          <div className="text-xs text-muted-foreground">
            Showing data from {format(dateRange.from, "MMM dd, yyyy")} to{" "}
            {format(dateRange.to, "MMM dd, yyyy")}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
