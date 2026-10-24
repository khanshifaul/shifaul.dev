"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const imageVariants = cva("", {
  variants: {
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-md",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
    objectFit: {
      cover: "object-cover",
      contain: "object-contain",
      fill: "object-fill",
      none: "object-none",
    },
  },
  defaultVariants: {
    rounded: "default",
    objectFit: "cover",
  },
});

type ImageVariants = VariantProps<typeof imageVariants>;

interface ImageProps
  extends
    Omit<React.ImgHTMLAttributes<HTMLImageElement>, "onLoad" | "onError">,
    ImageVariants {
  /** Fallback content or URL when image fails to load */
  fallback?: React.ReactNode | string;
  /** Show skeleton loading state */
  showSkeleton?: boolean;
  /** Aspect ratio (width/height) */
  aspectRatio?: number;
}

/**
 * Enhanced Image with loading states and fallback
 *
 * @example
 * <Image src="/photo.jpg" alt="Photo" aspectRatio={16/9} />
 * <Image src="/avatar.jpg" alt="User" rounded="full" fallback="JD" />
 */
const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      className,
      src,
      alt,
      fallback,
      showSkeleton = true,
      aspectRatio,
      rounded,
      objectFit,
      style,
      ...props
    },
    ref,
  ) => {
    const [status, setStatus] = React.useState<"loading" | "loaded" | "error">(
      "loading",
    );

    React.useEffect(() => {
      setStatus("loading");
    }, [src]);

    const containerStyle: React.CSSProperties = aspectRatio
      ? { paddingBottom: `${100 / aspectRatio}%`, ...style }
      : style || {};

    // Render fallback
    if (status === "error" && fallback) {
      if (typeof fallback === "string") {
        // If fallback is a string, check if it's a URL or initials
        if (fallback.startsWith("http") || fallback.startsWith("/")) {
          return (
            <img
              ref={ref}
              src={fallback}
              alt={alt}
              className={cn(imageVariants({ rounded, objectFit }), className)}
              style={style}
              {...props}
            />
          );
        }
        // Initials fallback
        return (
          <div
            className={cn(
              "flex items-center justify-center bg-muted text-muted-foreground font-medium",
              imageVariants({ rounded }),
              className,
            )}
            style={containerStyle}
          >
            {fallback}
          </div>
        );
      }
      return <>{fallback}</>;
    }

    return (
      <div
        className={cn("relative overflow-hidden", aspectRatio && "w-full")}
        style={
          aspectRatio ? { paddingBottom: `${100 / aspectRatio}%` } : undefined
        }
      >
        {/* Skeleton */}
        {status === "loading" && showSkeleton && (
          <div
            className={cn(
              "absolute inset-0 animate-pulse bg-muted",
              imageVariants({ rounded }),
            )}
          />
        )}

        <img
          ref={ref}
          src={src}
          alt={alt}
          className={cn(
            imageVariants({ rounded, objectFit }),
            aspectRatio && "absolute inset-0 h-full w-full",
            status === "loading" && "opacity-0",
            status === "loaded" &&
              "opacity-100 transition-opacity duration-300",
            className,
          )}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          {...props}
        />
      </div>
    );
  },
);
Image.displayName = "Image";

export { Image, imageVariants };
