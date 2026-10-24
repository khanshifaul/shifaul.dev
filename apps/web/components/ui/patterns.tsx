"use client"

import { cn } from "@/lib/utils"

export const GridPattern = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute inset-0 z-0 opacity-[0.05] pointer-events-none", className)}>
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
            </svg>
        </div>
    )
}

export const WavePattern = ({ className }: { className?: string }) => {
    return (
        <div className={cn("absolute inset-0 z-0  bg-muted/40 opacity-10 pointer-events-none overflow-hidden", className)}>
            <svg className="w-full h-full" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path fill="currentColor" fillOpacity="0.2" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128V320H1392C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320H0Z"></path>
            </svg>
        </div>
    )
}
