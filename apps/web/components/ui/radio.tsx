"use client";
import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value: string;
  onValueChange: (value: string) => void;
  name: string;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue | null>(
  null,
);

interface RadioGroupProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  name?: string;
}

/**
 * RadioGroup component
 *
 * @example
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option1" id="option1" />
 *     <Label htmlFor="option1">Option 1</Label>
 *   </div>
 *   <div className="flex items-center space-x-2">
 *     <RadioGroupItem value="option2" id="option2" />
 *     <Label htmlFor="option2">Option 2</Label>
 *   </div>
 * </RadioGroup>
 */
const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      className,
      value: controlledValue,
      onValueChange,
      defaultValue = "",
      name = "radio-group",
      children,
      ...props
    },
    ref,
  ) => {
    const [uncontrolledValue, setUncontrolledValue] =
      React.useState(defaultValue);

    const value =
      controlledValue !== undefined ? controlledValue : uncontrolledValue;
    const setValue = onValueChange || setUncontrolledValue;

    return (
      <RadioGroupContext.Provider
        value={{ value, onValueChange: setValue, name }}
      >
        <div
          ref={ref}
          role="radiogroup"
          className={cn("grid gap-2", className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  },
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  value: string;
}

const RadioGroupItem = React.forwardRef<HTMLButtonElement, RadioGroupItemProps>(
  ({ className, value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    if (!context)
      throw new Error("RadioGroupItem must be used within RadioGroup");

    const isSelected = context.value === value;

    const handleClick = () => {
      context.onValueChange(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="radio"
        aria-checked={isSelected}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {isSelected && (
          <span className="flex items-center justify-center">
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
        )}
      </button>
    );
  },
);
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
