"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Orientation of scrollbar */
    orientation?: "vertical" | "horizontal"
    /** Scrollbar size: "thin" (4px), "default" (8px), "thick" (12px) */
    scrollbarSize?: "thin" | "default" | "thick"
    /** Hide scrollbar until hover */
    hideScrollbar?: boolean
}

// CSS for custom scrollbar styling
const scrollbarStyles = {
    thin: {
        width: "4px",
        height: "4px",
    },
    default: {
        width: "8px",
        height: "8px",
    },
    thick: {
        width: "12px",
        height: "12px",
    },
}

/**
 * ScrollArea - Custom scrollbar container
 * 
 * Provides a styled scrollbar that is thin and consistent across browsers.
 * Supports customizable scrollbar size and orientation.
 */
const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
    ({ className, children, orientation = "vertical", scrollbarSize = "thin", hideScrollbar = false, style, ...props }, ref) => {
        const sizes = scrollbarStyles[scrollbarSize]

        const scrollbarCSS: React.CSSProperties = {
            ...style,
            // Webkit browsers (Chrome, Safari, Edge)
            // @ts-ignore - CSS custom properties for scrollbar
            "--scrollbar-width": sizes.width,
            "--scrollbar-height": sizes.height,
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "relative",
                    // Container overflow based on orientation
                    orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
                    orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
                    // Custom scrollbar classes
                    "scrollbar-custom",
                    hideScrollbar && "scrollbar-hide hover:scrollbar-show",
                    className
                )}
                style={scrollbarCSS}
                {...props}
            >
                <style>{`
                    .scrollbar-custom::-webkit-scrollbar {
                        width: var(--scrollbar-width, 4px);
                        height: var(--scrollbar-height, 4px);
                    }
                    .scrollbar-custom::-webkit-scrollbar-track {
                        background: transparent;
                        border-radius: 9999px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-thumb {
                        background: hsl(var(--muted-foreground) / 0.3);
                        border-radius: 9999px;
                    }
                    .scrollbar-custom::-webkit-scrollbar-thumb:hover {
                        background: hsl(var(--muted-foreground) / 0.5);
                    }
                    .scrollbar-custom {
                        scrollbar-width: thin;
                        scrollbar-color: hsl(var(--muted-foreground) / 0.3) transparent;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        opacity: 0;
                    }
                    .scrollbar-hide:hover::-webkit-scrollbar,
                    .scrollbar-show::-webkit-scrollbar {
                        opacity: 1;
                    }
                `}</style>
                {children}
            </div>
        )
    }
)
ScrollArea.displayName = "ScrollArea"

// ScrollBar component for explicit scrollbar styling reference (optional usage)
interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {
    orientation?: "vertical" | "horizontal"
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
    ({ className, orientation = "vertical", ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "flex touch-none select-none transition-colors",
                orientation === "vertical" && "h-full w-2.5 border-l border-l-transparent p-[1px]",
                orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px]",
                className
            )}
            {...props}
        />
    )
)
ScrollBar.displayName = "ScrollBar"

export { ScrollArea, ScrollBar }
