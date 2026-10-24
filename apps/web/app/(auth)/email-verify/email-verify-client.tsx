"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyEmail } from "@/lib/actions/authAPi";
import { motion } from "motion/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

export default function EmailVerifyClient() {
  const router = useRouter();
  const dispatch = useDispatch();
  const _params = useParams<{ token: string }>();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    const verifyEmailHandler = async () => {
      setLoading(true);
      try {
        const token = searchParams.get('token');

        if (!token) {
          setMessage("No verification token found. Please check your email for the verification link.");
          return;
        }

        const result = await verifyEmail(token, dispatch);

        if (result.data) {
          setMessage("Email verified successfully! Redirecting to sign in...");
          setTimeout(() => router.push("/sign-in"), 2000);
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setMessage(
          error instanceof Error
            ? `Email verification failed: ${error.message}`
            : "Email verification failed. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmailHandler();
  }, [router, dispatch, searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-screen"
    >
      <Card className="w-full max-w-md shadow-xl rounded-2xl">
        <CardHeader className="flex flex-col items-center space-y-4 p-4">
          <CardTitle className="text-3xl font-bold text-foreground">
            Email Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-center text-muted-foreground">{message}</p>
          {loading && (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          {!loading && message.includes("successfully") && (
            <Button
              className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/sign-in")}
            >
              Continue to Sign In
            </Button>
          )}
          {!loading && message.includes("failed") && (
            <div className="space-y-2">
              <Button
                className="w-full"
                onClick={() => router.push("/sign-up")}
              >
                Go Back to Sign Up
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push("/sign-in")}
              >
                Try Signing In Instead
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
