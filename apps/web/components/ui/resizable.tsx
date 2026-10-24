"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Resizable Context
interface ResizablePanelGroupContextValue {
    groupId: string
    direction: "horizontal" | "vertical"
    registerPanel: (defaultSize: number, minSize: number, maxSize: number) => number
    getSize: (index: number) => number
    getTotalSize: () => number
    onResize: (handleIndex: number, delta: number) => void
}

const ResizablePanelGroupContext = React.createContext<ResizablePanelGroupContextValue | null>(null)

function useResizablePanelGroup() {
    const context = React.useContext(ResizablePanelGroupContext)
    if (!context) {
        throw new Error("useResizablePanelGroup must be used within a ResizablePanelGroup")
    }
    return context
}

// ResizablePanelGroup
interface ResizablePanelGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    direction?: "horizontal" | "vertical"
    onLayout?: (sizes: number[]) => void
}

interface PanelConfig {
    defaultSize: number
    minSize: number
    maxSize: number
}

const ResizablePanelGroup = React.forwardRef<HTMLDivElement, ResizablePanelGroupProps>(
    ({ className, direction = "horizontal", children, onLayout, ...props }, ref) => {
        const groupId = React.useId()
        const containerRef = React.useRef<HTMLDivElement>(null)
        const [, forceUpdate] = React.useReducer(x => x + 1, 0)

        // Store panel configs and sizes in refs for stable access
        const panelConfigsRef = React.useRef<PanelConfig[]>([])
        const sizesRef = React.useRef<number[]>([])
        const panelCountRef = React.useRef(0)

        // Reset panel count at start of each render
        panelCountRef.current = 0

        const registerPanel = React.useCallback((defaultSize: number, minSize: number, maxSize: number) => {
            const index = panelCountRef.current++

            // Only initialize if not already set
            if (sizesRef.current[index] === undefined) {
                sizesRef.current[index] = defaultSize
                panelConfigsRef.current[index] = { defaultSize, minSize, maxSize }
            }

            return index
        }, [])

        const getSize = React.useCallback((index: number) => {
            return sizesRef.current[index] ?? 50
        }, [])

        const getTotalSize = React.useCallback(() => {
            return sizesRef.current.reduce((sum, s) => sum + s, 0)
        }, [])

        const onResize = React.useCallback((handleIndex: number, delta: number) => {
            const container = containerRef.current
            if (!container) return

            const containerSize = direction === "horizontal"
                ? container.offsetWidth
                : container.offsetHeight

            if (containerSize === 0) return

            const deltaPercent = (delta / containerSize) * 100

            const leftIndex = handleIndex
            const rightIndex = handleIndex + 1
            const sizes = sizesRef.current
            const configs = panelConfigsRef.current

            if (leftIndex >= sizes.length || rightIndex >= sizes.length) return

            const leftSize = sizes[leftIndex]
            const rightSize = sizes[rightIndex]
            const totalSize = leftSize + rightSize

            let newLeftSize = leftSize + deltaPercent
            let newRightSize = rightSize - deltaPercent

            const leftMin = configs[leftIndex]?.minSize ?? 10
            const leftMax = configs[leftIndex]?.maxSize ?? 90
            const rightMin = configs[rightIndex]?.minSize ?? 10
            const rightMax = configs[rightIndex]?.maxSize ?? 90

            // Apply constraints
            if (newLeftSize < leftMin) {
                newLeftSize = leftMin
                newRightSize = totalSize - leftMin
            }
            if (newRightSize < rightMin) {
                newRightSize = rightMin
                newLeftSize = totalSize - rightMin
            }
            if (newLeftSize > leftMax) {
                newLeftSize = leftMax
                newRightSize = totalSize - leftMax
            }
            if (newRightSize > rightMax) {
                newRightSize = rightMax
                newLeftSize = totalSize - rightMax
            }

            sizesRef.current[leftIndex] = newLeftSize
            sizesRef.current[rightIndex] = newRightSize

            // Force re-render to update panel sizes
            forceUpdate()

            // Notify layout changes
            onLayout?.([...sizesRef.current])
        }, [direction, onLayout])

        return (
            <ResizablePanelGroupContext.Provider value={{ groupId, direction, registerPanel, getSize, getTotalSize, onResize }}>
                <div
                    ref={(node) => {
                        containerRef.current = node
                        if (typeof ref === "function") ref(node)
                        else if (ref) ref.current = node
                    }}
                    data-panel-group
                    data-panel-group-id={groupId}
                    data-direction={direction}
                    className={cn(
                        "flex h-full w-full",
                        direction === "horizontal" ? "flex-row" : "flex-col",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </ResizablePanelGroupContext.Provider>
        )
    }
)
ResizablePanelGroup.displayName = "ResizablePanelGroup"

// ResizablePanel
interface ResizablePanelProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultSize?: number
    minSize?: number
    maxSize?: number
}

const ResizablePanel = React.forwardRef<HTMLDivElement, ResizablePanelProps>(
    ({ className, defaultSize = 50, minSize = 10, maxSize = 90, children, style, ...props }, ref) => {
        const { groupId, direction: _direction, registerPanel, getSize, getTotalSize: _getTotalSize } = useResizablePanelGroup()
        const indexRef = React.useRef<number>(-1)

        // Register panel on first render only
        if (indexRef.current === -1) {
            indexRef.current = registerPanel(defaultSize, minSize, maxSize)
        }

        const size = getSize(indexRef.current)
        const _totalSize = _getTotalSize()
        // Convert to actual percentage of total
        // const actualPercent = totalSize > 0 ? (size / totalSize) * 100 : size

        return (
            <div
                ref={ref}
                data-panel
                data-panel-group-id={groupId}
                data-panel-index={indexRef.current}
                className={cn("overflow-hidden", className)}
                style={{
                    ...style,
                    // Use flex-grow with the size as the ratio for smoother resizing
                    flex: `${size} 1 0`,
                }}
                {...props}
            >
                {children}
            </div>
        )
    }
)
ResizablePanel.displayName = "ResizablePanel"

// ResizableHandle
interface ResizableHandleProps extends React.HTMLAttributes<HTMLDivElement> {
    withHandle?: boolean
}

const ResizableHandle = React.forwardRef<HTMLDivElement, ResizableHandleProps>(
    ({ className, withHandle = false, ...props }, ref) => {
        const { direction, onResize } = useResizablePanelGroup()
        const [isDragging, setIsDragging] = React.useState(false)
        const _handleIndexRef = React.useRef<number>(-1)
        const lastPosRef = React.useRef<number>(0)
        const handleRef = React.useRef<HTMLDivElement>(null)

        // Determine handle index from DOM position
        const getHandleIndex = React.useCallback(() => {
            const handle = handleRef.current
            if (!handle) return 0

            const parent = handle.parentElement
            if (!parent) return 0

            let handleCount = 0
            for (const child of Array.from(parent.children)) {
                if (child === handle) break
                if (child.hasAttribute('data-panel-resize-handle')) {
                    handleCount++
                }
            }
            return handleCount
        }, [])

        const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            setIsDragging(true)

            const handleIndex = getHandleIndex()
            const startPos = direction === "horizontal" ? e.clientX : e.clientY
            lastPosRef.current = startPos

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const currentPos = direction === "horizontal" ? moveEvent.clientX : moveEvent.clientY
                const delta = currentPos - lastPosRef.current
                lastPosRef.current = currentPos

                if (delta !== 0) {
                    onResize(handleIndex, delta)
                }
            }

            const handleMouseUp = () => {
                setIsDragging(false)
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
                document.body.style.cursor = ""
                document.body.style.userSelect = ""
            }

            document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize"
            document.body.style.userSelect = "none"
            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }, [direction, onResize, getHandleIndex])

        return (
            <div
                ref={(node) => {
                    handleRef.current = node
                    if (typeof ref === "function") ref(node)
                    else if (ref) ref.current = node
                }}
                data-panel-resize-handle
                data-dragging={isDragging}
                className={cn(
                    "relative flex shrink-0 items-center justify-center bg-border",
                    direction === "horizontal"
                        ? "w-1 cursor-col-resize hover:bg-primary/50 active:bg-primary"
                        : "h-1 cursor-row-resize hover:bg-primary/50 active:bg-primary",
                    isDragging && "bg-primary",
                    className
                )}
                onMouseDown={handleMouseDown}
                {...props}
            >
                {withHandle && (
                    <div
                        className={cn(
                            "z-10 flex items-center justify-center rounded-sm border bg-border",
                            direction === "horizontal" ? "h-4 w-3" : "h-3 w-4"
                        )}
                    >
                        <svg
                            className={cn(
                                "h-2.5 w-2.5 text-muted-foreground",
                                direction === "vertical" && "rotate-90"
                            )}
                            viewBox="0 0 6 10"
                            fill="currentColor"
                        >
                            <circle cx="1" cy="2" r="1" />
                            <circle cx="1" cy="5" r="1" />
                            <circle cx="1" cy="8" r="1" />
                            <circle cx="5" cy="2" r="1" />
                            <circle cx="5" cy="5" r="1" />
                            <circle cx="5" cy="8" r="1" />
                        </svg>
                    </div>
                )}
            </div>
        )
    }
)
ResizableHandle.displayName = "ResizableHandle"

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
