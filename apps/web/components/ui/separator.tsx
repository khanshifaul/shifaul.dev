"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    /**
     * Orientation of the separator
     * @default "horizontal"
     */
    orientation?: "horizontal" | "vertical"
    /**
     * Whether the separator is decorative (no semantic meaning)
     * @default true
     */
    decorative?: boolean
}

/**
 * Separator component for visual division
 * 
 * @example
 * // Horizontal separator
 * <Separator />
 * 
 * // Vertical separator
 * <Separator orientation="vertical" className="h-4" />
 */
const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
    ({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
        <div
            ref={ref}
            role={decorative ? "none" : "separator"}
            aria-orientation={decorative ? undefined : orientation}
            className={cn(
                "shrink-0 bg-border",
                orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
                className
            )}
            {...props}
        />
    )
)
Separator.displayName = "Separator"

export { Separator }
