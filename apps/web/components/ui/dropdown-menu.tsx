"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import { Slot } from "@/components/ui/slot"

interface DropdownMenuContextValue {
    open: boolean
    onOpenChange: (open: boolean) => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null)

interface DropdownMenuProps {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    defaultOpen?: boolean
    className?: string
}

/**
 * DropdownMenu component with keyboard navigation and proper positioning
 * 
 * @example
 * <DropdownMenu>
 *   <DropdownMenuTrigger asChild>
 *     <Button>Open Menu</Button>
 *   </DropdownMenuTrigger>
 *   <DropdownMenuContent>
 *     <DropdownMenuLabel>My Account</DropdownMenuLabel>
 *     <DropdownMenuSeparator />
 *     <DropdownMenuItem>Profile</DropdownMenuItem>
 *     <DropdownMenuItem>Settings</DropdownMenuItem>
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
function DropdownMenu({ children, open: controlledOpen, onOpenChange, defaultOpen = false, className }: DropdownMenuProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen)
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = onOpenChange || setUncontrolledOpen

    return (
        <DropdownMenuContext.Provider value={{ open, onOpenChange: setOpen, triggerRef }}>
            <div className={cn("relative inline-block text-left", className)}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}


interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    asChild?: boolean
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
    ({ onClick, asChild, children, ...props }, ref) => {
        const context = React.useContext(DropdownMenuContext)
        if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu")

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            onClick?.(e)
            context.onOpenChange(!context.open)
        }

        // Combine refs
        const combinedRef = (node: HTMLButtonElement | null) => {
            (context.triggerRef as any).current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
        }

        if (asChild) {
            // For asChild, we need to manually make sure the ref is passed correctly.
            // Slot handles merging the passed ref with the child's ref.
            // But here we're passing `combinedRef` as the ref to Slot.
        }

        const Comp = asChild ? Slot : "button"

        return (
            <Comp
                ref={combinedRef}
                aria-expanded={context.open}
                aria-haspopup="menu"
                onClick={handleClick}
                {...props}
            >
                {children}
            </Comp>
        )
    }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    /** Alignment relative to trigger: 'start' | 'center' | 'end' */
    align?: 'start' | 'center' | 'end'
    /** Side of trigger to open: 'bottom' | 'top' */
    side?: 'bottom' | 'top'
    /** Offset from trigger in pixels */
    sideOffset?: number
    /** Whether to render in a portal (default: true) */
    portal?: boolean
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, align = 'start', side = 'bottom', sideOffset = 4, portal = true, ...props }, ref) => {
        const context = React.useContext(DropdownMenuContext)
        if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu")
        const contentRef = React.useRef<HTMLDivElement>(null)
        const [position, setPosition] = React.useState({ top: 0, left: 0 })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [currentSide, setCurrentSide] = React.useState(side)

        // Reset scroll on mount/unmount if needed, but mainly we just need a portal container
        const [mounted, setMounted] = React.useState(false)
        React.useEffect(() => {
            setMounted(true)
        }, [])

        React.useEffect(() => {
            const handleClickOutside = (e: MouseEvent) => {
                if (context.open) {
                    const target = e.target as Node
                    const content = contentRef.current
                    const trigger = context.triggerRef.current

                    // Don't close if clicking inside content or trigger
                    if (content?.contains(target) || trigger?.contains(target)) {
                        return
                    }
                    context.onOpenChange(false)
                }
            }

            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape" && context.open) {
                    context.onOpenChange(false)
                }
            }

            const checkPosition = () => {
                if (context.open && contentRef.current && context.triggerRef.current) {
                    const triggerRect = context.triggerRef.current.getBoundingClientRect()
                    const contentRect = contentRef.current.getBoundingClientRect()
                    const viewportHeight = window.innerHeight
                    const viewportWidth = window.innerWidth

                    let top = 0
                    let left = 0
                    let usedSide = side

                    // Vertical positioning logic
                    const spaceBelow = viewportHeight - triggerRect.bottom
                    const spaceAbove = triggerRect.top
                    const neededHeight = contentRect.height + sideOffset

                    if (side === 'bottom') {
                        if (spaceBelow < neededHeight && spaceAbove > neededHeight) {
                            usedSide = 'top'
                        }
                    } else if (side === 'top') {
                        if (spaceAbove < neededHeight && spaceBelow > neededHeight) {
                            usedSide = 'bottom'
                        }
                    }
                    setCurrentSide(usedSide)

                    if (usedSide === 'bottom') {
                        top = triggerRect.bottom + sideOffset
                    } else {
                        top = triggerRect.top - contentRect.height - sideOffset
                    }

                    // Horizontal positioning logic (Alignment)
                    if (align === 'start') {
                        left = triggerRect.left
                    } else if (align === 'end') {
                        left = triggerRect.right - contentRect.width
                    } else {
                        // center
                        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2
                    }

                    // Collision detection / clamping for X axis
                    if (left < 4) left = 4
                    if (left + contentRect.width > viewportWidth - 4) {
                        left = viewportWidth - contentRect.width - 4
                    }

                    setPosition({ top, left })
                }
            }

            if (context.open) {
                // Check position immediately after render cycle
                requestAnimationFrame(checkPosition)
            }

            const timer = setTimeout(() => {
                document.addEventListener("click", handleClickOutside)
            }, 0)
            document.addEventListener("keydown", handleEscape)
            window.addEventListener("resize", checkPosition)
            window.addEventListener("scroll", checkPosition, true)

            return () => {
                clearTimeout(timer)
                document.removeEventListener("click", handleClickOutside)
                document.removeEventListener("keydown", handleEscape)
                window.removeEventListener("resize", checkPosition)
                window.removeEventListener("scroll", checkPosition, true)
            }
        }, [context.open, context, side, sideOffset, align])

        if (!context.open) return null
        if (portal && !mounted) return null

        // Alignment classes are ignored if we use portal/fixed positioning,
        // but kept for non-portal usage if someone opts out.
        const alignmentClasses = {
            start: 'left-0',
            center: 'left-1/2 -translate-x-1/2',
            end: 'right-0',
        }

        const content = (
            <div
                ref={(node) => {
                    (contentRef as any).current = node
                    if (typeof ref === 'function') ref(node)
                    else if (ref) ref.current = node
                }}
                role="menu"
                aria-orientation="vertical"
                className={cn(
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                    "animate-in fade-in-0 zoom-in-95",
                    !portal && "absolute", // Use absolute if not portal
                    !portal && alignmentClasses[align],
                    !portal && (side === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'),
                    portal && "fixed", // Use fixed if portal
                    className
                )}
                style={{
                    top: portal ? position.top : undefined,
                    left: portal ? position.left : undefined,
                    ...props.style
                }}
                {...props}
            />
        )

        if (portal) {
            return createPortal(content, document.body)
        }

        return content
    }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("", className)} {...props} />
))
DropdownMenuGroup.displayName = "DropdownMenuGroup"

