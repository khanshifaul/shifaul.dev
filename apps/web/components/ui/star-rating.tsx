"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  /** Current rating value */
  value?: number;
  /** Max number of stars */
  max?: number;
  /** Callback when rating changes */
  onValueChange?: (value: number) => void;
  /** Whether rating is readonly */
  readonly?: boolean;
  /** Size of stars */
  size?: "sm" | "default" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",
  default: "h-5 w-5",
  lg: "h-6 w-6",
};

/**
 * Star rating component
 *
 * @example
 * const [rating, setRating] = useState(0)
 * <StarRating value={rating} onValueChange={setRating} />
 *
 * @example
 * <StarRating value={4.5} readonly />
 */
const StarRating = React.forwardRef<HTMLDivElement, StarRatingProps>(
  (
    {
      value = 0,
      max = 5,
      onValueChange,
      readonly = false,
      size = "default",
      className,
    },
    ref,
  ) => {
    const [hoverValue, setHoverValue] = React.useState<number | null>(null);

    const displayValue = hoverValue !== null ? hoverValue : value;

    const handleClick = (starValue: number) => {
      if (!readonly) {
        onValueChange?.(starValue);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent, starValue: number) => {
      if (readonly) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onValueChange?.(starValue);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onValueChange?.(Math.min(value + 1, max));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        onValueChange?.(Math.max(value - 1, 0));
      }
    };

    return (
      <div
        ref={ref}
        role="radiogroup"
        aria-label={`Rating: ${value} out of ${max} stars`}
        className={cn("inline-flex gap-0.5", className)}
        onMouseLeave={() => setHoverValue(null)}
      >
        {Array.from({ length: max }).map((_, index) => {
          const starValue = index + 1;
          const isFilled = displayValue >= starValue;
          const isHalfFilled =
            !isFilled && displayValue > index && displayValue < starValue;

          return (
            <button
              key={index}
              type="button"
              role="radio"
              aria-checked={value >= starValue}
              aria-label={`${starValue} star${starValue > 1 ? "s" : ""}`}
              disabled={readonly}
              tabIndex={
                readonly
                  ? -1
                  : starValue === Math.ceil(value) ||
                      (value === 0 && starValue === 1)
                    ? 0
                    : -1
              }
              className={cn(
                "relative focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded",
                !readonly &&
                  "cursor-pointer hover:scale-110 transition-transform",
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => !readonly && setHoverValue(starValue)}
              onKeyDown={(e) => handleKeyDown(e, starValue)}
            >
              {/* Empty star */}
              <svg
                className={cn(sizeClasses[size], "text-muted-foreground/30")}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>

              {/* Filled star overlay */}
              <svg
                className={cn(
                  sizeClasses[size],
                  "absolute inset-0 text-yellow-400 transition-opacity",
                  isFilled
                    ? "opacity-100"
                    : isHalfFilled
                      ? "opacity-50"
                      : "opacity-0",
                )}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          );
        })}
      </div>
    );
  },
);
StarRating.displayName = "StarRating";

export { StarRating };
