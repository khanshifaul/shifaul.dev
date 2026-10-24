"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaVk,
  FaXTwitter,
} from "react-icons/fa6";
const ContactItem = ({ label, value, href, copyValue, isEmail = false }: { label: string; value: string; href: string; copyValue: string; isEmail?: boolean }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleAction = (_e: React.MouseEvent) => {
    navigator.clipboard.writeText(copyValue);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="flex justify-between items-center text-xs group/item py-1">
      <span className="text-zinc-500 font-bold uppercase tracking-tighter shrink-0">{label}</span>
      <div className="relative flex items-center justify-end">
        <AnimatePresence>
          {isCopied && (
            <motion.span
              initial={{ opacity: 0, y: 5, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -5, scale: 0.9 }}
              className="absolute -top-7 right-0 text-[8px] text-green-500 font-black whitespace-nowrap bg-zinc-50 dark:bg-zinc-950 px-2 py-0.5 border border-green-500/30 rounded z-30 shadow-2xl"
            >
              [ COPIED_TO_CLIPBOARD ]
            </motion.span>
          )}
        </AnimatePresence>
        <a
          href={href}
          onClick={handleAction}
          className={`font-black tracking-tight hover:underline underline-offset-4 decoration-green-500/50 transition-colors ${isEmail ? "text-green-600 dark:text-green-500" : "text-zinc-900 dark:text-zinc-200"
            }`}
        >
          {value}
        </a>
      </div>
    </div>
  );
};

export const SocialMediaLinks = () => {
  const links = [
    {
      name: "LINKEDIN",
      href: "https://www.linkedin.com/in/khan-shifaul",
      icon: <FaLinkedin className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "@khan-shifaul",
    },
    {
      name: "GITHUB",
      href: "https://github.com/khanshifaul",
      icon: <FaGithub className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "@khanshifaul",
    },
    {
      name: "X_TWITTER",
      href: "https://twitter.com/khanshifaul",
      icon: <FaXTwitter className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "@khanshifaul",
    },
    {
      name: "DISCORD",
      href: "https://discord.com/khanshifaul",
      icon: <FaDiscord className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "shifaul#0000",
    },
    {
      name: "FACEBOOK",
      href: "https://facebook.com/kh4nsh1f4ul",
      icon: <FaFacebook className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "@kh4nsh1f4ul",
    },
    {
      name: "VKONTAKTE",
      href: "https://vk.com/khanshifaul",
      icon: <FaVk className="text-xl group-hover:text-green-500 transition-colors" />,
      tag: "/khanshifaul",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-4 mb-4">
        <span className="text-green-600 dark:text-green-500 font-black text-sm tracking-tighter">[ 01 ]</span>
        <h2 className="text-sm md:text-lg text-zinc-950 dark:text-white font-black tracking-[0.1em] md:tracking-[0.4em] uppercase">SOCIAL_ENDPOINTS</h2>
        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {links.map((link, index) => (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              href={link.href}
              target="_blank"
              className="group flex items-center justify-between p-4 border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 hover:border-green-600/30 dark:hover:border-green-500/30 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className="text-zinc-500">{link.icon}</div>
                <div className="space-y-1">
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest leading-none">
                    {link.name}
                  </div>
                  <div className="text-xs text-zinc-800 dark:text-zinc-300 font-bold tracking-tight">
                    {link.tag}
                  </div>
                </div>
              </div>
              <div className="text-zinc-300 dark:text-zinc-800 group-hover:text-green-600 dark:group-hover:text-green-500 group-hover:translate-x-1 transition-all text-xs font-black">
                ACCESS_NODE →
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="p-6 border border-zinc-200 dark:border-zinc-900/50 bg-zinc-100/40 dark:bg-zinc-900/10 space-y-4">
        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.3em]">DIRECT_LINES</div>
        <div className="space-y-2">
          <ContactItem
            label="MOBILE"
            value="(+88) 01701005355"
            href="tel:+8801701005355"
            copyValue="+8801701005355"
          />
          <ContactItem
            label="E-MAIL"
            value="connect@shifaul.dev"
            href="mailto:connect@shifaul.dev"
            copyValue="connect@shifaul.dev"
            isEmail
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-500 font-bold uppercase tracking-tighter">LOCATION</span>
            <span className="text-zinc-900 dark:text-zinc-200 font-black tracking-tight">DHAKA, BANGLADESH</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
