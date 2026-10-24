"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface CollapsibleContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null)

interface CollapsibleProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    className?: string
}

/**
 * Collapsible component for expandable content
 * 
 * @example
 * <Collapsible>
 *   <CollapsibleTrigger>Toggle</CollapsibleTrigger>
 *   <CollapsibleContent>
 *     Hidden content here
 *   </CollapsibleContent>
 * </Collapsible>
 */
const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
    ({ children, open: controlledOpen, onOpenChange, defaultOpen = false, className }, ref) => {
        const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

        const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
        const setOpen = onOpenChange || setUncontrolledOpen

        return (
            <CollapsibleContext.Provider value={{ open, onOpenChange: setOpen }}>
                <div ref={ref} className={className} data-state={open ? "open" : "closed"}>
                    {children}
                </div>
            </CollapsibleContext.Provider>
        )
    }
)
Collapsible.displayName = "Collapsible"

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const CollapsibleTrigger = React.forwardRef<HTMLButtonElement, CollapsibleTriggerProps>(
    ({ className, children, asChild, onClick, ...props }, ref) => {
        const context = React.useContext(CollapsibleContext)
        if (!context) throw new Error("CollapsibleTrigger must be used within Collapsible")

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            context.onOpenChange(!context.open)
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                ref={ref}
                type="button"
                aria-expanded={context.open}
                className={className}
                onClick={handleClick}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext)
    if (!context) throw new Error("CollapsibleContent must be used within Collapsible")

    return (
        <div
            ref={ref}
            className={cn(
                "overflow-hidden transition-all",
                context.open ? "animate-collapsible-down" : "animate-collapsible-up hidden",
                className
            )}
            data-state={context.open ? "open" : "closed"}
            {...props}
        >
            {children}
        </div>
    )
})
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
