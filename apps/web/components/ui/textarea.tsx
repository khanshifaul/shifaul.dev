"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    /**
     * Whether the textarea is in an error state
     */
    error?: boolean
}

/**
 * Textarea component for multi-line text input
 * 
 * @example
 * <Textarea placeholder="Enter your message" />
 * 
 * @example
 * <Textarea error placeholder="Required field" />
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-destructive focus-visible:ring-destructive",
                    className
                )}
                ref={ref}
                aria-invalid={error ? "true" : undefined}
                {...props}
            />
        )
    }
)
Textarea.displayName = "Textarea"

export { Textarea }
