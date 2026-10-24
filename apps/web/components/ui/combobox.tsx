"use client"

import * as React from "react"
import { LuCheck, LuChevronsUpDown, LuX } from "react-icons/lu"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export type ComboboxOption = {
    value: string
    label: string
    icon?: React.ComponentType<{ className?: string }>
}

interface ComboboxProps {
    options: ComboboxOption[]
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
    placeholder?: string
    searchPlaceholder?: string
    emptyMessage?: string
    multiple?: boolean
    className?: string
    disabled?: boolean
}

export function Combobox({
    options,
    value,
    onValueChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    emptyMessage = "No option found.",
    multiple = false,
    className,
    disabled = false,
}: ComboboxProps) {
    const [open, setOpen] = React.useState(false)

    // Helper to handle selection
    const handleSelect = React.useCallback(
        (currentValue: string) => {
            if (multiple) {
                const currentValues = Array.isArray(value) ? value : []
                const newValues = currentValues.includes(currentValue)
                    ? currentValues.filter((v) => v !== currentValue)
                    : [...currentValues, currentValue]
                onValueChange?.(newValues)
            } else {
                onValueChange?.(currentValue === value ? "" : currentValue)
                setOpen(false)
            }
        },
        [multiple, value, onValueChange]
    )

    // Derived state for display
    const selectedOptions = React.useMemo(() => {
        if (multiple) {
            const currentValues = Array.isArray(value) ? value : []
            return currentValues
                .map((v) => options.find((opt) => opt.value === v))
                .filter(Boolean) as ComboboxOption[]
        } else {
            const option = options.find((opt) => opt.value === value)
            return option ? [option] : []
        }
    }, [multiple, value, options])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-auto min-h-10", className)}
                    disabled={disabled}
                >
                    <div className="flex gap-1 flex-wrap items-center text-left">
                        {selectedOptions.length > 0 ? (
                            multiple ? (
                                selectedOptions.length > 3 ? (
                                    <Badge variant="secondary" className="rounded-sm px-1 font-normal">
                                        {selectedOptions.length} selected
                                    </Badge>
                                ) : (
                                    selectedOptions.map((opt) => {
                                        const Icon = opt.icon
                                        return (
                                            <Badge
                                                variant="secondary"
                                                key={opt.value}
                                                className="rounded-sm px-1 font-normal items-center gap-1"
                                                onClick={(e: React.MouseEvent) => {
                                                    e.stopPropagation()
                                                    handleSelect(opt.value)
                                                }}
                                            >
                                                {Icon && <Icon className="h-3 w-3" />}
                                                {opt.label}
                                                <LuX className="h-3 w-3 text-muted-foreground hover:text-foreground ml-0.5" />
                                            </Badge>
                                        )
                                    })
                                )
                            ) : (
                                <div className="flex items-center gap-2">
                                    {(() => {
                                        const Icon = selectedOptions[0].icon
                                        return Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null
                                    })()}
                                    <span>{selectedOptions[0].label}</span>
                                </div>
                            )
                        ) : (
                            <span className="text-muted-foreground">{placeholder}</span>
                        )}
                    </div>
                    <LuChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full min-w-[200px] p-0">
                <Command>
                    <CommandInput placeholder={searchPlaceholder} />
                    <CommandList>
                        <CommandEmpty>{emptyMessage}</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => handleSelect(option.value)}
                                >
                                    <LuCheck
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            multiple
                                                ? (Array.isArray(value) && value.includes(option.value)
                                                    ? "opacity-100"
                                                    : "opacity-0")
                                                : value === option.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                        )}
                                    />
                                    {option.icon && <option.icon className="mr-2 h-4 w-4 text-muted-foreground" />}
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
