"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OtpInputProps {
  /** Number of OTP digits */
  length?: number;
  /** Callback when OTP is complete */
  onComplete?: (otp: string) => void;
  /** Callback when value changes */
  onChange?: (value: string) => void;
  /** Current value */
  value?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Auto focus first input */
  autoFocus?: boolean;
  /** Input type (number or password for hidden) */
  type?: "number" | "password";
  className?: string;
}

/**
 * OTP Input component with auto-advance
 *
 * @example
 * const [otp, setOtp] = useState("")
 * <OtpInput
 *   length={6}
 *   value={otp}
 *   onChange={setOtp}
 *   onComplete={(code) => verifyOtp(code)}
 * />
 */
const OtpInput = React.forwardRef<HTMLDivElement, OtpInputProps>(
  (
    {
      length = 6,
      onComplete,
      onChange,
      value = "",
      disabled,
      autoFocus,
      type = "number",
      className,
    },
    ref,
  ) => {
    const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
    const [values, setValues] = React.useState<string[]>(
      value.split("").concat(Array(length - value.length).fill("")),
    );

    React.useEffect(() => {
      const newValues = value
        .split("")
        .concat(Array(length - value.length).fill(""));
      setValues(newValues.slice(0, length));
    }, [value, length]);

    const focusInput = (index: number) => {
      if (index >= 0 && index < length) {
        inputRefs.current[index]?.focus();
      }
    };

    const handleChange = (index: number, inputValue: string) => {
      if (disabled) return;

      // Only allow single digit
      const digit = inputValue.slice(-1);
      if (type === "number" && digit && !/^\d$/.test(digit)) return;

      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);

      const newOtp = newValues.join("");
      onChange?.(newOtp);

      // Auto-advance to next input
      if (digit && index < length - 1) {
        focusInput(index + 1);
      }

      // Check if complete
      if (newOtp.length === length && !newOtp.includes("")) {
        onComplete?.(newOtp);
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
      if (e.key === "Backspace") {
        if (!values[index] && index > 0) {
          focusInput(index - 1);
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        focusInput(index - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        focusInput(index + 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").slice(0, length);

      if (type === "number" && !/^\d+$/.test(pastedData)) return;

      const newValues = pastedData
        .split("")
        .concat(Array(length - pastedData.length).fill(""));
      setValues(newValues.slice(0, length));

      const newOtp = newValues.slice(0, length).join("");
      onChange?.(newOtp);

      if (newOtp.length === length) {
        onComplete?.(newOtp);
      }

      focusInput(Math.min(pastedData.length, length - 1));
    };

    return (
      <div ref={ref} className={cn("flex gap-2", className)}>
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type={type === "password" ? "password" : "text"}
            inputMode="numeric"
            maxLength={1}
            value={values[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={cn(
              "h-12 w-12 rounded-md border border-input bg-transparent text-center text-lg font-semibold shadow-sm transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
    );
  },
);
OtpInput.displayName = "OtpInput";

export { OtpInput };
