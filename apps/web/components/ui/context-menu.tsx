"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Context Menu Context
interface ContextMenuContextValue {
    open: boolean
    position: { x: number; y: number }
    onOpenChange: (open: boolean) => void
}

const ContextMenuContext = React.createContext<ContextMenuContextValue | null>(null)

function useContextMenu() {
    const context = React.useContext(ContextMenuContext)
    if (!context) {
        throw new Error("useContextMenu must be used within a ContextMenu")
    }
    return context
}

// ContextMenu Root
interface ContextMenuProps {
    children: React.ReactNode
}

const ContextMenu = ({ children }: ContextMenuProps) => {
    const [open, setOpen] = React.useState(false)
    const [position, setPosition] = React.useState({ x: 0, y: 0 })

    const handleContextMenu = React.useCallback((e: MouseEvent) => {
        const target = e.target
        if (target instanceof Element && target.closest("input, textarea, select, [contenteditable='true']")) return

        e.preventDefault()
        setPosition({ x: e.clientX, y: e.clientY })
        setOpen(true)
    }, [])

    React.useEffect(() => {
        window.addEventListener("contextmenu", handleContextMenu, true)
        return () => window.removeEventListener("contextmenu", handleContextMenu, true)
    }, [handleContextMenu])

    // Close on outside click
    React.useEffect(() => {
        if (!open) return

        const handleClick = () => setOpen(false)
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false)
        }

        document.addEventListener("click", handleClick)
        document.addEventListener("keydown", handleEscape)
        return () => {
            document.removeEventListener("click", handleClick)
            document.removeEventListener("keydown", handleEscape)
        }
    }, [open])

    return (
        <ContextMenuContext.Provider value={{ open, position, onOpenChange: setOpen }}>
            <div>
                {children}
            </div>
        </ContextMenuContext.Provider>
    )
}

// ContextMenu Trigger (the area that can be right-clicked)
interface ContextMenuTriggerProps {
    children: React.ReactNode
    className?: string
}

const ContextMenuTrigger = React.forwardRef<HTMLDivElement, ContextMenuTriggerProps>(
    ({ children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={className} {...props}>
                {children}
            </div>
        )
    }
)
ContextMenuTrigger.displayName = "ContextMenuTrigger"

// ContextMenu Content
interface ContextMenuContentProps {
    children: React.ReactNode
    className?: string
}

const ContextMenuContent = React.forwardRef<HTMLDivElement, ContextMenuContentProps>(
    ({ children, className, ...props }, _ref) => {
        const { open, position } = useContextMenu()
        const contentRef = React.useRef<HTMLDivElement>(null)
        const [adjustedPosition, setAdjustedPosition] = React.useState(position)

        // Adjust position to keep menu in viewport
        React.useEffect(() => {
            if (!open || !contentRef.current) return

            const rect = contentRef.current.getBoundingClientRect()
            const viewportWidth = window.innerWidth
            const viewportHeight = window.innerHeight

            let x = position.x
            let y = position.y

            // Adjust if overflowing right
            if (x + rect.width > viewportWidth) {
                x = viewportWidth - rect.width - 8
            }
            // Adjust if overflowing bottom
            if (y + rect.height > viewportHeight) {
                y = viewportHeight - rect.height - 8
            }

            setAdjustedPosition({ x: Math.max(8, x), y: Math.max(8, y) })
        }, [open, position])

        if (!open) return null

        return (
            <div
                ref={contentRef}
                className={cn(
                    "fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-white bg-popover p-1 text-popover-foreground shadow-md",
                    "animate-in fade-in-0 zoom-in-95",
                    className
                )}
                style={{
                    left: adjustedPosition.x,
                    top: adjustedPosition.y,
                }}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {children}
            </div>
        )
    }
)
ContextMenuContent.displayName = "ContextMenuContent"

// ContextMenu Item
interface ContextMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    inset?: boolean
}

const ContextMenuItem = React.forwardRef<HTMLButtonElement, ContextMenuItemProps>(
    ({ className, inset, children, ...props }, ref) => {
        const { onOpenChange } = useContextMenu()

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
                    "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                    "disabled:pointer-events-none disabled:opacity-50",
                    inset && "pl-8",
                    className
                )}
                onClick={() => onOpenChange(false)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
ContextMenuItem.displayName = "ContextMenuItem"

// ContextMenu Separator
const ContextMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("-mx-1 my-1 h-px bg-muted", className)}
        {...props}
    />
))
ContextMenuSeparator.displayName = "ContextMenuSeparator"

// ContextMenu Label
const ContextMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "px-2 py-1.5 text-sm font-semibold text-foreground",
            inset && "pl-8",
            className
        )}
        {...props}
    />
))
ContextMenuLabel.displayName = "ContextMenuLabel"

// ContextMenu Shortcut
const ContextMenuShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)}
            {...props}
        />
    )
}
ContextMenuShortcut.displayName = "ContextMenuShortcut"

export {
    ContextMenu,
    ContextMenuTrigger,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuLabel,
    ContextMenuShortcut,
}
