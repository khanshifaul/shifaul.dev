"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

interface SelectProps {
    children: React.ReactNode
    value?: string
    onValueChange?: (value: string) => void
    defaultValue?: string
}

/**
 * Custom Select dropdown with keyboard navigation
 * 
 * @example
 * <Select value={value} onValueChange={setValue}>
 *   <SelectTrigger>
 *     <SelectValue placeholder="Select option" />
 *   </SelectTrigger>
 *   <SelectContent>
 *     <SelectItem value="option1">Option 1</SelectItem>
 *     <SelectItem value="option2">Option 2</SelectItem>
 *   </SelectContent>
 * </Select>
 */
function Select({ children, value: controlledValue, onValueChange, defaultValue = "" }: SelectProps) {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
    const setValue = onValueChange || setUncontrolledValue

    return (
        <SelectContext.Provider value={{ value, onValueChange: setValue, open, setOpen, triggerRef }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    )
}

const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectTrigger must be used within Select")

    // Combine refs
    const combinedRef = (node: HTMLButtonElement | null) => {
        (context.triggerRef as any).current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
    }

    return (
        <button
            ref={combinedRef}
            type="button"
            role="combobox"
            aria-expanded={context.open}
            aria-haspopup="listbox"
            className={cn(
                "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
                className
            )}
            onClick={() => context.setOpen(!context.open)}
            {...props}
        >
            {children}
            <svg
                className={cn("h-4 w-4 opacity-50 transition-transform", context.open && "rotate-180")}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
        </button>
    )
})
SelectTrigger.displayName = "SelectTrigger"

interface SelectValueProps {
    placeholder?: string
}

function SelectValue({ placeholder }: SelectValueProps) {
    const context = React.useContext(SelectContext)
    if (!context) throw new Error("SelectValue must be used within Select")

    return (
        <span className={cn(!context.value && "text-muted-foreground")}>
            {context.value || placeholder}
        </span>
    )
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
    sideOffset?: number
    portal?: boolean
    align?: "start" | "center" | "end"
    side?: "top" | "bottom"
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
    ({ className, children, sideOffset = 4, portal = true, ...props }, ref) => {
        const context = React.useContext(SelectContext)
        if (!context) throw new Error("SelectContent must be used within Select")
        const contentRef = React.useRef<HTMLDivElement>(null)
        const [position, setPosition] = React.useState({ top: 0, left: 0 })
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        React.useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (context.open) {
                    const target = e.target as Node
                    const content = contentRef.current
                    const trigger = context.triggerRef.current

                    if (content?.contains(target) || (trigger && trigger.contains(target))) {
                        return
                    }
                    context.setOpen(false)
                }
            }

            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape" && context.open) {
                    context.setOpen(false)
                }
            }

            const checkPosition = () => {
                if (context.open && contentRef.current && context.triggerRef.current) {
                    const triggerRect = context.triggerRef.current.getBoundingClientRect()
                    const contentRect = contentRef.current.getBoundingClientRect()
                    const viewportHeight = window.innerHeight
                    const viewportWidth = window.innerWidth

                    let top = 0
                    let left = 0

                    // Vertical
                    const spaceBelow = viewportHeight - triggerRect.bottom
                    const spaceAbove = triggerRect.top
                    const neededHeight = contentRect.height + sideOffset
                    const onBottom = spaceBelow >= neededHeight || spaceBelow > spaceAbove

                    if (onBottom) {
                        top = triggerRect.bottom + sideOffset
                    } else {
                        top = triggerRect.top - contentRect.height - sideOffset
                    }

                    // Horizontal - Select usually matches trigger width or starts aligned
                    left = triggerRect.left

                    // Clamping
                    if (left < 4) left = 4
                    if (left + contentRect.width > viewportWidth - 4) {
                        left = viewportWidth - contentRect.width - 4
                    }

                    // Match width if it fits, or at least min-width of trigger
                    // For now keeping simple positioning

                    setPosition({ top, left })
                }
            }

            if (context.open) {
                requestAnimationFrame(checkPosition)
            }

            const timer = setTimeout(() => {
                document.addEventListener("mousedown", handleClickOutside)
            }, 0)
            document.addEventListener("keydown", handleEscape)
            window.addEventListener("resize", checkPosition)
            window.addEventListener("scroll", checkPosition, true)

            return () => {
                clearTimeout(timer)
                document.removeEventListener("mousedown", handleClickOutside)
                document.removeEventListener("keydown", handleEscape)
                window.removeEventListener("resize", checkPosition)
                window.removeEventListener("scroll", checkPosition, true)
            }
        }, [context.open, context, sideOffset])

        if (!context.open) return null
        if (portal && !mounted) return null

        const content = (
            <div
                ref={(node) => {
                    (contentRef as any).current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                }}
                role="listbox"
                className={cn(
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                    "animate-in fade-in-0 zoom-in-95",
                    !portal && "absolute",
                    !portal && "mt-1",
                    portal && "fixed",
                    className
                )}
                style={{
                    top: portal ? position.top : undefined,
                    left: portal ? position.left : undefined,
                    width: context.triggerRef.current ? context.triggerRef.current.offsetWidth : undefined,
                    ...props.style
                }}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {children}
            </div>
        )

        if (portal) {
            return createPortal(content, document.body)
        }

        return content
    }
)
SelectContent.displayName = "SelectContent"

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
    ({ className, children, value, ...props }, ref) => {
        const context = React.useContext(SelectContext)
        if (!context) throw new Error("SelectItem must be used within Select")

        const isSelected = context.value === value

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground",
                    className
                )}
                onClick={() => {
                    context.onValueChange(value)
                    context.setOpen(false)
                }}
                {...props}
            >
                {children}
                {isSelected && (
                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </span>
                )}
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
