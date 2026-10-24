"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
    value?: number[]
    onValueChange?: (value: number[]) => void
    defaultValue?: number[]
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    minStepsBetweenThumbs?: number
    className?: string
}

/**
 * Slider component with support for multiple thumbs (range selection)
 * 
 * @example
 * // Single value
 * <Slider value={[50]} onValueChange={setValue} max={100} step={1} />
 * 
 * @example
 * // Range
 * <Slider value={[25, 75]} onValueChange={setValue} max={100} step={1} />
 */
const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
    ({
        className,
        value: controlledValue,
        onValueChange,
        defaultValue = [0],
        min = 0,
        max = 100,
        step = 1,
        disabled,
        minStepsBetweenThumbs: _minStepsBetweenThumbs = 0,
        ...props
    }, ref) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
        const trackRef = React.useRef<HTMLDivElement>(null)
        const activeThumbIndex = React.useRef<number | null>(null)

        const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
        const setValue = (newValue: number[]) => {
            if (controlledValue === undefined) {
                setUncontrolledValue(newValue)
            }
            onValueChange?.(newValue)
        }

        const updateValue = (clientX: number, thumbIndex: number) => {
            if (!trackRef.current) return

            const rect = trackRef.current.getBoundingClientRect()
            const percentage = (clientX - rect.left) / rect.width
            const rawValue = min + percentage * (max - min)
            const steppedValue = Math.round(rawValue / step) * step
            const clampedValue = Math.min(Math.max(steppedValue, min), max)

            const newValue = [...value]
            newValue[thumbIndex] = clampedValue

            // Sort logic to prevent crossover if preferred, or just allow it but sorted
            newValue.sort((a, b) => a - b)

            setValue(newValue)
        }

        // Find closest thumb to a point
        const getClosestThumbIndex = (clientX: number) => {
            if (!trackRef.current) return 0
            const rect = trackRef.current.getBoundingClientRect()
            const percentage = (clientX - rect.left) / rect.width
            const clickedValue = min + percentage * (max - min)

            let closestIndex = 0
            let minDiff = Infinity

            value.forEach((val, index) => {
                const diff = Math.abs(val - clickedValue)
                if (diff < minDiff) {
                    minDiff = diff
                    closestIndex = index
                }
            })

            return closestIndex
        }

        const handleMouseDown = (e: React.MouseEvent) => {
            if (disabled) return
            const thumbIndex = getClosestThumbIndex(e.clientX)
            activeThumbIndex.current = thumbIndex

            updateValue(e.clientX, thumbIndex)

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }

        const handleMouseMove = (e: MouseEvent) => {
            if (activeThumbIndex.current === null) return
            updateValue(e.clientX, activeThumbIndex.current)
        }

        const handleMouseUp = () => {
            activeThumbIndex.current = null
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
        }

        const handleTouchStart = (e: React.TouchEvent) => {
            if (disabled) return
            const thumbIndex = getClosestThumbIndex(e.touches[0].clientX)
            activeThumbIndex.current = thumbIndex

            updateValue(e.touches[0].clientX, thumbIndex)

            document.addEventListener('touchmove', handleTouchMove)
            document.addEventListener('touchend', handleTouchEnd)
        }

        const handleTouchMove = (e: TouchEvent) => {
            if (activeThumbIndex.current === null) return
            updateValue(e.touches[0].clientX, activeThumbIndex.current)
            e.preventDefault()
        }

        const handleTouchEnd = () => {
            activeThumbIndex.current = null
            document.removeEventListener('touchmove', handleTouchMove)
            document.removeEventListener('touchend', handleTouchEnd)
        }

        return (
            <div
                ref={ref}
                role="group"
                className={cn(
                    "relative flex w-full touch-none select-none items-center py-4 cursor-pointer",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                {...props}
            >
                <div
                    ref={trackRef}
                    className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-secondary"
                >
                    {/* Render active tracks between ranges if multiple, or from 0 if single */}
                    {value.length > 1 ? (
                        <div
                            className="absolute h-full bg-primary transition-all duration-75"
                            style={{
                                left: `${((value[0] - min) / (max - min)) * 100}%`,
                                right: `${100 - ((value[value.length - 1] - min) / (max - min)) * 100}%`,
                            }}
                        />
                    ) : (
                        <div
                            className="absolute h-full bg-primary transition-all duration-75"
                            style={{ width: `${((value[0] - min) / (max - min)) * 100}%` }}
                        />
                    )}
                </div>

                {value.map((val, index) => {
                    const percentage = ((val - min) / (max - min)) * 100
                    return (
                        <div
                            key={index}
                            role="slider"
                            aria-valuemin={min}
                            aria-valuemax={max}
                            aria-valuenow={val}
                            tabIndex={disabled ? -1 : 0}
                            className={cn(
                                "absolute block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                                "hover:bg-accent hover:border-primary"
                            )}
                            style={{ left: `calc(${percentage}% - 8px)` }}
                        />
                    )
                })}
            </div>
        )
    }
)
Slider.displayName = "Slider"

export { Slider }
