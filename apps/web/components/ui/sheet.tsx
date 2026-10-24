'use client'
import * as React from "react"
import { createPortal } from "react-dom"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface SheetContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
    className?: string
}

const SheetContext = React.createContext<SheetContextValue | null>(null)

interface SheetProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    className?: string
}

/**
 * Sheet (slide-in panel) component with smooth animations
 * 
 * @example
 * <Sheet>
 *   <SheetTrigger>Open</SheetTrigger>
 *   <SheetContent>
 *     <SheetHeader>
 *       <SheetTitle>Edit profile</SheetTitle>
 *       <SheetDescription>Make changes to your profile here.</SheetDescription>
 *     </SheetHeader>
 *     <div>Content</div>
 *   </SheetContent>
 * </Sheet>
 */
function Sheet({ children, open: controlledOpen, onOpenChange, defaultOpen = false, className }: SheetProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <SheetContext.Provider value={{ open, onOpenChange: setOpen, className }}>
            {children}
        </SheetContext.Provider>
    )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const context = React.useContext(SheetContext)
        if (!context) throw new Error("SheetTrigger must be used within Sheet")

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            context.onOpenChange(true)
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp ref={ref} onClick={handleClick} {...props}>
                {children}
            </Comp>
        )
    }
)
SheetTrigger.displayName = "SheetTrigger"

const sheetVariants = cva(
    "fixed z-50 gap-4 bg-background p-6 shadow-lg",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b",
                bottom: "inset-x-0 bottom-0 border-t",
                left: "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
                right: "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
            },
        },
        defaultVariants: {
            side: "right",
        },
    }
)

// Animation classes for each side
const animationClasses = {
    top: {
        open: "translate-y-0",
        closed: "-translate-y-full",
    },
    bottom: {
        open: "translate-y-0",
        closed: "translate-y-full",
    },
    left: {
        open: "translate-x-0",
        closed: "-translate-x-full",
    },
    right: {
        open: "translate-x-0",
        closed: "translate-x-full",
    },
}

interface SheetContentProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sheetVariants> { }

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
    ({ side = "right", className, children, ...props }, ref) => {
        const context = React.useContext(SheetContext)
        if (!context) throw new Error("SheetContent must be used within Sheet")

        const [isVisible, setIsVisible] = React.useState(false)
        const [isAnimating, setIsAnimating] = React.useState(false)

        React.useEffect(() => {
            if (context.open) {
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
        }, [context.open])

        React.useEffect(() => {
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    context.onOpenChange(false)
                }
            }

            if (context.open) {
                document.addEventListener("keydown", handleEscape)
                document.body.style.overflow = "hidden"
            }

            return () => {
                document.removeEventListener("keydown", handleEscape)
                document.body.style.overflow = ""
            }
        }, [context.open, context])

        const [mounted, setMounted] = React.useState(false)

        React.useEffect(() => {
            setMounted(true)
        }, [])

        if (!isVisible) return null
        if (!mounted) return null

        const sideKey = side || "right"

        return createPortal(
            <>
                {/* Overlay with fade animation */}
                <div
                    className={cn(
                        "fixed inset-0 z-50 bg-black/80 transition-opacity duration-300",
                        isAnimating ? "opacity-100" : "opacity-0"
                    )}
                    onClick={() => context.onOpenChange(false)}
                />
                {/* Sheet content with slide animation */}
                <div
                    ref={ref}
                    role="dialog"
                    aria-modal="true"
                    className={cn(
                        sheetVariants({ side }),
                        "transition-transform duration-300 ease-out",
                        isAnimating
                            ? animationClasses[sideKey].open
                            : animationClasses[sideKey].closed,
                        className,
                        context.className
                    )}
                    {...props}
                >
                    {children}
                    <button
                        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                        onClick={() => context.onOpenChange(false)}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="sr-only">Close</span>
                    </button>
                </div>
            </>,
            document.body
        )
    }
)
SheetContent.displayName = "SheetContent"

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props} />
))
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
SheetDescription.displayName = "SheetDescription"

interface SheetCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const context = React.useContext(SheetContext)
        if (!context) throw new Error("SheetClose must be used within Sheet")

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            context.onOpenChange(false)
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp ref={ref} onClick={handleClick} {...props}>
                {children}
            </Comp>
        )
    }
)
SheetClose.displayName = "SheetClose"

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription }
