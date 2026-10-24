"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Skeleton loading placeholder
 *
 * @example
 * <Skeleton className="h-4 w-[200px]" />
 *
 * @example
 * // Circle skeleton for avatars
 * <Skeleton className="h-12 w-12 rounded-full" />
 */
const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("animate-pulse rounded-md bg-primary/10", className)}
    {...props}
  />
));
Skeleton.displayName = "Skeleton";

export { Skeleton };
