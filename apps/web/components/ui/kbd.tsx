"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  /** Array of keys to display (e.g., ["Ctrl", "K"]) */
  keys?: string[];
}

/**
 * Kbd - Keyboard key display component
 *
 * Usage:
 * <Kbd>⌘</Kbd>
 * <Kbd keys={["Ctrl", "Shift", "P"]} />
 */
const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ className, children, keys, ...props }, ref) => {
    // If keys array is provided, render each key
    if (keys && keys.length > 0) {
      return (
        <span className="inline-flex items-center gap-1">
          {keys.map((key, index) => (
            <React.Fragment key={index}>
              <kbd
                ref={index === 0 ? ref : undefined}
                className={cn(
                  "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
                  className,
                )}
                {...props}
              >
                {key}
              </kbd>
              {index < keys.length - 1 && (
                <span className="text-muted-foreground text-xs">+</span>
              )}
            </React.Fragment>
          ))}
        </span>
      );
    }

    // Single key rendering
    return (
      <kbd
        ref={ref}
        className={cn(
          "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </kbd>
    );
  },
);
Kbd.displayName = "Kbd";

export { Kbd };
