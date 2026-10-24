"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    /**
     * Whether the switch is on
     */
    checked?: boolean
    /**
     * Callback when the switch state changes
     */
    onCheckedChange?: (checked: boolean) => void
    /**
     * Whether the switch is disabled
     */
    disabled?: boolean
}

/**
 * Switch/Toggle component with keyboard accessibility
 * 
 * @example
 * const [enabled, setEnabled] = useState(false)
 * <Switch checked={enabled} onCheckedChange={setEnabled} />
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ className, checked = false, onCheckedChange, disabled, ...props }, ref) => {
        const handleClick = () => {
            if (!disabled) {
                onCheckedChange?.(!checked)
            }
        }

        const handleKeyDown = (e: React.KeyboardEvent) => {
            if (e.key === " " || e.key === "Enter") {
                e.preventDefault()
                handleClick()
            }
        }

        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-disabled={disabled}
                disabled={disabled}
                ref={ref}
                className={cn(
                    "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
                    checked ? "bg-primary" : "bg-input",
                    className
                )}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                {...props}
            >
                <span
                    className={cn(
                        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform",
                        checked ? "translate-x-4" : "translate-x-0"
                    )}
                />
            </button>
        )
    }
)
Switch.displayName = "Switch"

export { Switch }
