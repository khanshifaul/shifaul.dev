"use client";

import React from "react";
import { motion } from "motion/react";
import { Backgrounds } from "@/components/common/Backgrounds";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <motion.section
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    className="space-y-4"
  >
    <div className="flex items-center gap-4">
      <h2 className="text-sm font-black text-green-600 dark:text-green-500 uppercase tracking-[0.3em] whitespace-nowrap">
        {title}
      </h2>
      <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
    </div>
    <div className="text-xs md:text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 pl-4 border-l border-zinc-200 dark:border-zinc-900">
      {children}
    </div>
  </motion.section>
);

export default function TermsPage() {
  const lastUpdated = "May 07, 2026";

  return (
    <main className="relative font-mono min-h-screen text-zinc-800 dark:text-zinc-400">
      <Backgrounds />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <header className="mb-16 space-y-4">
          <div className="flex items-center gap-3 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            LEGAL_DOCUMENT_v1.0.4
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-950 dark:text-white tracking-tighter">
            TERMS_AND_CONDITIONS
          </h1>
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-200 dark:border-zinc-900 pt-4">
            LAST_MODIFIED: {lastUpdated}
          </div>
        </header>

        {/* Content */}
        <div className="space-y-16">
          <Section title="01_ACCEPTANCE">
            <p>
              By accessing shifaul.dev (the "Website"), you agree to be bound by these Terms and Conditions. 
              If you do not agree with any part of these terms, you are prohibited from using or accessing this site.
            </p>
          </Section>

          <Section title="02_INTELLECTUAL_PROPERTY">
            <p>
              The content on this website, including but not limited to the source code, design elements, animations, 
              images, and text, is the intellectual property of Md Shifaul Islam. 
              You may not reproduce, redistribute, or use any portion of this site for commercial purposes without 
              explicit written consent.
            </p>
          </Section>

          <Section title="03_USER_CONDUCT">
            <p>
              Users are prohibited from attempting to bypass any security measures, including but not limited to 
              reverse-engineering the frontend logic or scraping assets. The website is provided for informational 
              and professional networking purposes only.
            </p>
          </Section>

          <Section title="04_LIABILITY_LIMITS">
            <p>
              Md Shifaul Islam shall not be held liable for any damages (including, without limitation, damages for 
              loss of data or profit) arising out of the use or inability to use the materials on this website. 
              The materials appear "as is" and without warranty of any kind.
            </p>
          </Section>

          <Section title="05_EXTERNAL_LINKS">
            <p>
              This website contains links to third-party platforms (GitHub, LinkedIn, UpWork, etc.). 
              Md Shifaul Islam has not reviewed all of the sites linked to its website and is not responsible for 
              the contents of any such linked site.
            </p>
          </Section>

          <Section title="06_GOVERNING_LAW">
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Bangladesh. 
              You irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </Section>

          <Section title="07_AMENDMENTS">
            <p>
              Md Shifaul Islam may revise these terms at any time without notice. By using this website, you are 
              agreeing to be bound by the then current version of these Terms and Conditions.
            </p>
          </Section>
        </div>

        {/* Footer Prompt */}
        <footer className="mt-24 pt-12 border-t border-zinc-200 dark:border-zinc-900 text-center">
          <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-4">
            END_OF_DOCUMENT
          </div>
          <div className="text-xl md:text-3xl font-black text-green-500 opacity-50 animate-pulse">
            guest@shifaul.dev: ~ $ EXIT_
          </div>
        </footer>
      </div>
    </main>
  );
}
