"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface PopoverContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const PopoverContext = React.createContext<PopoverContextValue | null>(null)

interface PopoverProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Popover component for floating content
 * 
 * @example
 * <Popover>
 *   <PopoverTrigger asChild>
 *     <Button>Open Popover</Button>
 *   </PopoverTrigger>
 *   <PopoverContent>
 *     Popover content here
 *   </PopoverContent>
 * </Popover>
 */
function Popover({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: PopoverProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <PopoverContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
            <div className="relative inline-block">
                {children}
            </div>
        </PopoverContext.Provider>
    )
}

interface PopoverTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const PopoverTrigger = React.forwardRef<HTMLButtonElement, PopoverTriggerProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const context = React.useContext(PopoverContext)
        if (!context) throw new Error("PopoverTrigger must be used within Popover")

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            context.onOpenChange(!context.open)
        }

        // Combine refs
        const combinedRef = (node: HTMLButtonElement | null) => {
            (context.triggerRef as any).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                ref={combinedRef}
                aria-expanded={context.open}
                aria-haspopup={true}
                onClick={handleClick}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end"; sideOffset?: number; portal?: boolean }
>(({ className, children, align = "center", sideOffset = 4, portal = true, ...props }, ref) => {
    const context = React.useContext(PopoverContext)
    if (!context) throw new Error("PopoverContent must be used within Popover")
    const contentRef = React.useRef<HTMLDivElement>(null)
    const [position, setPosition] = React.useState({ top: 0, left: 0 })

    // Reset scroll on mount/unmount if needed, but mainly we just need a portal container
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

                // Don't close if clicking inside content or trigger
                if (content?.contains(target) || (trigger && trigger.contains(target))) {
                    return
                }
                context.onOpenChange(false)
            }
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && context.open) {
                context.onOpenChange(false)
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

                // Horizontal (Alignment)
                if (align === 'start') {
                    left = triggerRect.left
                } else if (align === 'end') {
                    left = triggerRect.right - contentRect.width
                } else {
                    // center
                    left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
                }

                // Clamping
                if (left < 4) left = 4
                if (left + contentRect.width > viewportWidth - 4) {
                    left = viewportWidth - contentRect.width - 4
                }

                setPosition({ top, left })
            }
        }

        if (context.open) {
            requestAnimationFrame(checkPosition)
        }

        const timer = setTimeout(() => {
            document.addEventListener("click", handleClickOutside)
        }, 0)
        document.addEventListener("keydown", handleEscape)
        window.addEventListener("resize", checkPosition)
        window.addEventListener("scroll", checkPosition, true)

        return () => {
            clearTimeout(timer)
            document.removeEventListener("click", handleClickOutside)
            document.removeEventListener("keydown", handleEscape)
            window.removeEventListener("resize", checkPosition)
            window.removeEventListener("scroll", checkPosition, true)
        }
    }, [context.open, context, align, sideOffset])

    if (!context.open) return null
    if (portal && !mounted) return null

    const content = (
        <div
            ref={(node) => {
                (contentRef as any).current = node
                if (typeof ref === 'function') ref(node)
                else if (ref) ref.current = node
            }}
            className={cn(
                "z-50 min-w-[10rem] rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
                "animate-in fade-in-0 zoom-in-95",
                !portal && "absolute",
                !portal && "mt-2",
                portal && "fixed",
                className
            )}
            style={{
                top: portal ? position.top : undefined,
                left: portal ? position.left : undefined,
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
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
