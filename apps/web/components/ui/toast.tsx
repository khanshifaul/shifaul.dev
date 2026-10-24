"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const toastVariants = cva(
    "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all",
    {
        variants: {
            variant: {
                default: "border bg-background text-foreground",
                destructive:
                    "destructive group border-destructive bg-destructive text-destructive-foreground",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

interface ToastProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof toastVariants> {
    onClose?: () => void
}

/**
 * Toast notification component
 * 
 * For a complete toast system, use with a ToastProvider context.
 * This is the individual toast component.
 * 
 * @example
 * <Toast variant="default">
 *   <ToastTitle>Success</ToastTitle>
 *   <ToastDescription>Your action was completed.</ToastDescription>
 * </Toast>
 */
const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
    ({ className, variant, onClose, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                role={variant === "destructive" ? "alert" : "status"}
                aria-live={variant === "destructive" ? "assertive" : "polite"}
                className={cn(toastVariants({ variant }), className)}
                {...props}
            >
                <div className="grid gap-1">{children}</div>
                {onClose && (
                    <button
                        className="absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100"
                        onClick={onClose}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        )
    }
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm font-semibold [&+div]:text-xs", className)} {...props} />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("text-sm opacity-90", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"

const ToastAction = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50",
            className
        )}
        {...props}
    />
))
ToastAction.displayName = "ToastAction"

export { Toast, ToastTitle, ToastDescription, ToastAction, toastVariants }
