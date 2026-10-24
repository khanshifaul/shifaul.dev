"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

// HoverCard Context
interface HoverCardContextValue {
    open: boolean
    triggerRef: React.RefObject<HTMLDivElement | null>
}

const HoverCardContext = React.createContext<HoverCardContextValue | null>(null)

function useHoverCard() {
    const context = React.useContext(HoverCardContext)
    if (!context) {
        throw new Error("useHoverCard must be used within a HoverCard")
    }
    return context
}

// HoverCard Root
interface HoverCardProps {
    children: React.ReactNode
    openDelay?: number
    closeDelay?: number
}

/**
 * HoverCard component for displaying content on hover
 * 
 * @example
 * <HoverCard>
 *   <HoverCardTrigger asChild>
 *     <Button variant="link">@nextjs</Button>
 *   </HoverCardTrigger>
 *   <HoverCardContent>
 *     The React Framework – created and maintained by @vercel.
 *   </HoverCardContent>
 * </HoverCard>
 */
const HoverCard = ({ children, openDelay = 200, closeDelay = 300 }: HoverCardProps) => {
    const [open, setOpen] = React.useState(false)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const openTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)
    const closeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = React.useCallback(() => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current)
            closeTimeoutRef.current = null
        }
        openTimeoutRef.current = setTimeout(() => {
            setOpen(true)
        }, openDelay)
    }, [openDelay])

    const handleMouseLeave = React.useCallback(() => {
        if (openTimeoutRef.current) {
            clearTimeout(openTimeoutRef.current)
            openTimeoutRef.current = null
        }
        closeTimeoutRef.current = setTimeout(() => {
            setOpen(false)
        }, closeDelay)
    }, [closeDelay])

    React.useEffect(() => {
        return () => {
            if (openTimeoutRef.current) clearTimeout(openTimeoutRef.current)
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
        }
    }, [])

    return (
        <HoverCardContext.Provider value={{ open, triggerRef }}>
            <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="inline-block"
            >
                {children}
            </div>
        </HoverCardContext.Provider>
    )
}

// HoverCard Trigger
interface HoverCardTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
    asChild?: boolean
}

const HoverCardTrigger = React.forwardRef<HTMLDivElement, HoverCardTriggerProps>(
    ({ children, asChild, className, ...props }, ref) => {
        const { triggerRef } = useHoverCard()

        // Merge refs manually since we have two refs to attach (triggerRef and ref)
        const combinedRef = React.useCallback((node: HTMLDivElement | null) => {
            if (triggerRef) (triggerRef as any).current = node

            if (typeof ref === "function") ref(node)
            else if (ref) (ref as any).current = node
        }, [triggerRef, ref])

        const Comp = asChild ? Slot : "div"

        return (
            <Comp
                ref={combinedRef}
                className={cn("inline-block cursor-pointer", className)}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
HoverCardTrigger.displayName = "HoverCardTrigger"

// HoverCard Content
interface HoverCardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    align?: "start" | "center" | "end"
    side?: "top" | "bottom"
    sideOffset?: number
}

const HoverCardContent = React.forwardRef<
    HTMLDivElement,
    HoverCardContentProps & { portal?: boolean }
>(
    ({ children, className, align = "center", side = "bottom", sideOffset = 4, portal = true, ...props }, ref) => {
        const { open, triggerRef } = useHoverCard()
        const [position, setPosition] = React.useState({ top: 0, left: 0 })
        const contentRef = React.useRef<HTMLDivElement>(null)
        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        React.useEffect(() => {
            if (!open || !triggerRef.current || !contentRef.current) return

            const checkPosition = () => {
                if (!triggerRef.current || !contentRef.current) return
                const triggerRect = triggerRef.current.getBoundingClientRect()
                const contentRect = contentRef.current.getBoundingClientRect()

                let top = 0
                let left = 0

                // Calculate vertical position
                if (side === "bottom") {
                    top = triggerRect.bottom + sideOffset
                } else {
                    top = triggerRect.top - contentRect.height - sideOffset
                }

                // Calculate horizontal position
                if (align === "start") {
                    left = triggerRect.left
                } else if (align === "end") {
                    left = triggerRect.right - contentRect.width
                } else {
                    left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
                }

                // Clamp to viewport
                left = Math.max(8, Math.min(left, window.innerWidth - contentRect.width - 8))
                top = Math.max(8, Math.min(top, window.innerHeight - contentRect.height - 8))

                setPosition({ top, left })
            }

            checkPosition()
            window.addEventListener('resize', checkPosition)
            window.addEventListener('scroll', checkPosition, true)

            return () => {
                window.removeEventListener('resize', checkPosition)
                window.removeEventListener('scroll', checkPosition, true)
            }
        }, [open, triggerRef, align, side, sideOffset])

        if (!open) return null

        const content = (
            <div
                ref={(node) => {
                    (contentRef as any).current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref) (ref as any).current = node
                }}
                className={cn(
                    "z-50 w-64 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                    "animate-in fade-in-0 zoom-in-95",
                    !portal && "absolute",
                    portal && "fixed",
                    className
                )}
                style={{
                    top: portal ? position.top : undefined,
                    left: portal ? position.left : undefined,
                    ...props.style
                }}
                {...props}
            >
                {children}
            </div>
        )

        if (portal && mounted) {
            return createPortal(content, document.body)
        }

        return content
    }
)
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }
