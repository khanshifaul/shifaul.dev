"use client"

import { ReactNode, useRef } from "react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

interface ScrollAnimationProps {
    children: ReactNode
    className?: string
    delay?: number
}

export function ScrollAnimation({ children, className = "", delay = 0 }: ScrollAnimationProps) {
    const el = useRef<HTMLDivElement>(null)

    useGSAP(() => {
        gsap.fromTo(el.current, 
            { 
                opacity: 0, 
                y: 50 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                delay: delay,
                ease: "circ.out",
                scrollTrigger: {
                    trigger: el.current,
                    start: "top 85%", // Trigger when top of element hits 85% of viewport height
                    toggleActions: "play none none reverse"
                }
            }
        )
    }, { scope: el })

    return (
        <div ref={el} className={className}>
            {children}
        </div>
    )
}
