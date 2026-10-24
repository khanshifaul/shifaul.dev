"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The label for the field
   */
  label?: React.ReactNode;
  /**
   * Helper text description
   */
  description?: React.ReactNode;
  /**
   * Error message
   */
  error?: React.ReactNode;
  /**
   * Whether the field is required (shows asterisk)
   */
  required?: boolean;
  /**
   * The ID of the input element, used for label association
   */
  htmlFor?: string;
}

/**
 * FormField wrapper for consistent label and error placement
 *
 * @example
 * <FormField
 *   label="Email"
 *   description="We'll never share your email."
 *   error={errors.email}
 *   required
 * >
 *   <Input placeholder="user@example.com" />
 * </FormField>
 */
const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      className,
      label,
      description,
      error,
      required,
      htmlFor,
      children,
      ...props
    },
    ref,
  ) => {
    const id = htmlFor || React.useId();

    // Clone child to inject id and error state if it's a valid React element
    const childWithProps = React.isValidElement(children)
      ? React.cloneElement(children as React.ReactElement<any>, {
          id: id,
          error: !!error,
          "aria-describedby": error
            ? `${id}-error`
            : description
              ? `${id}-desc`
              : undefined,
        })
      : children;

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <Label htmlFor={id} required={required}>
            {label}
          </Label>
        )}

        {childWithProps}

        {description && !error && (
          <p id={`${id}-desc`} className="text-[0.8rem] text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p
            id={`${id}-error`}
            className="text-[0.8rem] font-medium text-destructive"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
