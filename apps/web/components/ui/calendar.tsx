"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CalendarContextValue {
    currentMonth: Date
    setCurrentMonth: (date: Date) => void
    selectedDates: Date[]
    onSelect: (date: Date) => void
    mode: "single" | "multiple" | "range"
    rangeStart: Date | null
    hoveredDate: Date | null
    setHoveredDate: (date: Date | null) => void
}

const _CalendarContext = React.createContext<CalendarContextValue | null>(null)

export interface CalendarProps {
    /** Selection mode */
    mode?: "single" | "multiple" | "range"
    /** Selected date(s) */
    selected?: Date | Date[]
    /** Callback when date is selected */
    onSelect?: (date: Date | Date[] | undefined) => void
    /** Default month to display */
    defaultMonth?: Date
    /** Minimum selectable date */
    minDate?: Date
    /** Maximum selectable date */
    maxDate?: Date
    /** Whether calendar is disabled */
    disabled?: boolean
    /** Size variant */
    size?: "default" | "sm" | "xs" | "md" | "lg"
    /** Number of months to display */
    numberOfMonths?: number
    className?: string
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"]
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]
const MONTHS_SHORT = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

function getDaysInMonth(year: number, month: number): Date[] {
    const days: Date[] = []
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Add days from previous month to fill first week
    const startPadding = firstDay.getDay()
    for (let i = startPadding - 1; i >= 0; i--) {
        days.push(new Date(year, month, -i))
    }

    // Add days of current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
        days.push(new Date(year, month, d))
    }

    // Add days from next month to fill last week
    const endPadding = 42 - days.length // 6 rows * 7 days
    for (let i = 1; i <= endPadding; i++) {
        days.push(new Date(year, month + 1, i))
    }

    return days
}

function isSameDay(d1: Date | undefined | null, d2: Date | undefined | null): boolean {
    if (!d1 || !d2) return false
    return d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear()
}

function isInRange(date: Date, start: Date | null, end: Date | null): boolean {
    if (!start || !end) return false
    const d = date.getTime()
    const s = start.getTime()
    const e = end.getTime()
    return d >= Math.min(s, e) && d <= Math.max(s, e)
}

type ViewMode = 'days' | 'months' | 'years'

/**
 * Calendar date picker component - Modern, Responsive, Advanced
 * 
 * Features:
 * - Fluid sizing (xs, sm, default, md, lg)
 * - Range hover preview
 * - Year/Month selection views
 * - Animated transitions (CSS)
 */
