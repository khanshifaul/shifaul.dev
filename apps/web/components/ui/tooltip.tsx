"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface TooltipContextValue {
    open: boolean
    setOpen: (open: boolean) => void
    mousePosition: { x: number; y: number }
    setMousePosition: (pos: { x: number; y: number }) => void
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null)

interface TooltipProviderProps {
    children: React.ReactNode
    delayDuration?: number
}

/**
 * TooltipProvider wraps your app to enable tooltips
 */
function TooltipProvider({ children }: TooltipProviderProps) {
    return <>{children}</>
}

interface TooltipProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Tooltip component for hover hints - appears at mouse cursor position
 * 
 * @example
 * <TooltipProvider>
 *   <Tooltip>
 *     <TooltipTrigger>Hover me</TooltipTrigger>
 *     <TooltipContent>Tooltip text</TooltipContent>
 *   </Tooltip>
 * </TooltipProvider>
 */
function Tooltip({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: TooltipProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 })

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <TooltipContext.Provider value={{ open, setOpen, mousePosition, setMousePosition }}>
            <span className="relative inline-block">
                {children}
            </span>
        </TooltipContext.Provider>
    )
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLSpanElement> {
    asChild?: boolean
}

const TooltipTrigger = React.forwardRef<HTMLSpanElement, TooltipTriggerProps>(
    ({ children, asChild, ...props }, ref) => {
        const context = React.useContext(TooltipContext)
        if (!context) throw new Error("TooltipTrigger must be used within Tooltip")

        const handleMouseEnter = () => context.setOpen(true)
        const handleMouseLeave = () => context.setOpen(false)
        const handleMouseMove = (e: React.MouseEvent) => {
            context.setMousePosition({ x: e.clientX, y: e.clientY })
        }
        const handleFocus = () => context.setOpen(true)
        const handleBlur = () => context.setOpen(false)

        const Comp = asChild ? Slot : "span"

        return (
            <Comp
                ref={ref}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onMouseMove={handleMouseMove}
                onFocus={handleFocus}
                onBlur={handleBlur}
                tabIndex={0}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(TooltipContext)
    if (!context) throw new Error("TooltipContent must be used within Tooltip")

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!context.open) return null
    if (!mounted) return null

    // Offset from cursor (slightly above and to the right)
    const offsetX = 10
    const offsetY = -10

    return createPortal(
        <div
            ref={ref}
            role="tooltip"
            style={{
                position: 'fixed',
                left: context.mousePosition.x + offsetX,
                top: context.mousePosition.y + offsetY,
                transform: 'translateY(-100%)',
            }}
            className={cn(
                "z-[9999] overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 pointer-events-none whitespace-nowrap",
                className
            )}
            {...props}
        >
            {children}
        </div>,
        document.body
    )
})
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
