"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export type DateFilterType = "range" | "before" | "on" | "after"

export interface DateRangeFilterValue {
  type: DateFilterType
  startDate?: Date
  endDate?: Date
  singleDate?: Date
}

interface DateRangeFilterProps {
  readonly value: DateRangeFilterValue
  readonly onChange: (value: DateRangeFilterValue) => void
  readonly placeholder?: string
  readonly className?: string
}

export function DateRangeFilter({
  value,
  onChange,
  placeholder = "Select date range",
  className,
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleTypeChange = (type: DateFilterType) => {
    onChange({
      type,
      startDate: undefined,
      endDate: undefined,
      singleDate: undefined,
    })
  }

  const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from) {
      onChange({
        ...value,
        startDate: range.from,
        endDate: range.to,
      })
    }
  }

  const handleSingleDateSelect = (date: Date | undefined) => {
    onChange({
      ...value,
      singleDate: date,
    })
  }

  const clearFilter = () => {
    onChange({
      type: "range",
      startDate: undefined,
      endDate: undefined,
      singleDate: undefined,
    })
  }

  const getDisplayText = () => {
    if (value.type === "range") {
      if (value.startDate && value.endDate) {
        return `${format(value.startDate, "MMM dd, yyyy")} - ${format(value.endDate, "MMM dd, yyyy")}`
      } else if (value.startDate) {
        return `From ${format(value.startDate, "MMM dd, yyyy")}`
      }
    } else if (value.type === "before" && value.singleDate) {
      return `Before ${format(value.singleDate, "MMM dd, yyyy")}`
    } else if (value.type === "on" && value.singleDate) {
      return `On ${format(value.singleDate, "MMM dd, yyyy")}`
    } else if (value.type === "after" && value.singleDate) {
      return `After ${format(value.singleDate, "MMM dd, yyyy")}`
    }
    return placeholder
  }

  const hasValue = 
    (value.type === "range" && (value.startDate || value.endDate)) ||
    (value.type !== "range" && value.singleDate)

  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal pr-8",
                !hasValue && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          {hasValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                clearFilter()
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <PopoverContent className="w-auto p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label>Filter Type</Label>
              <Select value={value.type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="range">Date Range</SelectItem>
                  <SelectItem value="before">Before Date</SelectItem>
                  <SelectItem value="on">On Date</SelectItem>
                  <SelectItem value="after">After Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value.type === "range" && (
              <div className="space-y-2">
                <Label>Select Date Range</Label>
                <Calendar
                  mode="range"
                  selected={{
                    from: value.startDate,
                    to: value.endDate,
                  }}
                  onSelect={handleRangeSelect}
                  numberOfMonths={2}
                />
              </div>
            )}

            {value.type !== "range" && (
              <div className="space-y-2">
                <Label>
                  {value.type === "before" && "Select Date (Before)"}
                  {value.type === "on" && "Select Date (On)"}
                  {value.type === "after" && "Select Date (After)"}
                </Label>
                <Calendar
                  mode="single"
                  selected={value.singleDate}
                  onSelect={handleSingleDateSelect}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Apply Filter
              </Button>
            </div>
          </div>
        </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