const Calendar = React.forwardRef<HTMLDivElement, CalendarProps>(
    (
        (
            {
                mode = "single",
                selected,
                onSelect,
                defaultMonth = new Date(),
                minDate,
                maxDate,
                disabled,
                size = "default",
                className,
                numberOfMonths = 1,
                ...props
            },
            ref
        ) => {
            const [currentMonth, setCurrentMonth] = React.useState(defaultMonth)
            const [view, setView] = React.useState<ViewMode>('days')
            const [rangeStart, setRangeStart] = React.useState<Date | null>(null)
            const [hoveredDate, setHoveredDate] = React.useState<Date | null>(null)

            // Reset range start if mode changes or selection clears externally
            React.useEffect(() => {
                if (mode !== 'range' || !selected) {
                    setRangeStart(null)
                }
            }, [mode, selected])

            const selectedDates = React.useMemo(() => {
                if (!selected) return []
                return Array.isArray(selected) ? selected : [selected]
            }, [selected])

            const handleSelect = (date: Date) => {
                if (disabled) return
                if (minDate && date < minDate) return
                if (maxDate && date > maxDate) return

                if (mode === "single") {
                    onSelect?.(date)
                } else if (mode === "multiple") {
                    const exists = selectedDates.some(d => isSameDay(d, date))
                    if (exists) {
                        onSelect?.(selectedDates.filter(d => !isSameDay(d, date)))
                    } else {
                        onSelect?.([...selectedDates, date])
                    }
                } else if (mode === "range") {
                    if (!rangeStart) {
                        setRangeStart(date)
                        onSelect?.([date]) // Partial selection
                    } else {
                        const start = rangeStart < date ? rangeStart : date
                        const end = rangeStart < date ? date : rangeStart
                        onSelect?.([start, end])
                        setRangeStart(null)
                    }
                }
            }

            const navigatePrev = () => {
                if (view === 'years') {
                    setCurrentMonth(new Date(currentMonth.getFullYear() - 12, currentMonth.getMonth(), 1))
                } else if (view === 'months') {
                    setCurrentMonth(new Date(currentMonth.getFullYear() - 1, currentMonth.getMonth(), 1))
                } else {
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
                }
            }

            const navigateNext = () => {
                if (view === 'years') {
                    setCurrentMonth(new Date(currentMonth.getFullYear() + 12, currentMonth.getMonth(), 1))
                } else if (view === 'months') {
                    setCurrentMonth(new Date(currentMonth.getFullYear() + 1, currentMonth.getMonth(), 1))
                } else {
                    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
                }
            }

            // --- Sizing Configuration ---
            const sizeStyles = {
                xs: {
                    container: "p-2", // width handled by layout now
                    width: "w-[220px]",
                    header: "mb-2",
                    navBtn: "h-5 w-5",
                    icon: "h-2.5 w-2.5",
                    headerTitle: "text-[10px] font-medium",
                    grid: "gap-0.5",
                    dayName: "text-[9px] h-5",
                    cell: "text-[10px]",
                    yearGrid: "grid-cols-3 gap-1",
                    yearCell: "text-xs py-1.5",
                    radius: "rounded-sm",
                },
                sm: {
                    container: "p-3",
                    width: "w-[280px]",
                    header: "mb-3",
                    navBtn: "h-6 w-6",
                    icon: "h-3 w-3",
                    headerTitle: "text-xs font-semibold",
                    grid: "gap-1",
                    dayName: "text-[10px] h-6",
                    cell: "text-xs",
                    yearGrid: "grid-cols-3 gap-2",
                    yearCell: "text-xs py-2",
                    radius: "rounded-md",
                },
                default: {
                    container: "p-4",
                    width: "w-[320px]",
                    header: "mb-4",
                    navBtn: "h-8 w-8",
                    icon: "h-4 w-4",
                    headerTitle: "text-sm font-semibold",
                    grid: "gap-1",
                    dayName: "text-xs h-8",
                    cell: "text-sm",
                    yearGrid: "grid-cols-3 gap-3",
                    yearCell: "text-sm py-2.5",
                    radius: "rounded-md",
                },
                md: {
                    container: "p-5",
                    width: "w-[380px]",
                    header: "mb-5",
                    navBtn: "h-9 w-9",
                    icon: "h-4 w-4",
                    headerTitle: "text-base font-semibold",
                    grid: "gap-2",
                    dayName: "text-xs h-9",
                    cell: "text-base",
                    yearGrid: "grid-cols-4 gap-3",
                    yearCell: "text-base py-3",
                    radius: "rounded-lg",
                },
                lg: {
                    container: "p-6",
                    width: "w-[440px]",
                    header: "mb-6",
                    navBtn: "h-10 w-10",
                    icon: "h-5 w-5",
                    headerTitle: "text-lg font-bold",
                    grid: "gap-3",
                    dayName: "text-sm h-10",
                    cell: "text-lg",
                    yearGrid: "grid-cols-4 gap-4",
                    yearCell: "text-lg py-4",
                    radius: "rounded-xl",
                },
            }
            const s = sizeStyles[size]

            // --- Render Helpers ---

            const renderMonthGrid = (monthOffset: number, isFirst: boolean, isLast: boolean) => {
                const displayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + monthOffset, 1)
                const days = getDaysInMonth(displayDate.getFullYear(), displayDate.getMonth())

                // Calculate effective range end (either confirmed end or hover preview)
                const rangeEnd = (mode === "range" && selectedDates.length === 2)
                    ? selectedDates[1]
                    : (rangeStart && hoveredDate ? hoveredDate : null)

                const label = size === "xs"
                    ? `${MONTHS_SHORT[displayDate.getMonth()]} ${displayDate.getFullYear()}`
                    : `${MONTHS[displayDate.getMonth()]} ${displayDate.getFullYear()}`

                const dayLabels = size === "xs" ? DAYS_SHORT : DAYS

                return (
                    <div className={cn("relative", s.width)}>
                        <div className={cn("flex justify-between items-center", s.header)}>
                            {/* Prev Button - only show on first month */}
                            {isFirst && view === 'days' ? (
                                <button
                                    type="button"
                                    onClick={navigatePrev}
                                    className={cn(
                                        "inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all cursor-pointer",
                                        s.navBtn
                                    )}
                                >
                                    <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            ) : <div className={s.navBtn} />}

                            {/* Month Title */}
                            <button
                                type="button"
                                onClick={() => setView(view === 'days' ? 'months' : view === 'months' ? 'years' : 'days')}
                                className={cn("hover:bg-accent px-2 py-1 rounded transition-colors font-semibold", s.headerTitle)}
                            >
                                {label}
                            </button>

                            {/* Next Button - only show on last month */}
                            {isLast && view === 'days' ? (
                                <button
                                    type="button"
                                    onClick={navigateNext}
                                    className={cn(
                                        "inline-flex items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground active:scale-95 transition-all cursor-pointer",
                                        s.navBtn
                                    )}
                                >
                                    <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            ) : <div className={s.navBtn} />}
                        </div>

                        {/* Day Names */}
                        <div className={cn("grid grid-cols-7 mb-2", s.grid)}>
                            {dayLabels.map((day, i) => (
                                <div key={i} className={cn("flex justify-center items-center text-muted-foreground font-medium", s.dayName)}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Days Grid */}
                        <div className={cn("grid grid-cols-7", s.grid)} role="grid">
                            {days.map((date, index) => {
                                const isCurrentMonth = date.getMonth() === displayDate.getMonth()
                                const isSelected = selectedDates.some(d => isSameDay(d, date))
                                const isRangeStart = rangeStart && isSameDay(date, rangeStart)
                                // A date is effectively the "end" if it's the actual confirmed end OR the hovered end 
                                // (but only if we are currently selecting a range)
                                const isRangeEnd = mode === "range" && rangeEnd && isSameDay(date, rangeEnd)

                                // Check if in range of (start -> end/hover)
                                const inRange = mode === "range" && isInRange(date, rangeStart || selectedDates[0], rangeEnd)

                                const isToday = isSameDay(date, new Date())
                                const isDisabled = disabled || (minDate && date < minDate) || (maxDate && date > maxDate)

                                return (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleSelect(date)}
                                        onMouseEnter={() => setHoveredDate(date)}
                                        onMouseLeave={() => setHoveredDate(null)}
                                        disabled={isDisabled}
                                        className={cn(
                                            "relative p-0 text-center focus-within:relative focus-within:z-20",
                                            "aspect-square w-full flex items-center justify-center transition-all",
                                            s.cell,
                                            s.radius, // Apply base radius
                                            // Base states
                                            !isCurrentMonth && "text-muted-foreground/30",
                                            isCurrentMonth && "text-foreground font-normal",
                                            isToday && !isSelected && "text-accent-foreground bg-accent/30 font-semibold ring-1 ring-inset ring-accent-foreground/20",
                                            isDisabled && "opacity-30 cursor-not-allowed hover:bg-transparent",

                                            // Hover states (only if enabled)
                                            !isDisabled && !isSelected && !inRange && isCurrentMonth && "hover:bg-accent hover:text-accent-foreground",

                                            // Selection states
                                            isSelected && "bg-primary text-primary-foreground hover:bg-primary shadow-sm font-semibold z-10",

                                            // Range styling
                                            (isRangeStart || isRangeEnd) && "bg-primary text-primary-foreground hover:bg-primary shadow-sm font-semibold z-10",
                                            inRange && !isSelected && "bg-accent/40 text-accent-foreground font-medium hover:bg-accent/60",

                                            // Range rounding fix (connect bars)
                                            inRange && "rounded-none",
                                            isRangeStart && rangeEnd && "rounded-r-none",
                                            isRangeEnd && rangeStart && "rounded-l-none",

                                            // Specific case: Start == End (Single day range)
                                            isRangeStart && isRangeEnd && s.radius
                                        )}
                                    >
                                        <time dateTime={date.toISOString().split('T')[0]}>
                                            {date.getDate()}
                                        </time>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            }

            const renderMonths = () => {
                const currentYear = currentMonth.getFullYear()
                return (
                    <div className={cn("grid w-full", s.yearGrid)}>
                        {MONTHS_SHORT.map((month, index) => {
                            const isCurrent = new Date().getMonth() === index && new Date().getFullYear() === currentYear
                            const isSelected = currentMonth.getMonth() === index
                            return (
                                <button
                                    key={month}
                                    type="button"
                                    onClick={() => {
                                        setCurrentMonth(new Date(currentYear, index, 1))
                                        setView('days')
                                    }}
                                    className={cn(
                                        "flex items-center justify-center transition-colors hover:bg-accent rounded-md font-medium",
                                        s.yearCell,
                                        isCurrent && "border border-primary text-primary",
                                        isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                                    )}
                                >
                                    {size === 'xs' ? month.charAt(0) : month}
                                </button>
                            )
                        })}
                    </div>
                )
            }

            const renderYears = () => {
                const bgYear = currentMonth.getFullYear()
                const startYear = bgYear - (bgYear % 12)
                const years = Array.from({ length: 12 }, (_, i) => startYear + i)

                return (
                    <div className={cn("grid w-full", s.yearGrid)}>
                        {years.map((year) => {
                            const isCurrent = new Date().getFullYear() === year
                            const isSelected = currentMonth.getFullYear() === year
                            return (
                                <button
                                    key={year}
                                    type="button"
                                    onClick={() => {
                                        setCurrentMonth(new Date(year, currentMonth.getMonth(), 1))
                                        setView('months')
                                    }}
                                    className={cn(
                                        "flex items-center justify-center transition-colors hover:bg-accent rounded-md font-medium",
                                        s.yearCell,
                                        isCurrent && "border border-primary text-primary",
                                        isSelected && "bg-primary text-primary-foreground hover:bg-primary"
                                    )}
                                >
                                    {year}
                                </button>
                            )
                        })}
                    </div>
                )
            }

            const monthsToRender = Array.from({ length: numberOfMonths }, (_, i) => i)

            return (
                <div
                    ref={ref}
                    className={cn(
                        "bg-background border rounded-lg shadow-sm transition-all duration-200 inline-block relative",
                        s.container,
                        className
                    )}
                    role="application"
                    aria-label="Calendar"
                    {...props}
                >
                    {/* Navigation Overlays */}

                    <div className={cn("flex gap-8 relative")}> {/* Gap between months */}
                        {view === 'days' ? (
                            monthsToRender.map(offset => (
                                <React.Fragment key={offset}>
                                    {renderMonthGrid(offset, offset === 0, offset === numberOfMonths - 1)}
                                </React.Fragment>
                            ))
                        ) : (
                            <div className={cn("w-full", s.width)}>
                                {/* Render View Controls Header */}
                                <div className={cn("flex justify-center items-center mb-4 relative")}>
                                    <div className={cn("font-semibold", s.headerTitle)}>
                                        {view === 'months' ? currentMonth.getFullYear() : `${currentMonth.getFullYear() - (currentMonth.getFullYear() % 12)} - ${currentMonth.getFullYear() - (currentMonth.getFullYear() % 12) + 11}`}
                                    </div>
                                    {/* Navigation for views */}
                                    <div className="absolute inset-0 flex justify-between items-center">
                                        <button onClick={navigatePrev} className={cn("p-1 rounded-md border hover:bg-accent cursor-pointer", s.navBtn, "flex items-center justify-center")}>
                                            <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button onClick={navigateNext} className={cn("p-1 rounded-md border hover:bg-accent cursor-pointer", s.navBtn, "flex items-center justify-center")}>
                                            <svg className={s.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="h-[240px]">
                                    {view === 'months' && renderMonths()}
                                    {view === 'years' && renderYears()}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
        }
    ))

Calendar.displayName = "Calendar"

export { Calendar }
