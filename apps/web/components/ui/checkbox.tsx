"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
    /**
     * Whether the checkbox is checked
     */
    checked?: boolean
    /**
     * Callback when the checked state changes
     */
    onCheckedChange?: (checked: boolean) => void
    /**
     * Whether the checkbox is disabled
     */
    disabled?: boolean
    /**
     * The default checked state (for uncontrolled mode)
     */
    defaultChecked?: boolean
}

/**
 * Checkbox component with keyboard accessibility
 * 
 * @example
 * const [checked, setChecked] = useState(false)
 * <Checkbox checked={checked} onCheckedChange={setChecked} />
 */
const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
    ({ className, checked: controlledChecked, defaultChecked = false, onCheckedChange, disabled, ...props }, ref) => {
        const [isChecked, setIsChecked] = React.useState(defaultChecked)

        const checked = controlledChecked !== undefined ? controlledChecked : isChecked

        const handleClick = () => {
            if (!disabled) {
                const newChecked = !checked
                if (controlledChecked === undefined) {
                    setIsChecked(newChecked)
                }
                onCheckedChange?.(newChecked)
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
                role="checkbox"
                aria-checked={checked}
                aria-disabled={disabled}
                disabled={disabled}
                ref={ref}
                className={cn(
                    "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    checked && "bg-primary text-primary-foreground",
                    className
                )}
                onClick={handleClick}
                onKeyDown={handleKeyDown}
                {...props}
            >
                {checked && (
                    <svg
                        className="h-full w-full"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                        />
                    </svg>
                )}
            </button>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
