"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * Label component for form inputs
 * 
 * @example
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" />
 */
const Label = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement> & {
        /**
         * Whether the associated input is required
         */
        required?: boolean
    }
>(({ className, required, children, ...props }, ref) => (
    <label
        ref={ref}
        className={cn(
            "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className
        )}
        {...props}
    >
        {children}
        {required && <span className="text-destructive ml-1">*</span>}
    </label>
))
Label.displayName = "Label"

export { Label }
