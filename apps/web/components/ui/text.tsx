"use client";
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textVariants = cva("", {
  variants: {
    variant: {
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
      h2: "scroll-m-20 text-3xl font-semibold tracking-tight",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      h5: "scroll-m-20 text-lg font-semibold tracking-tight",
      h6: "scroll-m-20 text-base font-semibold tracking-tight",
      p: "leading-7 [&:not(:first-child)]:mt-6",
      lead: "text-xl text-muted-foreground",
      large: "text-lg font-semibold",
      small: "text-sm font-medium leading-none",
      muted: "text-sm text-muted-foreground",
      code: "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
    },
  },
  defaultVariants: {
    variant: "p",
  },
});

type TextVariants = VariantProps<typeof textVariants>;

interface TextProps extends TextVariants {
  className?: string;
  children?: React.ReactNode;
  as?: "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "label";
}

/**
 * Text component for typography
 *
 * @example
 * // As a heading
 * <Text as="h1" variant="h1">Page Title</Text>
 *
 * // Using heading styles on a different element
 * <Text as="span" variant="h2">Styled as H2</Text>
 *
 * // Muted text
 * <Text variant="muted">Secondary information</Text>
 */
const Text = React.forwardRef<HTMLElement, TextProps>(
  ({ as: Component = "p", className, variant, ...props }, ref) => {
    return (
      <Component
        ref={ref as any}
        className={cn(textVariants({ variant }), className)}
        {...props}
      />
    );
  },
);
Text.displayName = "Text";

export { Text, textVariants };
