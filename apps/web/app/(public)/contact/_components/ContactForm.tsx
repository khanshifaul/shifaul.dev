"use client";

import { createContactMessage } from "@/lib/actions/contactApi";
import { useState, useEffect } from "react";
import { z } from "zod";
import { motion, AnimatePresence } from "motion/react";
import { useSearchParams } from "next/navigation";

// Zod schema for form validation
const formSchema = z.object({
  name: z.string().min(1, "IDENTIFIER_REQUIRED"),
  email: z.string().email("INVALID_SOURCE_ADDRESS"),
  subject: z.string().min(1, "HEADER_REQUIRED"),
  message: z.string().min(1, "PAYLOAD_REQUIRED"),
});

type FormData = z.infer<typeof formSchema>;

const ContactForm = () => {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [values, setValues] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const messageParam = searchParams.get("message");
    if (messageParam) {
      setValues((prev) => ({ ...prev, message: messageParam, subject: "Hiring Inquiry" }));
    }
  }, [searchParams]);

  const validate = () => {
    const result = formSchema.safeParse(values);
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

  const handleChange = (field: keyof FormData, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setStatus("");

    try {
      const result = await createContactMessage(values);

      if (result.data?.success) {
        setStatus("TRANSMISSION_SUCCESS: Message acknowledged by remote host.");
        setValues({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus("TRANSMISSION_FAILURE: Remote host rejected payload.");
      }
    } catch {
      setStatus("CRITICAL_ERROR: Connection timed out or stream corrupted.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full space-y-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-green-600 dark:text-green-500 font-black text-sm tracking-tighter">[ 02 ]</span>
        <h2 className="text-sm md:text-lg text-zinc-950 dark:text-white font-black tracking-[0.1em] md:tracking-[0.4em] uppercase">SIGNAL_TRANSMISSION</h2>
        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2 group">
            <label className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-[0.3em] group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors flex flex-wrap justify-between gap-2">
              <span>IDENTIFIER</span>
              {errors.name && <span className="text-red-500 animate-pulse tracking-tighter">[ {errors.name} ]</span>}
            </label>
            <input
              type="text"
              placeholder="GUEST_NAME"
              value={values.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full bg-zinc-100/40 dark:bg-zinc-900/40 border outline-none p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-800 transition-all font-bold ${errors.name ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-800 focus:border-green-600/50 dark:focus:border-green-500/50'
                }`}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2 group">
            <label className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-[0.3em] group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors flex flex-wrap justify-between gap-2">
              <span>SOURCE_ADDRESS</span>
              {errors.email && <span className="text-red-500 animate-pulse tracking-tighter">[ {errors.email} ]</span>}
            </label>
            <input
              type="email"
              placeholder="USER@DOMAIN.LOCAL"
              value={values.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={`w-full bg-zinc-100/40 dark:bg-zinc-900/40 border outline-none p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-800 transition-all font-bold ${errors.email ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-800 focus:border-green-600/50 dark:focus:border-green-500/50'
                }`}
            />
          </div>
        </div>

        {/* Subject Field */}
        <div className="space-y-2 group">
          <label className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-[0.3em] group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors flex flex-wrap justify-between gap-2">
            <span>MESSAGE_HEADER</span>
            {errors.subject && <span className="text-red-500 animate-pulse tracking-tighter">[ {errors.subject} ]</span>}
          </label>
          <input
            type="text"
            placeholder="SUBJECT_OF_TRANSMISSION"
            value={values.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            className={`w-full bg-zinc-100/40 dark:bg-zinc-900/40 border outline-none p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-800 transition-all font-bold ${errors.subject ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-800 focus:border-green-600/50 dark:focus:border-green-500/50'
              }`}
          />
        </div>

        {/* Message Field */}
        <div className="space-y-2 group">
          <label className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase tracking-[0.3em] group-focus-within:text-green-600 dark:group-focus-within:text-green-500 transition-colors flex flex-wrap justify-between gap-2">
            <span>PAYLOAD_DATA</span>
            {errors.message && <span className="text-red-500 animate-pulse tracking-tighter">[ {errors.message} ]</span>}
          </label>
          <textarea
            placeholder="WRITE_MESSAGE_BODY_HERE..."
            value={values.message}
            onChange={(e) => handleChange("message", e.target.value)}
            className={`w-full bg-zinc-100/40 dark:bg-zinc-900/40 border outline-none p-4 h-48 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-800 transition-all font-bold resize-none ${errors.message ? 'border-red-500/50' : 'border-zinc-200 dark:border-zinc-800 focus:border-green-600/50 dark:focus:border-green-500/50'
              }`}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full group relative overflow-hidden bg-zinc-950 dark:bg-white hover:bg-green-600 dark:hover:bg-green-500 text-white dark:text-black py-4 font-black uppercase text-[10px] tracking-[0.5em] transition-colors duration-300 disabled:bg-zinc-200 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isSubmitting ? (
              <>
                <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                TRANSMITTING_PACKETS...
              </>
            ) : (
              "EXECUTE_HANDSHAKE"
            )}
          </span>
        </button>

        {/* Status Message */}
        <AnimatePresence>
          {status && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-4 border text-[10px] font-black tracking-widest uppercase text-center ${status.includes("SUCCESS")
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : "bg-red-500/10 border-red-500/30 text-red-500"
                }`}
            >
              {status}
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  );
};

export default ContactForm;
