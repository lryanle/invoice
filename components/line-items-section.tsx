"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, Package } from "lucide-react"

interface LineItem {
  name: string
  quantity: number
  cost: number
  total: number
}

interface LineItemsSectionProps {
  lineItems: LineItem[]
  onLineItemsChange: (lineItems: LineItem[]) => void
}

interface LineItemSuggestion {
  name: string
  count: number
}

export function LineItemsSection({ lineItems, onLineItemsChange }: LineItemsSectionProps) {
  const [suggestions, setSuggestions] = useState<LineItemSuggestion[]>([])

  useEffect(() => {
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const response = await fetch("/api/line-items/suggestions")
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
      }
    } catch (error) {
      console.error("Error fetching line item suggestions:", error)
    }
  }

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    }

    // Recalculate total when quantity or cost changes
    if (field === "quantity" || field === "cost") {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].cost
    }

    onLineItemsChange(updatedItems)
  }

  const addLineItem = () => {
    onLineItemsChange([...lineItems, { name: "", quantity: 1, cost: 0, total: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index)
      onLineItemsChange(updatedItems)
    }
  }

  const handleNameSelect = (index: number, value: string) => {
    if (value === "custom") {
      updateLineItem(index, "name", "")
    } else {
      updateLineItem(index, "name", value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Items & Services</Label>
      </div>

      {lineItems.map((item, index) => (
        <div key={index} className="space-y-3 p-4 border rounded-lg bg-muted/20">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Item {index + 1}</Label>
            {lineItems.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeLineItem(index)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor={`name-${index}`}>Item Name *</Label>
              <Select value={item.name || "custom"} onValueChange={(value) => handleNameSelect(index, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select or enter item name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <span className="text-muted-foreground">Enter custom name...</span>
                  </SelectItem>
                  {suggestions.map((suggestion) => (
                    <SelectItem key={suggestion.name} value={suggestion.name}>
                      <div className="flex items-center justify-between w-full">
                        <span>{suggestion.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({suggestion.count} times)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(item.name === "" || !suggestions.find((s) => s.name === item.name)) && (
                <Input
                  id={`name-${index}`}
                  value={item.name}
                  onChange={(e) => updateLineItem(index, "name", e.target.value)}
                  placeholder="Enter item name"
                  className="mt-2"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor={`quantity-${index}`}>Quantity *</Label>
              <Input
                id={`quantity-${index}`}
                type="number"
                min="1"
                step="1"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, "quantity", Number.parseInt(e.target.value) || 1)}
                placeholder="1"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`cost-${index}`}>Unit Cost ($) *</Label>
              <Input
                id={`cost-${index}`}
                type="number"
                min="0"
                step="0.01"
                value={item.cost}
                onChange={(e) => updateLineItem(index, "cost", Number.parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="text-right">
              <Label className="text-sm text-muted-foreground">Total</Label>
              <div className="text-lg font-semibold text-primary">${item.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      ))}

      <Button type="button" variant="outline" onClick={addLineItem} className="w-full bg-transparent">
        <Plus className="mr-2 h-4 w-4" />
        Add Line Item
      </Button>
    </div>
  )
}
