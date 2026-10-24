"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/actions/authAPi";
import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import * as z from "zod";

// Validation schema for email input
const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
});

type _ForgotPasswordValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(undefined);

  const validate = () => {
    const result = forgetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.flatten().fieldErrors.email?.[0]);
      return false;
    }
    setError(undefined);
    return true;
  };

  // Handle form submission
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");
      setCanResend(false);

      await forgotPassword(
        {
          email: email,
        },
        dispatch
      );

      setLoading(false);
      setSuccessMessage("Reset email sent. Please check your inbox.");
      setIsSuccess(true);
      setCountdown(60);
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      }
      setCanResend(true);
    }
  }

  // Countdown timer
  useEffect(() => {
    if (countdown === null || countdown === 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Reset canResend when countdown reaches 0
  useEffect(() => {
    if (countdown === 0) {
      setCanResend(true);
      setCountdown(null);
    }
  }, [countdown]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Forgot Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Email Input */}
            <FormField
              label="Email"
              error={error}
            >
              <div className="relative">
                <FaUser
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(undefined);
                  }}
                  aria-label="Enter your email address"
                  required
                  disabled={isSuccess}
                />
              </div>
            </FormField>

            {errorMessage && (
              <motion.p
                className="text-destructive text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {errorMessage}
              </motion.p>
            )}

            {isSuccess && successMessage && (
              <motion.p
                className="text-green-600 dark:text-green-500 text-center mb-4"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                {successMessage}
              </motion.p>
            )}
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all"
              disabled={loading || !canResend}
              aria-label="Reset Password"
            >
              {loading
                ? "Sending..."
                : successMessage
                  ? `Resend after (${countdown})`
                  : "Reset Password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t border-border pt-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              {"Back to "}
              <Link
                href="/sign-in"
                className="text-primary hover:text-primary/80 transition-colors"
                aria-label="Back to sign in"
              >
                Sign In
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
