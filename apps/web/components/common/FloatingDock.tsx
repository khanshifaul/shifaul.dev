"use client";

import { ThemeBtn } from "@/components/common/ThemeToggler";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaGithub,
  FaLinkedin,
  FaShareAlt,
  FaTimes,
  FaWhatsapp,
} from "react-icons/fa";
import { LuSparkles } from "react-icons/lu";
import { ChatPanel, useChatPanel } from "@/components/chat/ChatPanel";
import { cn } from "@/lib/utils";

/**
 * FloatingDock — a single fixed-position dock that combines:
 *   - Theme toggle
 *   - Share / copy link
 *   - GitHub, LinkedIn, WhatsApp
 *   - AI assistant chat trigger
 *
 * Behavior:
 *   - Auto-hides 5s after page load (matches existing FloatingWidget)
 *   - Click the collapsed state to expand
 *   - The AI chat button has an emerald glow to stand out
 *   - Chat panel opens above the dock (bottom-32) so they don't overlap
 */
export function FloatingDock() {
  const [isVisible, setIsVisible] = useState(true);
  const [iconIndex, setIconIndex] = useState(0);
  const pathname = usePathname();
  const chat = useChatPanel();

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setIconIndex(Math.floor(Math.random() * icons.length));
    }
  }, [isVisible]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.origin + pathname);
    alert("Link copied to clipboard!");
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Check this out!",
        url: window.location.origin + pathname,
      });
    } else {
      handleCopy();
    }
  };

  const toggleVisibility = () => setIsVisible((v) => !v);

  return (
    <>
      {/* Chat panel renders above the dock so they never collide */}
      <ChatPanel {...chat} />

      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="dock-expanded"
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 14 }}
            className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none"
          >
            <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-border bg-secondary/90 backdrop-blur-md p-2 shadow-lg">
              <ThemeBtn />
              <DockIconButton onClick={shareLink} aria-label="Share">
                <FaShareAlt className="text-foreground" size={18} />
              </DockIconButton>
              <DockIconButton
                href="https://github.com/khanshifaul"
                aria-label="GitHub"
              >
                <FaGithub className="text-foreground" size={18} />
              </DockIconButton>
              <DockIconButton
                href="https://linkedin.com/in/khan-shifaul"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-foreground" size={18} />
              </DockIconButton>
              <DockIconButton
                href={`https://wa.me/+8801701005355?text=Hi, I saw your portfolio and I'm interested in working with you!`}
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="text-foreground" size={18} />
              </DockIconButton>

              {/* AI Chat — visually distinct (emerald glow) */}
              <button
                type="button"
                onClick={() => chat.setOpen((v) => !v)}
                aria-label={chat.open ? "Close AI assistant" : "Open AI assistant"}
                aria-expanded={chat.open}
                className={cn(
                  "relative grid h-10 w-10 place-items-center rounded-full cursor-pointer",
                  "bg-gradient-to-br from-emerald-500 to-cyan-500 text-zinc-950",
                  "shadow-[0_0_18px_rgba(16,185,129,0.5)] hover:shadow-[0_0_24px_rgba(16,185,129,0.75)]",
                  "transition hover:scale-105",
                )}
              >
                <LuSparkles className="h-5 w-5" />
                {!chat.open && (
                  <>
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </>
                )}
              </button>

              <DockIconButton onClick={toggleVisibility} aria-label="Hide dock">
                <FaTimes className="text-destructive" size={18} />
              </DockIconButton>
            </div>
          </motion.div>
        )}

        {!isVisible && (
          <motion.div
            key="dock-collapsed"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2 pointer-events-none"
          >
            <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-green-500/20 bg-secondary/90 backdrop-blur-md p-2 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <Button
                onClick={toggleVisibility}
                aria-label="Show dock"
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full cursor-pointer group"
              >
                <RandomIcon index={iconIndex} className="text-green-500 group-hover:scale-110 transition-transform" size={18} />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

const icons = [FaGithub, FaLinkedin, FaShareAlt, FaWhatsapp];

function RandomIcon({ index, className, size }: { index: number; className?: string; size?: number }) {
  const Icon = icons[index];
  return <Icon className={className} size={size} />;
}

function DockIconButton({
  href,
  onClick,
  children,
  "aria-label": ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
  "aria-label": string;
}) {
  const className = cn(
    "grid h-10 w-10 place-items-center rounded-full cursor-pointer",
    "bg-muted hover:bg-accent transition-colors",
  );

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={className}
      >
        {children}
      </Link>
    );
  }

  return (
    <Button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      variant="ghost"
      size="icon"
      className={className}
    >
      {children}
    </Button>
  );
}

export default FloatingDock;
