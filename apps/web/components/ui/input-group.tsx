"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { error?: boolean }
>(({ className, children, error, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex w-full items-center rounded-md",
        "focus-within:ring-1 focus-within:ring-ring",
        error &&
          "focus-within:ring-destructive focus-within:border-destructive",
        // First child: rounded-l only, remove right border if not last
        "[&>*:first-child]:rounded-r-none",
        // Last child: rounded-r only, remove left border if not first
        "[&>*:last-child]:rounded-l-none",
        // Middle children: no rounding
        "[&>*:not(:first-child):not(:last-child)]:rounded-none",
        // Negative margin to merge borders
        "[&>*:not(:first-child)]:-ml-px",
        // Bring hovered element to front
        "[&>*:hover]:z-10",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;
        const element = child as React.ReactElement<{
          className?: string;
          error?: boolean;
        }>;

        // Only pass error to custom components, not DOM elements
        const additionalProps: { className: string; error?: boolean } = {
          className: cn(
            element.props.className,
            "focus-visible:ring-0 focus-visible:ring-offset-0",
            error && "border-destructive focus-visible:ring-destructive",
          ),
        };

        if (typeof element.type !== "string") {
          additionalProps.error = error;
        }

        return React.cloneElement(element, additionalProps);
      })}
    </div>
  );
});
InputGroup.displayName = "InputGroup";

const InputAddon = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { error?: boolean }
>(({ className, children, error, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-9 items-center justify-center rounded-md border border-input bg-muted px-3 text-sm text-muted-foreground shadow-sm",
        error && "border-destructive",
        className,
      )}
      {...props}
    >
      {React.Children.map(children, (child: React.ReactNode) => {
        if (!React.isValidElement(child)) return child;
        const element = child as React.ReactElement<{ className?: string }>;
        return React.cloneElement(element, {
          className: cn(
            element.props.className,
            "focus-visible:ring-0 focus-visible:ring-offset-0",
          ),
        });
      })}
    </div>
  );
});
InputAddon.displayName = "InputAddon";

export { InputGroup, InputAddon };
