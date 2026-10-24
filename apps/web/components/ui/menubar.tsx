"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Menubar Context
interface MenubarContextValue {
    activeMenu: string | null
    setActiveMenu: (menu: string | null) => void
}

const MenubarContext = React.createContext<MenubarContextValue | null>(null)

function useMenubar() {
    const context = React.useContext(MenubarContext)
    if (!context) {
        throw new Error("useMenubar must be used within a Menubar")
    }
    return context
}

// MenubarMenu Context
interface MenubarMenuContextValue {
    menuId: string
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const MenubarMenuContext = React.createContext<MenubarMenuContextValue | null>(null)

function useMenubarMenu() {
    const context = React.useContext(MenubarMenuContext)
    if (!context) {
        throw new Error("useMenubarMenu must be used within a MenubarMenu")
    }
    return context
}

// Menubar Root
const Menubar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const [activeMenu, setActiveMenu] = React.useState<string | null>(null)

        // Close on outside click
        React.useEffect(() => {
            if (!activeMenu) return
            const handleClick = (e: MouseEvent) => {
                const target = e.target as Element
                if (!target.closest('[data-menubar]')) {
                    setActiveMenu(null)
                }
            }
            document.addEventListener("click", handleClick)
            return () => document.removeEventListener("click", handleClick)
        }, [activeMenu])

        return (
            <MenubarContext.Provider value={{ activeMenu, setActiveMenu }}>
                <div
                    ref={ref}
                    data-menubar
                    className={cn(
                        "flex h-10 items-center space-x-1 rounded-md border bg-background p-1",
                        className
                    )}
                    {...props}
                >
                    {children}
                </div>
            </MenubarContext.Provider>
        )
    }
)
Menubar.displayName = "Menubar"

// MenubarMenu
interface MenubarMenuProps {
    children: React.ReactNode
}

const MenubarMenu = ({ children }: MenubarMenuProps) => {
    const menuId = React.useId()
    const triggerRef = React.useRef<HTMLButtonElement>(null)

    return (
        <MenubarMenuContext.Provider value={{ menuId, triggerRef }}>
            <div className="relative">
                {children}
            </div>
        </MenubarMenuContext.Provider>
    )
}
MenubarMenu.displayName = "MenubarMenu"

// MenubarTrigger
const MenubarTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, _ref) => {
        const { activeMenu, setActiveMenu } = useMenubar()
        const { menuId, triggerRef } = useMenubarMenu()
        const isOpen = activeMenu === menuId

        const handleClick = () => {
            setActiveMenu(isOpen ? null : menuId)
        }

        const handleMouseEnter = () => {
            if (activeMenu && activeMenu !== menuId) {
                setActiveMenu(menuId)
            }
        }

        return (
            <button
                ref={triggerRef}
                className={cn(
                    "flex cursor-default select-none items-center rounded-sm px-3 py-1.5 text-sm font-medium outline-none",
                    "focus:bg-accent focus:text-accent-foreground",
                    isOpen && "bg-accent text-accent-foreground",
                    className
                )}
                onClick={handleClick}
                onMouseEnter={handleMouseEnter}
                {...props}
            >
                {children}
            </button>
        )
    }
)
MenubarTrigger.displayName = "MenubarTrigger"

// MenubarContent
const MenubarContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, _ref) => {
        const { activeMenu, setActiveMenu } = useMenubar()
        const { menuId, triggerRef } = useMenubarMenu()
        const isOpen = activeMenu === menuId
        const [position, setPosition] = React.useState({ top: 0, left: 0 })
        const contentRef = React.useRef<HTMLDivElement>(null)

        React.useEffect(() => {
            if (!isOpen || !triggerRef.current) return
            const rect = triggerRef.current.getBoundingClientRect()
            setPosition({
                top: rect.bottom + 4,
                left: rect.left,
            })
        }, [isOpen, triggerRef])

        // Close on Escape
        React.useEffect(() => {
            if (!isOpen) return
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === "Escape") setActiveMenu(null)
            }
            document.addEventListener("keydown", handleEscape)
            return () => document.removeEventListener("keydown", handleEscape)
        }, [isOpen, setActiveMenu])

        if (!isOpen) return null

        return (
            <div
                ref={contentRef}
                className={cn(
                    "fixed z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
                    "animate-in fade-in-0 slide-in-from-top-2",
                    className
                )}
                style={{
                    top: position.top,
                    left: position.left,
                }}
                {...props}
            >
                {children}
            </div>
        )
    }
)
MenubarContent.displayName = "MenubarContent"

// MenubarItem
interface MenubarItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    inset?: boolean
}

const MenubarItem = React.forwardRef<HTMLButtonElement, MenubarItemProps>(
    ({ className, inset, children, ...props }, ref) => {
        const { setActiveMenu } = useMenubar()

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                    "focus:bg-accent focus:text-accent-foreground hover:bg-accent hover:text-accent-foreground",
                    "disabled:pointer-events-none disabled:opacity-50",
                    inset && "pl-8",
                    className
                )}
                onClick={() => setActiveMenu(null)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
MenubarItem.displayName = "MenubarItem"

// MenubarSeparator
const MenubarSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
    )
)
MenubarSeparator.displayName = "MenubarSeparator"

// MenubarLabel
const MenubarLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
    ({ className, inset, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)}
            {...props}
        />
    )
)
MenubarLabel.displayName = "MenubarLabel"

// MenubarShortcut
const MenubarShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
    <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />
)
MenubarShortcut.displayName = "MenubarShortcut"

export {
    Menubar,
    MenubarMenu,
    MenubarTrigger,
    MenubarContent,
    MenubarItem,
    MenubarSeparator,
    MenubarLabel,
    MenubarShortcut,
}
