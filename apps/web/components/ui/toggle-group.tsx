"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { toggleVariants } from "./toggle"
import { type VariantProps } from "class-variance-authority"

// ToggleGroup Context
interface ToggleGroupContextValue {
    type: "single" | "multiple"
    value: string[]
    onValueChange: (value: string) => void
    variant?: VariantProps<typeof toggleVariants>["variant"]
    size?: VariantProps<typeof toggleVariants>["size"]
}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue | null>(null)

function useToggleGroup() {
    const context = React.useContext(ToggleGroupContext)
    if (!context) {
        throw new Error("useToggleGroup must be used within a ToggleGroup")
    }
    return context
}

// ToggleGroup Props
interface ToggleGroupSingleProps {
    type: "single"
    value?: string
    defaultValue?: string
    onValueChange?: (value: string) => void
}

interface ToggleGroupMultipleProps {
    type: "multiple"
    value?: string[]
    defaultValue?: string[]
    onValueChange?: (value: string[]) => void
}

type ToggleGroupProps = (ToggleGroupSingleProps | ToggleGroupMultipleProps) &
    React.HTMLAttributes<HTMLDivElement> &
    VariantProps<typeof toggleVariants>

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
    ({ className, type, value: controlledValue, defaultValue, onValueChange, variant, size, children, ...props }, ref) => {
        // Handle both single and multiple types
        const [uncontrolledValue, setUncontrolledValue] = React.useState<string[]>(() => {
            if (type === "single") {
                return defaultValue ? [defaultValue as string] : []
            }
            return (defaultValue as string[]) || []
        })

        const value = controlledValue !== undefined
            ? (type === "single" ? [controlledValue as string] : controlledValue as string[])
            : uncontrolledValue

        const handleValueChange = (itemValue: string) => {
            let newValue: string[]

            if (type === "single") {
                // Toggle off if clicking same value, otherwise set new value
                newValue = value.includes(itemValue) ? [] : [itemValue]
                if (controlledValue === undefined) {
                    setUncontrolledValue(newValue)
                }
                ; (onValueChange as ((value: string) => void))?.(newValue[0] || "")
            } else {
                // Toggle item in array
                newValue = value.includes(itemValue)
                    ? value.filter(v => v !== itemValue)
                    : [...value, itemValue]
                if (controlledValue === undefined) {
                    setUncontrolledValue(newValue)
                }
                ; (onValueChange as ((value: string[]) => void))?.(newValue)
            }
        }

        return (
            <ToggleGroupContext.Provider value={{ type, value, onValueChange: handleValueChange, variant, size }}>
                <div
                    ref={ref}
                    role="group"
                    className={cn("flex items-center justify-center gap-1", className)}
                    {...props}
                >
                    {children}
                </div>
            </ToggleGroupContext.Provider>
        )
    }
)
ToggleGroup.displayName = "ToggleGroup"

// ToggleGroupItem
interface ToggleGroupItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = useToggleGroup()
        const pressed = context.value.includes(value)

        return (
            <button
                ref={ref}
                type="button"
                aria-pressed={pressed}
                data-state={pressed ? "on" : "off"}
                className={cn(
                    toggleVariants({ variant: context.variant, size: context.size }),
                    pressed && "bg-accent text-accent-foreground",
                    className
                )}
                onClick={() => context.onValueChange(value)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
