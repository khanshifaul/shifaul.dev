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
import { resetPassword } from "@/lib/actions/authAPi";
import { motion } from "motion/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useDispatch } from "react-redux";
import * as z from "zod";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Z]/, "Must include at least one uppercase letter.")
      .regex(/\d/, "Must include at least one number.")
      .regex(/[@$!%*?&]/, "Must include at least one special character."),
    confirmPassword: z.string().min(8, "Confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"],
  });

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams<{ token: string }>();
  const token = params.token;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [values, setValues] = useState<ResetPasswordValues>({
    password: "",
    confirmPassword: "",
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!token) {
      setError(
        "Your reset link is invalid or expired. Please request a new one."
      );
    }
  }, [token]);

  const validate = () => {
    const result = resetPasswordSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setValidationErrors(fieldErrors);
      return false;
    }
    setValidationErrors({});
    return true;
  };

  const handleChange = (field: keyof ResetPasswordValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing token.");
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);
      await resetPassword(
        {
          token: token as string,
          password: values.password,
        },
        dispatch
      );

      router.push("/sign-in");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred.");
      setLoading(false);
    }
  }

  if (!token) {
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
              Reset Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="text-center mt-4">
            <Link href="/sign-in" className="text-primary hover:underline">
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen bg-transparent"
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold text-foreground">
            Reset Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-destructive text-center">{error}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              label="New Password"
              htmlFor="password"
              error={validationErrors.password}
            >
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={values.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  aria-label="New password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </FormField>

            <FormField
              label="Confirm Password"
              htmlFor="confirmPassword"
              error={validationErrors.confirmPassword}
            >
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={values.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  aria-label="Confirm password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </FormField>
            <Button
              type="submit"
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all cursor-pointer"
              disabled={loading}
              aria-label="Reset password"
            >
              {loading ? "Processing..." : "Reset Password"}
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
