'use client'
import * as React from "react"
import { cn } from "@/lib/utils"

interface CarouselContextValue {
    currentIndex: number
    setCurrentIndex: React.Dispatch<React.SetStateAction<number>>
    itemsCount: number
    setItemsCount: React.Dispatch<React.SetStateAction<number>>
    isTransitioning: boolean
    setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null)

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Auto-play interval in ms (0 to disable) */
    autoPlay?: number
    /** Loop back to start (ignored in this infinite implementation as it's always true-ish, but kept for API) */
    loop?: boolean
}

/**
 * Carousel/Slider component with Infinite Looping
 */
const Carousel = React.forwardRef<HTMLDivElement, CarouselProps>(
    ({ className, children, autoPlay = 0, loop: _loop = true, ...props }, ref) => {
        // Start at 1 because 0 is the clone of the last item
        const [currentIndex, setCurrentIndex] = React.useState(1)
        const [itemsCount, setItemsCount] = React.useState(0)
        const [isTransitioning, setIsTransitioning] = React.useState(true)
        const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

        React.useEffect(() => {
            if (autoPlay > 0 && itemsCount > 1) {
                intervalRef.current = setInterval(() => {
                    setIsTransitioning(true)
                    setCurrentIndex((prev) => prev + 1)
                }, autoPlay)
                return () => {
                    if (intervalRef.current) clearInterval(intervalRef.current)
                }
            }
        }, [autoPlay, itemsCount])

        return (
            <CarouselContext.Provider value={{
                currentIndex,
                setCurrentIndex,
                itemsCount,
                setItemsCount,
                isTransitioning,
                setIsTransitioning
            }}>
                <div
                    ref={ref}
                    className={cn("relative", className)}
                    role="region"
                    aria-roledescription="carousel"
                    {...props}
                >
                    {children}
                </div>
            </CarouselContext.Provider>
        )
    }
)
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const context = React.useContext(CarouselContext)
        if (!context) throw new Error("CarouselContent must be used within Carousel")

        const items = React.Children.toArray(children)

        React.useEffect(() => {
            context.setItemsCount(items.length)
        }, [items.length, context])

        // Clone first and last items for infinite loop illusion
        const firstClone = items.length > 0 && React.isValidElement(items[0])
            ? React.cloneElement(items[0] as React.ReactElement, { key: "clone-first" })
            : null
        const lastClone = items.length > 0 && React.isValidElement(items[items.length - 1])
            ? React.cloneElement(items[items.length - 1] as React.ReactElement, { key: "clone-last" })
            : null

        // If we have items, prepend last-clone and append first-clone
        const displayItems = items.length > 1 ? [lastClone, ...items, firstClone] : items

        const handleTransitionEnd = () => {
            if (items.length <= 1) return

            // If reached the end clone (index = N + 1), snap back to first real item (index = 1)
            if (context.currentIndex >= items.length + 1) {
                context.setIsTransitioning(false)
                context.setCurrentIndex(1)
            }
            // If reached the start clone (index = 0), snap forward to last real item (index = N)
            else if (context.currentIndex <= 0) {
                context.setIsTransitioning(false)
                context.setCurrentIndex(items.length)
            }
        }

        // Re-enable transition after a snap (on next frame)
        React.useEffect(() => {
            if (!context.isTransitioning) {
                const timer = setTimeout(() => {
                    context.setIsTransitioning(true)
                }, 50)
                return () => clearTimeout(timer)
            }
        }, [context.isTransitioning, context])

        return (
            <div ref={ref} className={cn("overflow-hidden", className)} {...props}>
                <div
                    className="flex h-full w-full"
                    style={{
                        transform: `translateX(-${context.currentIndex * 100}%)`,
                        transition: context.isTransitioning ? 'transform 300ms ease-in-out' : 'none'
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {displayItems}
                </div>
            </div>
        )
    }
)
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            role="group"
            aria-roledescription="slide"
            className={cn("min-w-0 h-full shrink-0 grow-0 basis-full", className)}
            {...props}
        />
    )
)
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselPrevious must be used within Carousel")

    const handlePrev = () => {
        context.setIsTransitioning(true)
        context.setCurrentIndex((prev) => prev - 1)
    }

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-background shadow-md flex items-center justify-center cursor-pointer",
                "hover:bg-accent disabled:opacity-50",
                className
            )}
            onClick={handlePrev}
            aria-label="Previous slide"
            {...props}
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
        </button>
    )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
    const context = React.useContext(CarouselContext)
    if (!context) throw new Error("CarouselNext must be used within Carousel")

    const handleNext = () => {
        context.setIsTransitioning(true)
        context.setCurrentIndex((prev) => prev + 1)
    }

    return (
        <button
            ref={ref}
            type="button"
            className={cn(
                "absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border bg-background shadow-md flex items-center justify-center cursor-pointer",
                "hover:bg-accent disabled:opacity-50",
                className
            )}
            onClick={handleNext}
            aria-label="Next slide"
            {...props}
        >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
        </button>
    )
})
CarouselNext.displayName = "CarouselNext"

export { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext }
