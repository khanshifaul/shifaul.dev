"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SearchProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "onChange"
> {
  /** Callback when search value changes */
  onSearch?: (value: string) => void;
  /** Debounce delay in ms */
  debounceMs?: number;
  /** Show clear button */
  showClear?: boolean;
  /** Loading state */
  loading?: boolean;
}

/**
 * Search input with optional debounce and clear button
 *
 * @example
 * <Search
 *   placeholder="Search..."
 *   onSearch={(value) => fetchResults(value)}
 *   debounceMs={300}
 * />
 */
const Search = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      onSearch,
      debounceMs = 0,
      showClear = true,
      loading,
      defaultValue = "",
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = React.useState(String(defaultValue));
    const debounceRef = React.useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);

      if (debounceMs > 0) {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          onSearch?.(newValue);
        }, debounceMs);
      } else {
        onSearch?.(newValue);
      }
    };

    const handleClear = () => {
      setValue("");
      onSearch?.("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleClear();
      }
    };

    React.useEffect(() => {
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, []);

    return (
      <div className={cn("relative", className)}>
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        <input
          ref={ref}
          type="search"
          role="searchbox"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-10 py-2 text-sm shadow-sm transition-colors",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-webkit-search-cancel-button]:appearance-none",
          )}
          {...props}
        />

        {/* Loading or Clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <svg
              className="h-4 w-4 animate-spin text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
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
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          ) : showClear && value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>
    );
  },
);
Search.displayName = "Search";

export { Search };
