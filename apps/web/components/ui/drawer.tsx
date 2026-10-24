"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

// Drawer Context
interface DrawerContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

function useDrawer() {
    const context = React.useContext(DrawerContext)
    if (!context) {
        throw new Error("useDrawer must be used within a Drawer")
    }
    return context
}

// Drawer Root
interface DrawerProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Drawer component for mobile-first bottom sheets
 * 
 * @example
 * <Drawer>
 *   <DrawerTrigger>Open</DrawerTrigger>
 *   <DrawerContent>
 *     <DrawerHeader>
 *       <DrawerTitle>Title</DrawerTitle>
 *       <DrawerDescription>Description</DrawerDescription>
 *     </DrawerHeader>
 *     <div>Content</div>
 *     <DrawerFooter>
 *       <Button>Submit</Button>
 *       <DrawerClose>Cancel</DrawerClose>
 *     </DrawerFooter>
 *   </DrawerContent>
 * </Drawer>
 */
const Drawer = ({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: DrawerProps) => {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const open = controlledOpen ?? uncontrolledOpen
    const setOpen = onOpenChange ?? setUncontrolledOpen

    return (
        <DrawerContext.Provider value={{ open, onOpenChange: setOpen }}>
            {children}
        </DrawerContext.Provider>
    )
}

// Drawer Trigger
interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
    ({ children, asChild, onClick, ...props }, ref) => {
        const { onOpenChange } = useDrawer()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            onOpenChange(true)
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp ref={ref} onClick={handleClick} {...props}>
                {children}
            </Comp>
        )
    }
)
DrawerTrigger.displayName = "DrawerTrigger"

// Drawer Close
interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>(
    ({ children, onClick, asChild, ...props }, ref) => {
        const { onOpenChange } = useDrawer()

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            onOpenChange(false)
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp ref={ref} onClick={handleClick} {...props}>
                {children}
            </Comp>
        )
    }
)
DrawerClose.displayName = "DrawerClose"

// Drawer Overlay (internal)
interface DrawerOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
    isAnimating: boolean
}

const DrawerOverlay = React.forwardRef<HTMLDivElement, DrawerOverlayProps>(
    ({ className, isAnimating, ...props }, ref) => {
        const { onOpenChange } = useDrawer()

        return (
            <div
                ref={ref}
                className={cn(
                    "fixed inset-0 z-50 bg-black/80 transition-opacity duration-300",
                    isAnimating ? "opacity-100" : "opacity-0",
                    className
                )}
                onClick={() => onOpenChange(false)}
                {...props}
            />
        )
    }
)
DrawerOverlay.displayName = "DrawerOverlay"

// Drawer Content
interface DrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
    side?: "bottom" | "top"
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
    ({ className, children, side = "bottom", ...props }, ref) => {
        const { open, onOpenChange } = useDrawer()
        const [isVisible, setIsVisible] = React.useState(false)
        const [isAnimating, setIsAnimating] = React.useState(false)

        React.useEffect(() => {
            if (open) {
                // First make visible (off-screen)
                setIsVisible(true)
                // Use a small timeout to ensure the browser has painted the initial state
                const timer = setTimeout(() => {
                    setIsAnimating(true)
                }, 10)
                return () => clearTimeout(timer)
            } else {
                // Start close animation
                setIsAnimating(false)
                // Wait for animation to complete before hiding
                const timer = setTimeout(() => {
                    setIsVisible(false)
                }, 300)
                return () => clearTimeout(timer)
            }
        }, [open])

        // Close on Escape
        React.useEffect(() => {
            if (!open) return
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") onOpenChange(false)
            }
            document.addEventListener("keydown", handleEscape)
            return () => document.removeEventListener("keydown", handleEscape)
        }, [open, onOpenChange])

        // Prevent body scroll when open
        React.useEffect(() => {
            if (open) {
                document.body.style.overflow = "hidden"
            } else {
                document.body.style.overflow = ""
            }
            return () => {
                document.body.style.overflow = ""
            }
        }, [open])

        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        if (!isVisible) return null
        if (!mounted) return null

        return createPortal(
            <>
                <DrawerOverlay isAnimating={isAnimating} />
                <div
                    ref={ref}
                    className={cn(
                        "fixed z-50 flex flex-col bg-background shadow-lg",
                        "transition-transform duration-300 ease-out",
                        side === "bottom" && "inset-x-0 bottom-0 rounded-t-xl border-t",
                        side === "top" && "inset-x-0 top-0 rounded-b-xl border-b",
                        // Animation states
                        side === "bottom" && (isAnimating ? "translate-y-0" : "translate-y-full"),
                        side === "top" && (isAnimating ? "translate-y-0" : "-translate-y-full"),
                        className
                    )}
                    {...props}
                >
                    {/* Handle indicator */}
                    {side === "bottom" && (
                        <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted" />
                    )}
                    {children}
                    {side === "top" && (
                        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
                    )}
                </div>
            </>,
            document.body
        )
    }
)
DrawerContent.displayName = "DrawerContent"

// Drawer Header
const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-1.5 p-4 text-center sm:text-left", className)} {...props} />
)
DrawerHeader.displayName = "DrawerHeader"

// Drawer Footer
const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse gap-2 p-4 sm:flex-row sm:justify-end", className)} {...props} />
)
DrawerFooter.displayName = "DrawerFooter"

// Drawer Title
const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
    )
)
DrawerTitle.displayName = "DrawerTitle"

// Drawer Description
const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => (
        <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
    )
)
DrawerDescription.displayName = "DrawerDescription"

export {
    Drawer,
    DrawerTrigger,
    DrawerClose,
    DrawerOverlay,
    DrawerContent,
    DrawerHeader,
    DrawerFooter,
    DrawerTitle,
    DrawerDescription,
}
