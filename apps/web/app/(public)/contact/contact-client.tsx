"use client";

import React, { Suspense } from "react";
import ContactForm from "./_components/ContactForm";
import { SocialMediaLinks } from "@/components/common/SocialMediaLinks";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";
import { motion } from "motion/react";
import { RadarSweep } from "@/components/common/RadarSweep";

export default function ContactClient() {
  return (
    <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-mono selection:bg-green-500 selection:text-black">
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-20 border-b border-zinc-900 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-zinc-600 text-[10px] md:text-xs font-bold tracking-widest">
              <div className="flex gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              </div>
              <span>guest@shifaul.dev: ~ (zsh)</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none">
                CONNECT<span className="text-green-500 animate-pulse">_</span>
              </h1>
              <p className="text-zinc-400 dark:text-zinc-600 text-[10px] font-black uppercase tracking-tight md:tracking-[0.4em]">
                [ Protocol: TCP/IP_SIGNAL_TRANSMISSION ]
              </p>
            </div>

            <div className="bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 border-l-2 border-green-600 dark:border-green-500/50 text-sm leading-relaxed max-w-2xl">
              <span className="text-green-600 dark:text-green-500 font-bold">$</span> ssh-keygen -t ed25519 -C "handshake"
              <br />
              <span className="text-zinc-600 dark:text-zinc-500 mt-3 block">
                Establishing a direct secure channel for collaboration, inquiries, or research discussions. All packets are encrypted.
              </span>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 space-y-12">
            <SocialMediaLinks />
          </div>

          <div className="lg:col-span-7">
            <Suspense fallback={<div className="text-zinc-500 animate-pulse font-mono text-xs">SYNCHRONIZING_PARAMETERS...</div>}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
