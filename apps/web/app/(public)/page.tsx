"use client";
import { siteConfig } from "@/config/site.config";
import { motion } from "motion/react";
import Link from "next/link";
import { Backgrounds } from "@/components/common/Backgrounds";

import { Globe } from "@/components/common/Globe";
import { useEffect, useState } from "react";

import { FaTerminal } from "react-icons/fa6";
import { RadarSweep } from "@/components/common/RadarSweep";

const Typewriter = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [currentText, setCurrentText] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 50 + Math.random() * 50);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      className="text-zinc-950 dark:text-white"
    >
      {currentText}
      {index < text.length && <span className="animate-pulse">|</span>}
    </motion.span>
  );
};


export default function Home() {
  return (
    <div className="relative h-full min-h-[calc(100vh-theme(spacing.header-height))] w-full flex items-center justify-center overflow-hidden font-mono text-zinc-600 dark:text-zinc-400">
      <Backgrounds />
      <Globe />
      <RadarSweep />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="container relative z-10 mx-auto px-4 py-12"
      >
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Terminal Header */}
          <div className="flex flex-wrap items-center gap-2 text-zinc-500 dark:text-zinc-600 text-[10px] md:text-xs font-bold tracking-widest">
            <div className="flex gap-1.5 mr-2">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-800"></span>
            </div>
            <span>guest@shifaul.dev: ~ (zsh)</span>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="text-green-500 font-bold">$</span>
              <p aria-hidden="true" className="text-3xl md:text-5xl lg:text-6xl font-black text-zinc-950 dark:text-white tracking-tight">
                <Typewriter text="whoami" />
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="pl-8 space-y-4"
            >
              <h1 className="text-2xl md:text-4xl font-bold leading-tight">
                <span className="text-zinc-500">{"> "}</span>
                <span className="text-zinc-950 dark:text-white">
                  Shifaul Islam
                </span>
                <span className="text-green-500 animate-pulse">_</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 border-l-2 border-green-600 dark:border-green-500/50 text-sm leading-relaxed max-w-2xl">
              <span className="text-green-600 dark:text-green-500 font-bold">$</span> cat intro.txt
              <br />
              <motion.span initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }} className="text-zinc-600 dark:text-zinc-500 mt-3 block">
                {`Welcome to my digital space. Below you'll find the intersection of high-performance code and neural engineering.`}
              </motion.span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-8 pt-8 pl-8"
            >
              <Link
                href={siteConfig.links.about}
                className="group flex flex-col gap-1"
              >
                <span className="text-[10px] text-zinc-500 dark:text-zinc-700 font-bold tracking-widest uppercase">EXECUTE</span>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors group-hover:animate-flicker">
                  <FaTerminal className="text-[10px]" />
                  <span className="text-lg font-bold underline decoration-green-500/30 underline-offset-4 decoration-dashed group-hover:decoration-solid transition-all">know_about_me.sh</span>
                </div>
              </Link>

              <Link
                href={siteConfig.links.contact}
                className="group flex flex-col gap-1"
              >
                <span className="text-[10px] text-zinc-500 dark:text-zinc-700 font-bold tracking-widest uppercase">CONNECT</span>
                <div className="flex items-center gap-2 text-green-600 dark:text-green-500 group-hover:text-green-500 dark:group-hover:text-green-400 transition-colors group-hover:animate-flicker">
                  <FaTerminal className="text-[10px]" /><span className="text-lg font-bold underline decoration-green-500/30 underline-offset-4 decoration-dashed group-hover:decoration-solid transition-all">init_contact.py</span>
                </div>
              </Link>
            </motion.div>
          </div>

          {/* Bottom cursor - Fixed TS Error */}
          <motion.div
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-3 h-6 bg-green-500 mt-12 ml-8 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
          />
        </div>
      </motion.section>
    </div>
  );
}
