"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

type SpinnerVariants = VariantProps<typeof spinnerVariants>;

interface LoadingSpinnerProps extends SpinnerVariants {
  className?: string;
  /** Accessible label for screen readers */
  label?: string;
}

/**
 * Loading spinner with size and color variants
 *
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" variant="muted" />
 * <LoadingSpinner size="sm" label="Submitting..." />
 */
const LoadingSpinner = React.forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  ({ className, size, variant, label = "Loading" }, ref) => (
    <svg
      ref={ref}
      className={cn(spinnerVariants({ size, variant, className }))}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label={label}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  ),
);
LoadingSpinner.displayName = "LoadingSpinner";

interface LoadingOverlayProps extends SpinnerVariants {
  className?: string;
  children?: React.ReactNode;
  /** Whether to show the loading state */
  loading?: boolean;
  /** Text to display below spinner */
  text?: string;
}

/**
 * Full overlay loading state
 *
 * @example
 * <LoadingOverlay loading={isLoading}>
 *   <YourContent />
 * </LoadingOverlay>
 */
const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { className, children, loading = true, text, size = "lg", variant },
    ref,
  ) => {
    if (!loading) return <>{children}</>;

    return (
      <div ref={ref} className={cn("relative", className)}>
        {children && (
          <div className="opacity-50 pointer-events-none">{children}</div>
        )}
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80">
          <LoadingSpinner size={size} variant={variant} />
          {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
        </div>
      </div>
    );
  },
);
LoadingOverlay.displayName = "LoadingOverlay";

export { LoadingSpinner, LoadingOverlay, spinnerVariants };
