"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DollarSign, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type AmountFilterOperator =
  | "less_than"
  | "less_than_equal"
  | "greater_than"
  | "greater_than_equal"
  | "equal"
  | "not_equal";

export interface AmountFilterValue {
  operator: AmountFilterOperator;
  amount: number | null;
}

interface AmountFilterProps {
  readonly value: AmountFilterValue;
  readonly onChange: (value: AmountFilterValue) => void;
  readonly placeholder?: string;
  readonly className?: string;
}

const operatorLabels: Record<AmountFilterOperator, string> = {
  less_than: "<",
  less_than_equal: "≤",
  greater_than: ">",
  greater_than_equal: "≥",
  equal: "=",
  not_equal: "≠",
};

export function AmountFilter({
  value,
  onChange,
  placeholder = "Filter by amount",
  className,
}: AmountFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempAmount, setTempAmount] = useState(value.amount?.toString() || "");
  const [tempOperator, setTempOperator] = useState(value.operator);

  // Sync temp values with current value when popover opens
  useEffect(() => {
    if (isOpen) {
      setTempAmount(value.amount?.toString() || "");
      setTempOperator(value.operator);
    }
  }, [isOpen, value.amount, value.operator]);

  const handleOperatorChange = (operator: AmountFilterOperator) => {
    setTempOperator(operator);
  };

  const handleAmountChange = (amount: string) => {
    setTempAmount(amount);
  };

  const clearFilter = () => {
    onChange({
      operator: "equal",
      amount: null,
    });
    setTempAmount("");
    setIsOpen(false);
  };

  const applyFilter = () => {
    const numAmount = parseFloat(tempAmount);
    onChange({
      operator: tempOperator,
      amount: !isNaN(numAmount) ? numAmount : null,
    });
    setIsOpen(false);
  };

  const cancelFilter = () => {
    setTempAmount(value.amount?.toString() || "");
    setTempOperator(value.operator);
    setIsOpen(false);
  };

  const getDisplayText = () => {
    if (value.amount !== null && value.amount !== undefined) {
      const formattedAmount = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(value.amount);
      return `${operatorLabels[value.operator]} ${formattedAmount}`;
    }
    return placeholder;
  };

  const hasValue = value.amount !== null && value.amount !== undefined;

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
              <DollarSign className="mr-2 h-4 w-4" />
              {getDisplayText()}
            </Button>
          </PopoverTrigger>
          {hasValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                clearFilter();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <PopoverContent className="w-80 p-4 space-y-4 " align="start">
          <Label>Amount</Label>
          <div className="grid grid-cols-5 gap-4 items-center">
            <div className="col-span-1 w-full">
              <Select
                value={tempOperator}
                onValueChange={handleOperatorChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(operatorLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="relative col-span-4 w-full">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                placeholder="0.00"
                value={tempAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-10"
                step="0.01"
                min="0"
              />
            </div>

                         <div className="flex justify-end space-x-2 col-span-full">
               <Button variant="outline" onClick={cancelFilter}>
                 Cancel
               </Button>
               <Button onClick={applyFilter}>Apply Filter</Button>
             </div>
          </div>
        </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
