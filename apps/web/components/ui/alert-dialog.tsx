"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface AlertDialogContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
}

const AlertDialogContext = React.createContext<AlertDialogContextValue | null>(null)

interface AlertDialogProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
}

/**
 * AlertDialog for confirmation actions
 * Unlike Dialog, it requires explicit action to close (no click-outside dismiss)
 * 
 * @example
 * <AlertDialog>
 *   <AlertDialogTrigger asChild>
 *     <Button variant="destructive">Delete</Button>
 *   </AlertDialogTrigger>
 *   <AlertDialogContent>
 *     <AlertDialogHeader>
 *       <AlertDialogTitle>Are you sure?</AlertDialogTitle>
 *       <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
 *     </AlertDialogHeader>
 *     <AlertDialogFooter>
 *       <AlertDialogCancel>Cancel</AlertDialogCancel>
 *       <AlertDialogAction>Continue</AlertDialogAction>
 *     </AlertDialogFooter>
 *   </AlertDialogContent>
 * </AlertDialog>
 */
function AlertDialog({ children, open: controlledOpen, onOpenChange, defaultOpen = false }: AlertDialogProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <AlertDialogContext.Provider value={{ open, onOpenChange: setOpen }}>
            {children}
        </AlertDialogContext.Provider>
    )
}

interface AlertDialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const AlertDialogTrigger = React.forwardRef<HTMLButtonElement, AlertDialogTriggerProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const context = React.useContext(AlertDialogContext)
        if (!context) throw new Error("AlertDialogTrigger must be used within AlertDialog")

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
AlertDialogTrigger.displayName = "AlertDialogTrigger"

const AlertDialogContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext)
    if (!context) throw new Error("AlertDialogContent must be used within AlertDialog")

    React.useEffect(() => {
        if (context.open) {
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.body.style.overflow = ""
        }
    }, [context.open])

    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!context.open) return null
    if (!mounted) return null

    return createPortal(
        <>
            <div className="fixed inset-0 z-50 bg-black/80" />
            <div
                ref={ref}
                role="alertdialog"
                aria-modal="true"
                className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </>,
        document.body
    )
})
AlertDialogContent.displayName = "AlertDialogContent"

const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
    HTMLHeadingElement,
    React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
    <h2 ref={ref} className={cn("text-lg font-semibold", className)} {...props} />
))
AlertDialogTitle.displayName = "AlertDialogTitle"

const AlertDialogDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
))
AlertDialogDescription.displayName = "AlertDialogDescription"

const AlertDialogAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        context?.onOpenChange(false)
    }

    return (
        <button
            ref={ref}
            className={cn(
                "inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                className
            )}
            onClick={handleClick}
            {...props}
        />
    )
})
AlertDialogAction.displayName = "AlertDialogAction"

const AlertDialogCancel = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, onClick, ...props }, ref) => {
    const context = React.useContext(AlertDialogContext)

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)
        context?.onOpenChange(false)
    }

    return (
        <button
            ref={ref}
            className={cn(
                "mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-transparent px-4 py-2 text-sm font-semibold transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 sm:mt-0",
                className
            )}
            onClick={handleClick}
            {...props}
        />
    )
})
AlertDialogCancel.displayName = "AlertDialogCancel"

export {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogAction,
    AlertDialogCancel,
}
