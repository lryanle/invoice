"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Package, X } from "lucide-react"
import { CreatableCombobox } from "./ui/combobox-createable"

interface LineItem {
  name: string
  description: string
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
  recentCost?: number
  lastUsed?: string
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

  const fetchRecentCost = async (itemName: string) => {
    try {
      const response = await fetch(`/api/line-items/recent-cost?itemName=${encodeURIComponent(itemName)}`)
      if (response.ok) {
        const data = await response.json()
        return data.recentCost || 0
      }
    } catch (error) {
      console.error("Error fetching recent cost:", error)
    }
    return 0
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
    onLineItemsChange([...lineItems, { name: "", description: "", quantity: 1.0, cost: 0, total: 0 }])
  }

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index)
      onLineItemsChange(updatedItems)
    }
  }

  const handleItemSelect = async (itemName: string, itemIndex: number) => {
    // Fetch the recent cost first
    const recentCost = await fetchRecentCost(itemName)
    
    // Update both name and cost in a single operation
    const updatedItems = [...lineItems]
    updatedItems[itemIndex] = {
      ...updatedItems[itemIndex],
      name: itemName,
      cost: recentCost > 0 ? recentCost : updatedItems[itemIndex].cost,
      total: updatedItems[itemIndex].quantity * (recentCost > 0 ? recentCost : updatedItems[itemIndex].cost)
    }
    
    onLineItemsChange(updatedItems)
  }

  const handleCreateItem = async (itemName: string, itemIndex: number) => {
    try {
      // Add the new item to suggestions locally for immediate UI update
      const newSuggestion = { name: itemName, count: 1, isNew: true }
      setSuggestions(prev => {
        const existing = prev.find(s => s.name === itemName)
        if (existing) {
          return prev.map(s => s.name === itemName ? { ...s, count: s.count + 1 } : s)
        }
        return [...prev, newSuggestion]
      })
      
      // Auto-select the newly created item
      updateLineItem(itemIndex, "name", itemName)
      
    } catch (error) {
      console.error("Error creating new item:", error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Package className="h-4 w-4 text-primary" />
        <Label className="text-sm font-medium">Items & Services</Label>
      </div>

      {lineItems.map((item, index) => (
        <div key={`Item ${index + 1}`} className="border-2 rounded-lg bg-card transition-all hover:drop-shadow">
          <div className="flex justify-between items-center w-full bg-border rounded-t-md py-3 px-6">
            <h2 className="text-lg font-medium leading-none tracking-wide">Item {index + 1}{item.name ? `:   ${item.name}` : ""}</h2>
            {lineItems.length > 1 && (
              <Button
                variant={null}
                size="icon"
                onClick={() => removeLineItem(index)}
                className="text-muted-foreground hover:text-destructive h-4 w-4"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {/* Item Name */}
              <div className="space-y-2">
                <Label htmlFor={`name-${index}`}>Item Name <span className="text-red-500">*</span></Label>
                <CreatableCombobox
                  options={suggestions.map((suggestion) => ({
                    value: suggestion.name,
                    label: suggestion.name,
                    count: suggestion.count,
                    recentCost: suggestion.recentCost,
                    isNew: suggestion.count === 1 && !suggestion.recentCost
                  }))}
                  value={item.name || null}
                  onChange={(option) => {
                    if (option) {
                      handleItemSelect(option.value, index)
                    } else {
                      updateLineItem(index, "name", "")
                    }
                  }}
                  onCreate={(itemName) => handleCreateItem(itemName, index)}
                  placeholder="Select or create item name"
                  emptyMessage="No items found"
                  allowClear={false}
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={item.description}
                  onChange={(e) => updateLineItem(index, "description", e.target.value)}
                  placeholder="Enter item description (optional)"
                  rows={2}
                  className="resize-none"
                />
              </div>

              {/* Quantity, Cost, and Total with improved spacing */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`quantity-${index}`}>Quantity <span className="text-red-500">*</span></Label>
                  <Input
                    id={`quantity-${index}`}
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, "quantity", Number.parseFloat(e.target.value) || 0)}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`cost-${index}`}>Unit Cost ($) <span className="text-red-500">*</span></Label>
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

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground leading-none">Total</Label>
                  <div className="h-10 flex items-center justify-end px-3 bg-muted rounded-md">
                    <span className="text-lg font-semibold text-primary select-all">${item.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
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
