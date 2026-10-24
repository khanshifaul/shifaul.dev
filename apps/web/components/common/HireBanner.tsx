"use client";

import React from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { FaTerminal } from "react-icons/fa6";

const HireBanner = () => {
  const hireTemplate = `I am interested in collaborating with you on a new project.

Project Type: [e.g. SaaS, E-commerce, AI Integration]
Timeline: [e.g. ASAP, 3 Months]
Budget Range: [Optional]
Brief Description: [Your project vision...]

Looking forward to your response!`;

  const encodedTemplate = encodeURIComponent(hireTemplate);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="w-full bg-zinc-950 dark:bg-black border-b border-green-600/20 dark:border-green-500/20 overflow-hidden transition-colors duration-500"
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-row items-center justify-center gap-4 text-[10px] md:text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-green-500 font-bold hidden sm:inline">guest@shifaul.dev: ~ $</span>
          <span className="text-zinc-400 hidden sm:inline text-[8px] md:text-xs">status --availability</span>
          <span className="bg-green-500/10 text-green-500 px-1.5 md:px-2 py-0.5 rounded border border-green-500/20 animate-pulse text-[8px] md:text-xs">
            [OPEN_FOR_HIRE]
          </span>
        </div>

        <div className="hidden sm:block h-3 w-[1px] bg-zinc-800" />

        <Link
          href={`/contact?message=${encodedTemplate}`}
          className="flex items-center gap-2 text-green-500/80 hover:text-green-500 transition-colors group animate-flicker"
        >
          <FaTerminal className="text-[10px]" />
          <span className="font-bold underline decoration-green-500/30 underline-offset-4 decoration-dashed group-hover:decoration-solid transition-all">
            INIT_HIRE_REQUEST.sh
          </span>
        </Link>
      </div>
    </motion.div>
  );
};

export default HireBanner;
