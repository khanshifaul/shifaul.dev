"use client";

import SocialLogin from "@/components/auth/SocialLogin";
import Logo from "@/components/common/Logo";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/actions/authAPi";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import * as z from "zod";

const emailSignInSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type SignInValues = z.infer<typeof emailSignInSchema>;

export default function SignIn() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [showPassword] = useState(false);

  const [values, setValues] = useState<SignInValues>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const result = emailSignInSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleChange = (field: keyof SignInValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const result = await login(
        {
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        },
        dispatch
      );

      if (result.data?.user) {
        const user = result.data.user;
        const isAdmin = user.roles?.some(role => role.toUpperCase() === "ADMIN");

        if (isAdmin) {
          router.push("/admin");
        } else {
          // Provide a default callbackUrl if none exists
          const callbackUrl = new URLSearchParams(window.location.search).get("callbackUrl");
          router.push(callbackUrl || "/");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          toast.error("Network error: Unable to connect to server.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("An unexpected error occurred during login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <Card className={cn("max-w-md w-full shadow-xl rounded-2xl")}>
        <CardHeader className="flex flex-col items-center space-y-4 p-4">
          <Logo />
          <CardTitle className="text-3xl font-bold text-foreground">
            {"Welcome Back!"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            {"Unlock your account with ease."}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="text-center space-y-4">

            <SocialLogin />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">or</span>
              </div>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <FormField
              label="Email"
              htmlFor="email"
              error={errors.email}
            >
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
                value={values.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </FormField>

            <div className="space-y-2">

              <FormField
                htmlFor="password"
                label="Password"
                error={errors.password}
              >
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={values.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                />
              </FormField>

              <div className="flex items-center gap-2 mt-2">
                <Checkbox
                  id="remember"
                  checked={values.rememberMe}
                  onCheckedChange={(checked) => handleChange("rememberMe", !!checked)}
                  className="cursor-pointer"
                />
                <Label
                  htmlFor="remember"
                  className="text-sm text-foreground cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all cursor-pointer"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="flex justify-center w-full border-t border-border pt-4">
            <div className="w-full text-center text-sm text-muted-foreground">
              {"Don't have an account? "}
              <Link
                href="/sign-up"
                className="text-primary hover:text-primary/80 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
