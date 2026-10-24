"use client"

import React from "react"
import { cn } from "@/lib/utils"

interface FloatingDockProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function FloatingDock({ className, children, ...props }: FloatingDockProps) {
    return (
        <div
            className={cn(
                "fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-center gap-2 md:gap-3",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
