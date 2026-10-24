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
import { register } from "@/lib/actions/authAPi";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import * as z from "zod";

const emailSignUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your password"),
    terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignUpValues = z.infer<typeof emailSignUpSchema>;

export default function SignUp() {
  const router = useRouter();
  const dispatch = useDispatch();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitSuccessful, setIsSubmitSuccessful] = useState(false);

  const [values, setValues] = useState<SignUpValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const result = emailSignUpSchema.safeParse(values);
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

  const handleChange = (field: keyof SignUpValues, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
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
      await register(
        {
          name: values.name,
          email: values.email,
          password: values.password,
        },
        dispatch
      );

      setIsSubmitSuccessful(true);
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error) {
        alert(error.message);
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
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center space-y-4 p-4">
          <Logo />
          <CardTitle className="text-3xl font-bold text-foreground">
            {"Create Your Account"}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Join our community today!
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          {!loading && isSubmitSuccessful ? (
            <div className="text-center space-y-4">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg">
                <h3 className="font-semibold text-lg">Account Created!</h3>
                <p>Please check your email to verify your account.</p>
              </div>
              <Button
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => router.push("/sign-in")}
              >
                Go to Sign In
              </Button>
            </div>
          ) : (
            <>
              <SocialLogin />

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">or</span>
                </div>
              </div>

              <form onSubmit={onSubmit} className="space-y-4">
                <FormField
                  label="Full Name"
                  htmlFor="name"
                  error={errors.name}
                >
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={values.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Email"
                  htmlFor="email"
                  error={errors.email}
                >
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="email"
                      placeholder="john@example.com"
                      className="pl-10"
                      value={values.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                    />
                  </div>
                </FormField>

                <FormField
                  label="Password"
                  htmlFor="password"
                  error={errors.password}
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
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </FormField>

                <FormField
                  label="Confirm Password"
                  htmlFor="confirmPassword"
                  error={errors.confirmPassword}
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
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </FormField>

                <FormField
                  error={errors.terms}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={values.terms}
                      onCheckedChange={(checked) => handleChange("terms", !!checked)}
                      className="cursor-pointer"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Accept{" "}
                      <Link
                        href="/terms"
                        className="underline text-primary hover:text-primary/80"
                      >
                        terms and conditions
                      </Link>
                    </label>
                  </div>
                </FormField>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2 rounded-lg transition-all cursor-pointer"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </>
          )}
        </CardContent>
        {!isSubmitSuccessful && (
          <CardFooter>
            <div className="flex justify-center w-full border-t border-border pt-4">
              <div className="w-full text-center text-sm text-muted-foreground">
                {"Already have an account? "}
                <Link
                  href="/sign-in"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
}
