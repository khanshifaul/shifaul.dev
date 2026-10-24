"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
    value: string[]
    onValueChange: (value: string[]) => void
    type: "single" | "multiple"
    collapsible: boolean
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null)

interface AccordionItemContextValue {
    value: string
    isOpen: boolean
    toggle: () => void
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null)

interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
    type?: "single" | "multiple"
    value?: string[]
    onValueChange?: (value: string[]) => void
    defaultValue?: string[]
    collapsible?: boolean
}

/**
 * Accordion component with single/multiple expand modes
 * 
 * @example
 * <Accordion type="single" collapsible>
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>Section 1</AccordionTrigger>
 *     <AccordionContent>Content 1</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 */
const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
    ({ className, type = "single", value: controlledValue, onValueChange, defaultValue = [], collapsible = false, children, ...props }, ref) => {
        const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)

        const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
        const setValue = onValueChange || setUncontrolledValue

        return (
            <AccordionContext.Provider value={{ value, onValueChange: setValue, type, collapsible }}>
                <div ref={ref} className={cn("", className)} {...props}>
                    {children}
                </div>
            </AccordionContext.Provider>
        )
    }
)
Accordion.displayName = "Accordion"


interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ className, value, children, ...props }, ref) => {
        const context = React.useContext(AccordionContext)
        if (!context) throw new Error("AccordionItem must be used within Accordion")

        const isOpen = context.value.includes(value)

        const toggle = () => {
            if (context.type === "single") {
                // In single mode with collapsible=false, don't allow closing
                if (isOpen && !context.collapsible) return
                context.onValueChange(isOpen ? [] : [value])
            } else {
                context.onValueChange(
                    isOpen
                        ? context.value.filter((v) => v !== value)
                        : [...context.value, value]
                )
            }
        }

        return (
            <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
                <div
                    ref={ref}
                    className={cn("border-b", className)}
                    data-state={isOpen ? "open" : "closed"}
                    {...props}
                >
                    {children}
                </div>
            </AccordionItemContext.Provider>
        )
    }
)
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionItemContext)
    if (!context) throw new Error("AccordionTrigger must be used within AccordionItem")

    return (
        <h3 className="flex">
            <button
                ref={ref}
                type="button"
                aria-expanded={context.isOpen}
                className={cn(
                    "flex flex-1 items-center justify-between py-4 text-sm font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
                    className
                )}
                data-state={context.isOpen ? "open" : "closed"}
                onClick={context.toggle}
                {...props}
            >
                {children}
                <svg
                    className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
        </h3>
    )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
    const context = React.useContext(AccordionItemContext)
    if (!context) throw new Error("AccordionContent must be used within AccordionItem")

    return (
        <div
            ref={ref}
            role="region"
            className={cn(
                "overflow-hidden text-sm",
                context.isOpen ? "animate-accordion-down" : "animate-accordion-up hidden",
                className
            )}
            data-state={context.isOpen ? "open" : "closed"}
            {...props}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
