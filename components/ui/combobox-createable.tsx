"use client"

import { useId, useMemo, useRef, useState } from 'react';
import * as React from 'react';

import { Check, ChevronsUpDown, CirclePlus, Loader2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
  count?: number;
  recentCost?: number;
  isNew?: boolean;
};

export interface CreatableComboboxProps {
  options: ComboboxOption[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (option: ComboboxOption | null) => void;
  onCreate?: (label: string) => void | Promise<void>;
  placeholder?: string;
  emptyMessage?: string;
  createLabel?: (query: string) => string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
  allowClear?: boolean;
  isLoading?: boolean;
  error?: string;
  name?: string;
  id?: string;
}

function CreateRow({
  query,
  onCreate,
  disabled,
}: {
  query: string;
  onCreate: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onCreate()}
      className={cn(
        'flex w-full text-left text-sm px-2 gap-2 py-1.5 rounded-sm items-center focus:outline-none',
        disabled
          ? 'text-muted-foreground opacity-60'
          : 'text-primary hover:bg-accent focus:!bg-accent'
      )}
    >
      <CirclePlus className="h-4 w-4 mr-2" />
      Add "{query}"
    </button>
  );
}

export const CreatableCombobox = React.forwardRef<HTMLButtonElement, CreatableComboboxProps>(
  function CreatableCombobox(
    {
      options,
      value,
      defaultValue = null,
      onChange,
      onCreate,
      placeholder = 'Select',
      emptyMessage = 'No items',
      createLabel = (q) => q,
      disabled = false,
      className,
      contentClassName,
      allowClear = true,
      isLoading = false,
      error,
      name,
      id,
    }: CreatableComboboxProps,
    ref
  ) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const isControlled = value !== undefined;
    const internalValueRef = useRef<string | null>(defaultValue ?? null);
    const selectedValue = isControlled ? value ?? null : internalValueRef.current;
    const autoId = useId();
    const triggerId = id ?? autoId;

    const selectedOption = useMemo(
      () => options.find((opt) => opt.value === selectedValue) ?? null,
      [options, selectedValue]
    );

    const canCreate = useMemo(() => {
      if (!onCreate) return false;
      if (!query.trim()) return false;
      return !options.some((o) => o.label === query);
    }, [query, options, onCreate]);

    function commitChange(next: ComboboxOption | null) {
      if (!isControlled) {
        internalValueRef.current = next?.value ?? null;
      }
      onChange?.(next);
      setOpen(false);
      setQuery('');
    }

    async function handleCreate() {
      if (!onCreate || !query.trim()) return;
      await Promise.resolve(onCreate(query.trim()));
      setOpen(false);
      setQuery('');
    }

    function handleSelect(option: ComboboxOption) {
      if (option.disabled) return;
      commitChange(option);
    }

    function handleClear(e: React.MouseEvent) {
      e.stopPropagation();
      commitChange(null);
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={triggerId}
            type="button"
            variant="outline"
            aria-expanded={open}
            data-state={open ? 'open' : 'closed'}
            disabled={disabled}
            className={cn('w-full justify-between font-normal', error && 'border-destructive', className)}
          >
            {selectedOption ? (
              <span className="truncate mr-auto">{selectedOption.label}</span>
            ) : (
              <span className="truncate mr-auto text-muted-foreground">{placeholder}</span>
            )}
            <span className="flex items-center gap-1">
              {allowClear && !!selectedOption && !disabled && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={handleClear}
                  aria-hidden
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </span>
            {name && (
              <input type="hidden" name={name} value={selectedOption?.value ?? ''} />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('w-[var(--radix-popover-trigger-width)] p-0', contentClassName)}>
          <Command
            filter={(value, search) => {
              const v = value.toLocaleLowerCase();
              const s = search.toLocaleLowerCase();
              return v.includes(s) ? 1 : 0;
            }}
          >
            <CommandInput
              placeholder="Search or create new"
              value={query}
              onValueChange={(value: string) => setQuery(value)}
              onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                }
              }}
            />
            <CommandEmpty className="p-1 text-sm">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : query && onCreate ? (
                <CreateRow query={query} onCreate={handleCreate} />
              ) : (
                emptyMessage
              )}
            </CommandEmpty>

            <CommandList>
              <CommandGroup className="overflow-y-auto">
                {!isLoading && canCreate && (
                  <CreateRow query={createLabel(query)} onCreate={handleCreate} />
                )}

                {options.map((option) => {
                  const isSelected = selectedValue === option.value;
                  return (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      data-disabled={option.disabled ? true : undefined}
                      onSelect={() => handleSelect(option)}
                      className={cn(option.disabled && 'opacity-50 pointer-events-none')}
                    >
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-2 items-center w-full">
                        <Check className={cn('h-4 w-4', isSelected ? 'opacity-100' : 'opacity-0')} />
                        <span className="truncate">{option.label}</span>
                        <div className="w-full">
                          {option.isNew ? (
                            <Badge variant="secondary" className="text-xs text-center w-full">new</Badge>
                          ) : option.count !== undefined ? (
                            <Badge variant="outline" className="text-xs text-center w-full">
                              {option.count}x
                            </Badge>
                          ) : null}
                        </div>
                        <div className="w-full">
                          {option.recentCost !== undefined && option.recentCost > 0 && !option.isNew ? (
                            <Badge variant="secondary" className="text-xs text-center w-full">
                              ${option.recentCost.toFixed(2)}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  }
);

export type { ComboboxOption as CreatableComboboxOption };
