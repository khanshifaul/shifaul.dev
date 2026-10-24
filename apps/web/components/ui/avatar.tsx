"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const avatarVariants = cva(
    "relative flex shrink-0 overflow-hidden rounded-full",
    {
        variants: {
            size: {
                sm: "h-8 w-8 text-xs",
                default: "h-10 w-10 text-sm",
                lg: "h-12 w-12 text-base",
                xl: "h-16 w-16 text-lg",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
)

type AvatarVariants = VariantProps<typeof avatarVariants>

interface AvatarProps extends AvatarVariants {
    className?: string
    children?: React.ReactNode
}

/**
 * Avatar component with image and fallback
 * 
 * @example
 * <Avatar>
 *   <AvatarImage src="/avatar.jpg" alt="User" />
 *   <AvatarFallback>JD</AvatarFallback>
 * </Avatar>
 */
const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
    ({ className, size, ...props }, ref) => (
        <span
            ref={ref}
            className={cn(avatarVariants({ size, className }))}
            {...props}
        />
    )
)
Avatar.displayName = "Avatar"

interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
    ({ className, onLoadingStatusChange, ...props }, ref) => {
        const [status, setStatus] = React.useState<"loading" | "loaded" | "error">("loading")

        React.useEffect(() => {
            onLoadingStatusChange?.(status)
        }, [status, onLoadingStatusChange])

        return (
            <img
                ref={ref}
                className={cn(
                    "aspect-square h-full w-full object-cover",
                    status === "loading" && "opacity-0",
                    status === "error" && "hidden",
                    className
                )}
                onLoad={() => setStatus("loaded")}
                onError={() => setStatus("error")}
                {...props}
            />
        )
    }
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
    <span
        ref={ref}
        className={cn(
            "flex h-full w-full items-center justify-center rounded-full bg-muted font-medium",
            className
        )}
        {...props}
    />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback, avatarVariants }
