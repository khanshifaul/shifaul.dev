"use client"

import * as React from "react"
import { LuArrowUp } from "react-icons/lu"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function ScrollToTop() {
    const [isVisible, setIsVisible] = React.useState(false)
    const [scrollProgress, setScrollProgress] = React.useState(0)

    React.useEffect(() => {
        const handleScroll = () => {
            // Visibility toggle
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }

            // Progress calculation
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
            const scrolled = (winScroll / height) * 100
            setScrollProgress(scrolled)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    if (!isVisible) {
        return null
    }

    // Circumference of the circle (r=28) -> 2 * pi * 28 ≈ 175.929
    const circumference = 175.929
    const strokeDashoffset = circumference - (scrollProgress / 100) * circumference

    return (
        <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={cn(
                "relative group flex items-center justify-center cursor-pointer",
                "h-10 w-10 md:h-16 md:w-16 rounded-full",
                "bg-primary",
                "shadow-lg transition-all duration-300 hover:scale-110 z-50",
                "text-white"
            )}
        >
            {/* Progress Ring SVG */}
            <svg
                className="absolute inset-0 -rotate-90 pointer-events-none !w-full !h-full"
                width="100%"
                height="100%"
                viewBox="0 0 64 64"
            >
                {/* Background Circle Track */}
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="4"
                    fill="none"
                />
                {/* Progress Circle */}
                <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-150 ease-out text-white"
                />
            </svg>

            {/* Icon */}
            <div className="relative z-10">
                <LuArrowUp className="!h-5 !w-5 md:!h-8 md:!w-8 drop-shadow-md" />
            </div>
        </Button>
    )
}
