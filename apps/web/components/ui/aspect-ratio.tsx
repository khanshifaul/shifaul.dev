"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The aspect ratio (width / height)
   * @default 1
   */
  ratio?: number;
}

/**
 * AspectRatio component to maintain consistent dimensions
 *
 * @example
 * // 16:9 video aspect ratio
 * <AspectRatio ratio={16 / 9}>
 *   <img src="..." className="object-cover w-full h-full" />
 * </AspectRatio>
 *
 * @example
 * // Square
 * <AspectRatio ratio={1}>
 *   <div className="bg-muted" />
 * </AspectRatio>
 */
const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ className, ratio = 1, style, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{
        paddingBottom: `${100 / ratio}%`,
        ...style,
      }}
      {...props}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  ),
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
