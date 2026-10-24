"use client"

import * as React from "react"
import { LuSearch } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface CommandContextValue {
    search: string
    setSearch: (search: string) => void
    selectedIndex: number
    setSelectedIndex: (index: number) => void
    items: string[]
    registerItem: (value: string) => void
    unregisterItem: (value: string) => void
}

const CommandContext = React.createContext<CommandContextValue | null>(null)

function useCommandContext() {
    const context = React.useContext(CommandContext)
    if (!context) {
        throw new Error("Command components must be used within Command")
    }
    return context
}

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

const Command = React.forwardRef<HTMLDivElement, CommandProps>(
    ({ className, children, ...props }, ref) => {
        const [search, setSearch] = React.useState("")
        const [selectedIndex, setSelectedIndex] = React.useState(0)
        const [items, setItems] = React.useState<string[]>([])

        const registerItem = React.useCallback((value: string) => {
            setItems((prev) => [...prev, value])
        }, [])

        const unregisterItem = React.useCallback((value: string) => {
            setItems((prev) => prev.filter((item) => item !== value))
        }, [])

        // Handle keyboard navigation
        const handleKeyDown = (e: React.KeyboardEvent) => {
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault()
                    setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
                    break
                case "ArrowUp":
                    e.preventDefault()
                    setSelectedIndex((prev) => Math.max(prev - 1, 0))
                    break
                case "Enter":
                    e.preventDefault()
                    const selectedItem = document.querySelector('[data-selected="true"]') as HTMLElement
                    selectedItem?.click()
                    break
            }
        }

        return (
            <CommandContext.Provider
                value={{
                    search,
                    setSearch,
                    selectedIndex,
                    setSelectedIndex,
                    items,
                    registerItem,
                    unregisterItem,
                }}
            >
                <div
                    ref={ref}
                    className={cn(
                        "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
                        className
                    )}
                    onKeyDown={handleKeyDown}
                    {...props}
                >
                    {children}
                </div>
            </CommandContext.Provider>
        )
    }
)
Command.displayName = "Command"

interface CommandDialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const CommandInput = React.forwardRef<HTMLInputElement, CommandInputProps>(
    ({ className, ...props }, ref) => {
        const { search, setSearch, setSelectedIndex } = useCommandContext()

        return (
            <div className="flex items-center border-b px-3">
                <LuSearch className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                    ref={ref}
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setSelectedIndex(0)
                    }}
                    className={cn(
                        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    {...props}
                />
            </div>
        )
    }
)
CommandInput.displayName = "CommandInput"

interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> { }

const CommandList = React.forwardRef<HTMLDivElement, CommandListProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    )
)
CommandList.displayName = "CommandList"

interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> { }

const CommandEmpty = React.forwardRef<HTMLDivElement, CommandEmptyProps>(
    ({ className, children, ...props }, ref) => {
        const { search, items } = useCommandContext()

        // Count how many items would be visible with the current search
        const visibleCount = search
            ? items.filter(item => item.toLowerCase().includes(search.toLowerCase())).length
            : items.length

        // Only show empty message when user has typed something but no results match
        if (!search || visibleCount > 0) {
            return null
        }

        return (
            <div
                ref={ref}
                className={cn("py-6 text-center text-sm", className)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
CommandEmpty.displayName = "CommandEmpty"

interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: string
}

const CommandGroup = React.forwardRef<HTMLDivElement, CommandGroupProps>(
    ({ className, heading, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden p-1 text-foreground",
                className
            )}
            {...props}
        >
            {heading && (
                <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                    {heading}
                </div>
            )}
            {children}
        </div>
    )
)
CommandGroup.displayName = "CommandGroup"

interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

const CommandSeparator = React.forwardRef<HTMLDivElement, CommandSeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("-mx-1 h-px bg-border", className)}
            {...props}
        />
    )
)
CommandSeparator.displayName = "CommandSeparator"

interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string
    onSelect?: () => void
    disabled?: boolean
}

const CommandItem = React.forwardRef<HTMLDivElement, CommandItemProps>(
    ({ className, value, onSelect, disabled, children, ...props }, ref) => {
        const { search, selectedIndex, setSelectedIndex, registerItem, unregisterItem, items } = useCommandContext()
        const itemValue = value || (typeof children === "string" ? children : "")

        // Register/unregister on mount
        React.useEffect(() => {
            registerItem(itemValue)
            return () => unregisterItem(itemValue)
        }, [itemValue, registerItem, unregisterItem])

        // Filter based on search
        const isVisible = !search || itemValue.toLowerCase().includes(search.toLowerCase())

        if (!isVisible) return null

        const itemIndex = items.indexOf(itemValue)
        const isSelected = itemIndex === selectedIndex

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                data-selected={isSelected}
                data-disabled={disabled}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    isSelected && "bg-accent text-accent-foreground",
                    disabled && "pointer-events-none opacity-50",
                    !disabled && "cursor-pointer",
                    className
                )}
                onClick={() => {
                    if (!disabled) {
                        onSelect?.()
                    }
                }}
                onMouseEnter={() => setSelectedIndex(itemIndex)}
                {...props}
            >
                {children}
            </div>
        )
    }
)
CommandItem.displayName = "CommandItem"

const CommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground",
                className
            )}
            {...props}
        />
    )
}
CommandShortcut.displayName = "CommandShortcut"

export {
    Command,
    CommandDialog,
    CommandInput,
    CommandList,
    CommandEmpty,
    CommandGroup,
    CommandItem,
    CommandShortcut,
    CommandSeparator,
}
