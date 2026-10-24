"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface HeadingInfo {
    id: string
    text: string
    level: number
    children?: HeadingInfo[]
}

interface TableOfContentsProps {
    headings?: HeadingInfo[]
    activeSection?: string | null
    className?: string
    onSectionClick?: (id: string) => void
}

export function TableOfContents({
    headings = [],
    activeSection,
    className,
    onSectionClick,
}: TableOfContentsProps) {

    const scrollToHeading = React.useCallback((headingId: string) => {
        if (onSectionClick) {
            onSectionClick(headingId)
            return
        }

        const element = document.getElementById(headingId)
        if (element) {
            const offset = 80
            const elementPosition =
                element.getBoundingClientRect().top + window.pageYOffset
            window.scrollTo({
                top: elementPosition - offset,
                behavior: "smooth",
            })
        }
    }, [onSectionClick])

    // Flatten all headings without hierarchy for simplicity
    const flattenedHeadings = React.useMemo(() => {
        const flatten = (headings: HeadingInfo[]): HeadingInfo[] => {
            return headings.flatMap((heading) => [
                heading,
                ...(heading.children ? flatten(heading.children) : []),
            ])
        }
        return flatten(headings)
    }, [headings])

    if (flattenedHeadings.length === 0) return null

    return (
        <div
            className={cn(
                "hidden lg:block sticky top-16 right-0 h-[calc(100vh-4rem)] w-full bg-background justify-self-end lg:max-w-64",
                className
            )}
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-4">
                    <span className="font-medium text-foreground text-sm">
                        On this page
                    </span>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin">
                    <div className="space-y-1">
                        {flattenedHeadings.map((heading) => (
                            <button
                                key={heading.id}
                                onClick={() => scrollToHeading(heading.id)}
                                className={cn(
                                    "w-full text-left px-2 py-1.5 rounded text-xs transition-colors duration-200",
                                    activeSection === heading.id
                                        ? "text-primary bg-accent font-medium"
                                        : "text-muted-foreground hover:text-foreground",
                                )}
                                style={{
                                    paddingLeft: `${(heading.level - 1) * 12 + 8}px`,
                                }}
                            >
                                {heading.text}
                            </button>
                        ))}
                    </div>
                </nav>
            </div>
        </div>
    )
}
