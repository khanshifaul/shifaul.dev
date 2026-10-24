"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi"

import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

/**
 * ThemeSwitcher component for use within a DropdownMenu
 * Toggles between light, dark, and system themes
 * 
 * @example
 * <DropdownMenu>
 *   <DropdownMenuContent>
 *     <ThemeSwitcher />
 *   </DropdownMenuContent>
 * </DropdownMenu>
 */
export function ThemeSwitcher() {
    const { setTheme, theme, resolvedTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        // Cycle: light -> dark -> system -> light
        if (theme === "light") {
            setTheme("dark")
        } else if (theme === "dark") {
            setTheme("system")
        } else {
            setTheme("light")
        }
    }

    const getIcon = () => {
        if (!mounted) {
            return <FiSun className="mr-2 h-4 w-4" />
        }
        if (theme === "system") {
            return <FiMonitor className="mr-2 h-4 w-4" />
        }
        if (resolvedTheme === "dark") {
            return <FiMoon className="mr-2 h-4 w-4" />
        }
        return <FiSun className="mr-2 h-4 w-4" />
    }

    const getLabel = () => {
        if (!mounted) return "Theme"
        if (theme === "system") return "System"
        if (theme === "dark") return "Dark"
        return "Light"
    }

    return (
        <DropdownMenuItem onClick={toggleTheme} closeOnSelect={false}>
            {getIcon()}
            <span>Theme: {getLabel()}</span>
        </DropdownMenuItem>
    )
}