const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>
}
DropdownMenuPortal.displayName = "DropdownMenuPortal"

const DropdownMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean; disabled?: boolean; asChild?: boolean; closeOnSelect?: boolean }
>(({ className, inset, disabled, onClick, asChild = false, closeOnSelect = true, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return
        onClick?.(e)
        if (closeOnSelect) {
            context?.onOpenChange(false)
        }
    }

    if (asChild) {
        const child = React.Children.only(props.children) as React.ReactElement<any>
        return React.cloneElement(child, {
            ref,
            className: cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                inset && "pl-8",
                disabled && "pointer-events-none opacity-50",
                className,
                child.props.className
            ),
            onClick: (e: React.MouseEvent<HTMLDivElement>) => {
                handleClick(e)
                child.props.onClick?.(e)
            },
            "data-disabled": disabled || undefined,
            "data-inset": inset || undefined,
            tabIndex: disabled ? -1 : 0,
            ...props,
            children: child.props.children
        })
    }

    return (
        <div
            ref={ref}
            role="menuitem"
            tabIndex={disabled ? -1 : 0}
            aria-disabled={disabled}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer",
                inset && "pl-8",
                disabled && "pointer-events-none opacity-50",
                className
            )}
            onClick={handleClick}
            {...props}
        />
    )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, ...props }, ref) => (
    <div
        ref={ref}
        className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
        {...props}
    />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuCheckboxItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { checked?: boolean; disabled?: boolean }
>(({ className, children, checked, disabled, onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (disabled) return
        onClick?.(e)
        // Checkbox items don't close the menu to allow multiple selections
        e.preventDefault()
        e.stopPropagation()
    }

    return (
        <div
            ref={ref}
            role="menuitemcheckbox"
            aria-checked={checked}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                disabled && "pointer-events-none opacity-50",
                className
            )}
            onClick={handleClick}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                {checked && (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </span>
            {children}
        </div>
    )
})
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioGroup = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }
>(({ className, children, ...props }, ref) => {
    return (
        <div ref={ref} role="group" className={className} {...props}>
            {children}
        </div>
    )
})
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup"

const DropdownMenuRadioItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, disabled, onClick, ...props }, ref) => {
    const context = React.useContext(DropdownMenuContext)

    return (
        <div
            ref={ref}
            role="menuitemradio"
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
            className={cn(
                "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                disabled && "pointer-events-none opacity-50",
                className
            )}
            onClick={(e) => {
                if (disabled) return
                onClick?.(e)
                context?.onOpenChange(false)
            }}
            {...props}
        >
            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-2 w-2 fill-current"
                >
                    <circle cx="12" cy="12" r="10" />
                </svg>
            </span>
            {children}
        </div>
    )
})
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuSub = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => (
    <div ref={ref} {...props} />
))
DropdownMenuSub.displayName = "DropdownMenuSub"

const DropdownMenuSubTrigger = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }
>(({ className, inset, children, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent",
            inset && "pl-8",
            className
        )}
        {...props}
    >
        {children}
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-auto h-4 w-4"
        >
            <path d="m9 18 6-6-6-6" />
        </svg>
    </div>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
            className
        )}
        {...props}
    />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuRadioGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuGroup,
    DropdownMenuPortal,
}
