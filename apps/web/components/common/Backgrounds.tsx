"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAnimationFrame } from "motion/react";

// ─── CRT Flicker Engine ────────────────────────────────────────────────────────
const GLITCH_BARS = 5;

type GlitchBar = {
  top: number;       // % from top
  height: number;    // px height
  offsetX: number;   // horizontal tear px
  opacity: number;   // 0-1
  ttl: number;       // seconds remaining
};

function spawnBar(): GlitchBar {
  return {
    top: Math.random() * 100,
    height: 1 + Math.random() * 4,
    offsetX: (Math.random() - 0.5) * 6,
    opacity: 0.03 + Math.random() * 0.06,
    ttl: 0.04 + Math.random() * 0.12,
  };
}

const CRTFlicker: React.FC = () => {
  const barsRef = useRef<GlitchBar[]>(
    Array.from({ length: GLITCH_BARS }, spawnBar)
  );
  const rollRef = useRef(0);             // rolling scanline band position
  const flickerRef = useRef(0);          // global brightness pulse
  const lastT = useRef<number | null>(null);
  const cooldownRef = useRef(0);         // time until next glitch burst

  const [frame, setFrame] = useState({
    bars: barsRef.current,
    roll: 0,
    flicker: 0,
  });

  useAnimationFrame((time) => {
    const dt = lastT.current === null ? 0 : (time - lastT.current) / 1000;
    lastT.current = time;

    // ── Rolling scanline band (slow vertical sweep) ───────────────────────
    rollRef.current = (rollRef.current + 18 * dt) % 120; // 120% so it exits fully

    // ── Global brightness flicker ─────────────────────────────
    const t = time / 1000;
    flickerRef.current =
      0.008 +
      Math.sin(t * 7.3) * 0.004 +
      Math.sin(t * 13.7) * 0.003 +
      Math.sin(t * 31.1) * 0.002 +
      // occasional bright spike
      (Math.sin(t * 2.1) > 0.97 ? 0.02 : 0);

    // ── Horizontal glitch bars ────────────────────────────────────────────
    const bars = barsRef.current;
    cooldownRef.current -= dt;

    for (let i = 0; i < bars.length; i++) {
      bars[i].ttl -= dt;
      if (bars[i].ttl <= 0 && cooldownRef.current <= 0) {
        bars[i] = spawnBar();
        // After spawning a burst, brief cooldown before next
        if (Math.random() < 0.3) cooldownRef.current = 0.8 + Math.random() * 2;
      }
      // Fade out near end of life
      if (bars[i].ttl < 0.03) {
        bars[i].opacity *= 0.85;
      }
    }

    setFrame({
      bars: [...bars],
      roll: rollRef.current,
      flicker: flickerRef.current,
    });
  });

  return (
    <>
      {/* ── Rolling scanline band ──────────────────────────────────────── */}
      <div
        className="absolute inset-x-0 pointer-events-none z-50"
        style={{
          top: `${frame.roll - 10}%`,
          height: "10%",
          background:
            "linear-gradient(to bottom, transparent, rgba(16,185,129,0.025) 40%, rgba(16,185,129,0.04) 50%, rgba(16,185,129,0.025) 60%, transparent)",
        }}
      />

      {/* ── Horizontal glitch tear bars ────────────────────────────────── */}
      {frame.bars.map((bar, i) =>
        bar.ttl > 0 ? (
          <div
            key={`glitch-${i}`}
            className="absolute inset-x-0 pointer-events-none z-50"
            style={{
              top: `${bar.top}%`,
              height: `${bar.height}px`,
              transform: `translateX(${bar.offsetX}px)`,
              background: `linear-gradient(90deg, transparent 0%, rgba(var(--accent-rgb),${bar.opacity}) 20%, rgba(var(--accent-rgb),${bar.opacity * 1.5}) 50%, rgba(var(--accent-rgb),${bar.opacity}) 80%, transparent 100%)`,
              mixBlendMode: "var(--glitch-blend)" as any,
            }}
          />
        ) : null
      )}

      {/* ── Global brightness flicker ──────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: `rgba(var(--accent-rgb),${frame.flicker})`,
          mixBlendMode: "var(--glitch-blend)" as any,
        }}
      />

      {/* ── Phosphor afterglow ───────────────── */}
      <div
        className="absolute inset-x-0 bottom-0 h-[30%] pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(var(--accent-rgb),0.012), transparent)",
          opacity: 0.5 + Math.sin(Date.now() / 4000) * 0.3,
        }}
      />
    </>
  );
};

// ─── Main Background ──────────────────────────────────────────────────────────

export const Backgrounds = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[var(--bg-color)] transition-colors duration-500">
      {/* Sharp Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Terminal Glow */}
      <div
        className="absolute inset-0 opacity-[var(--glow-opacity)] transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at center, rgba(var(--accent-rgb),1) 0%, transparent 70%)`
        }}
      />




      {/* CRT Flicker Effect */}
      {isMounted && <CRTFlicker />}
    </div>
  );
};
