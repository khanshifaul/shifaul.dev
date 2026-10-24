"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { subscribeNewsletter } from "@/lib/actions/newsletterApi";
import { useState } from "react";
import { FaArrowRight } from "react-icons/fa6";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address.");

const NewsletterForm = () => {
  const [isSubmitted, setIsSubmitted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const validate = () => {
    const result = emailSchema.safeParse(email);
    if (!result.success) {
      setValidationError(result.error.flatten().formErrors[0]);
      return false;
    }
    setValidationError(null);
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      setError(null);
      setIsSubmitted(null);

      console.log('Subscribing newsletter via:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api');

      // Execute the REST API call
      const result = await subscribeNewsletter({
        email: email,
      });

      // Handle success
      if (result.data?.success) {
        setIsSubmitted(true);
        setEmail(""); // Reset the form after successful submission
      } else {
        setError(result.data?.message || "Failed to subscribe");
        setIsSubmitted(false);
      }
    } catch (err) {
      // Handle error
      console.error("Newsletter subscription error:", err);
      setError(err instanceof Error ? err.message : "Failed to subscribe to newsletter");
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm border border-zinc-200 dark:border-zinc-900 rounded-sm transition-all duration-500">
      <div className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-zinc-950 dark:text-white flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 animate-pulse"></div>
        SUBSCRIBE_TO_FEED
      </div>
      <form
        onSubmit={onSubmit}
        className="flex items-start gap-2"
      >
        <div className="flex-1">
          <Input
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (validationError) setValidationError(null);
            }}
            type="email"
            placeholder="ACCESS_NODE@EMAIL.COM"
            className="w-full bg-zinc-50 dark:bg-zinc-950/50 border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 rounded-none h-10 font-mono text-xs focus:ring-1 focus:ring-green-500/50"
            maxLength={255}
            required
            disabled={loading}
            aria-label="Email address"
          />
          {validationError && (
            <p className="text-[10px] text-red-500 mt-2 font-black uppercase tracking-tighter">{validationError}</p>
          )}
        </div>
        <Button
          type="submit"
          className="h-10 w-10 bg-zinc-950 dark:bg-green-500 text-white dark:text-black rounded-none hover:bg-zinc-800 dark:hover:bg-green-400 transition-colors shrink-0 disabled:opacity-50"
          disabled={loading}
          aria-label="Subscribe"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent animate-spin rounded-full"></div>
          ) : (
            <FaArrowRight className="w-4 h-4" />
          )}
        </Button>
      </form>
      {isSubmitted === true && (
        <div className="mt-4 text-[10px] text-green-600 dark:text-green-400 font-black uppercase tracking-widest" aria-label="Email Form success">
          SUCCESS: CONNECTION_ESTABLISHED.
        </div>
      )}
      {isSubmitted === false && (
        <div className="mt-4 text-[10px] text-red-500 font-black uppercase tracking-widest" aria-label="Email Form failure">
          ERROR: HANDSHAKE_FAILED.
        </div>
      )}
      {error && (
        <div className="mt-2 text-[10px] text-red-500/60 font-black uppercase tracking-tighter" aria-label="API error">
          [{error.toUpperCase()}]
        </div>
      )}
    </div>
  );
};

export default NewsletterForm;
