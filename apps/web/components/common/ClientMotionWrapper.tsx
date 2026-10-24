"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

export const ClientMotionWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-16"
    >
      {children}
    </motion.div>
  );
};
