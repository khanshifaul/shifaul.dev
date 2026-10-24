"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface DialogContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const DialogContext = React.createContext<DialogContextValue | null>(null)

function useDialogContext() {
    const context = React.useContext(DialogContext)
    if (!context) {
        throw new Error("Dialog components must be used within a Dialog")
    }
    return context
}

interface DialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * Dialog component with focus trap and keyboard handling
 * 
 * @example
 * const [open, setOpen] = useState(false)
 * 
 * <Dialog open={open} onOpenChange={setOpen}>
 *   <DialogTrigger asChild>
 *     <Button>Open Dialog</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>Title</DialogTitle>
 *       <DialogDescription>Description</DialogDescription>
 *     </DialogHeader>
 *     <div>Content</div>
 *     <DialogFooter>
 *       <Button>Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 */
function Dialog({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: DialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <DialogContext.Provider value={{ open, onOpenChange: setOpen }}>
            {children}
        </DialogContext.Provider>
    )
}

interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DialogTrigger = React.forwardRef<HTMLButtonElement, DialogTriggerProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const { onOpenChange } = useDialogContext()

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
DialogTrigger.displayName = "DialogTrigger"

const DialogPortal = ({ children }: { children: React.ReactNode }) => {
    const { open } = useDialogContext()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!open) return null
    if (!mounted) return null

    return createPortal(children, document.body)
}

const DialogOverlay = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const { open, onOpenChange } = useDialogContext()
    const contentRef = React.useRef<HTMLDivElement>(null)

    // Handle escape key
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onOpenChange(false)
            }
        }

        if (open) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = ""
        }
    }, [open, onOpenChange])

    // Focus trap
    React.useEffect(() => {
        if (open && contentRef.current) {
            const focusableElements = contentRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
            const firstElement = focusableElements[0] as HTMLElement
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

            const handleTab = (e: KeyboardEvent) => {
                if (e.key === "Tab") {
                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault()
                        lastElement?.focus()
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault()
                        firstElement?.focus()
                    }
                }
            }

            document.addEventListener("keydown", handleTab)
            firstElement?.focus()

            return () => document.removeEventListener("keydown", handleTab)
        }
    }, [open])

    if (!open) return null

    return (
        <DialogPortal>
            <DialogOverlay onClick={() => onOpenChange(false)} />
            <div
                ref={(node) => {
                    (contentRef as any).current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) ref.current = node
                }}
                role="dialog"
                aria-modal="true"
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    onClick={() => onOpenChange(false)}
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="sr-only">Close</span>
                </button>
            </div>
        </DialogPortal>
    )
})
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}
        {...props}
    />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
        {...props}
    />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2
        ref={ref}
        className={cn("text-lg font-semibold leading-none tracking-tight", className)}
        {...props}
    />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
))
DialogDescription.displayName = "DialogDescription"

interface DialogCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DialogClose = React.forwardRef<HTMLButtonElement, DialogCloseProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const { onOpenChange } = useDialogContext()

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
DialogClose.displayName = "DialogClose"

export {
    Dialog,
    DialogPortal,
    DialogOverlay,
    DialogTrigger,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogDescription,
}
