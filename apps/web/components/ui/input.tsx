"use client"

import * as React from "react"
import { FiEye, FiEyeOff, FiSearch, FiX } from "react-icons/fi"

import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /**
     * Whether the input is in an error state
     */
    error?: boolean
}

/**
 * Input component with focus states and error styling
 * 
 * Supports special handling for:
 * - type="password": Adds show/hide toggle
 * - type="search": Adds search icon and clear button
 * 
 * @example
 * // Basic usage
 * <Input placeholder="Enter your email" />
 * 
 * // Password with toggle
 * <Input type="password" placeholder="Password" />
 * 
 * // Search with icon and clear
 * <Input type="search" placeholder="Search..." />
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, ...props }, ref) => {
        const [isVisible, setIsVisible] = React.useState(false)
        const [value, setValue] = React.useState(props.value || props.defaultValue || "")
        const isPassword = type === "password"
        const isSearch = type === "search"

        // Handle value changes for search clear functionality
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value)
            props.onChange?.(e)
        }

        const handleClear = () => {
            setValue("")
            // Create a synthetic event to notify parent
            const event = {
                target: { value: "" },
                currentTarget: { value: "" },
            } as React.ChangeEvent<HTMLInputElement>
            props.onChange?.(event)
        }

        // Base input styles
        const baseStyles = cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            isSearch && "pl-9", // Add padding for search icon
            (isPassword || (isSearch && value)) && "pr-9", // Add padding for toggle/clear button
            "[&::-webkit-search-cancel-button]:appearance-none", // Hide native search cancel button
            className
        )

        // For regular inputs, render normally
        if (!isPassword && !isSearch) {
            return (
                <input
                    type={type}
                    className={baseStyles}
                    ref={ref}
                    aria-invalid={error ? "true" : undefined}
                    {...props}
                />
            )
        }

        return (
            <div className="relative">
                {isSearch && (
                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                )}
                <input
                    type={isPassword ? (isVisible ? "text" : "password") : type}
                    className={baseStyles}
                    ref={ref}
                    aria-invalid={error ? "true" : undefined}
                    {...props}
                    onChange={handleChange}
                    value={props.value !== undefined ? props.value : value}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setIsVisible(!isVisible)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                        {isVisible ? (
                            <FiEyeOff className="h-4 w-4" aria-hidden="true" />
                        ) : (
                            <FiEye className="h-4 w-4" aria-hidden="true" />
                        )}
                        <span className="sr-only">
                            {isVisible ? "Hide password" : "Show password"}
                        </span>
                    </button>
                )}
                {isSearch && value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                    >
                        <FiX className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Clear search</span>
                    </button>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
