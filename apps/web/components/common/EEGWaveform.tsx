// components/common/EEGWaveform.tsx
"use client";

import React, { useRef, useState } from "react";
import { useAnimationFrame } from "motion/react";

const W = 600; const H = 60;
const COLOR = "#10b981";
const SPEED = 80; // px/s

export const EEGWaveform: React.FC = () => {
    const offsetRef = useRef(0);
    const lastT = useRef<number | null>(null);
    const [offset, setOffset] = useState(0);

    useAnimationFrame((time) => {
        const dt = lastT.current === null ? 0 : (time - lastT.current) / 1000;
        lastT.current = time;
        offsetRef.current = (offsetRef.current + SPEED * dt) % W;
        setOffset(offsetRef.current);
    });

    // Generate a pseudo-EEG path (sum of sinusoids)
    const points: string[] = [];
    for (let x = -W; x <= W * 2; x += 2) {
        const t = (x + offset) / W;
        const y =
            H / 2 +
            Math.sin(t * Math.PI * 6) * 8 +
            Math.sin(t * Math.PI * 14 + 1) * 4 +
            Math.sin(t * Math.PI * 31 + 2) * 2 +
            // QRS-like spike
            (Math.abs(((t * 5) % 1) - 0.5) < 0.04 ? -22 : 0) +
            (Math.abs(((t * 5) % 1) - 0.56) < 0.025 ? 14 : 0);
        points.push(`${x === -W ? "M" : "L"}${x},${y.toFixed(2)}`);
    }

    return (
        <div
            className="absolute -bottom-4 left-0 right-0 h-[60px] pointer-events-none select-none opacity-[0.15]"
            style={{ overflow: "hidden" }}
        >
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
                <defs>
                    <linearGradient id="eegFade" x1="0" x2="1" y1="0" y2="0">
                        <stop offset="0%" stopColor={COLOR} stopOpacity="0" />
                        <stop offset="15%" stopColor={COLOR} stopOpacity="1" />
                        <stop offset="85%" stopColor={COLOR} stopOpacity="1" />
                        <stop offset="100%" stopColor={COLOR} stopOpacity="0" />
                    </linearGradient>
                    <mask id="eegMask">
                        <rect x="0" y="0" width={W} height={H} fill="url(#eegFade)" />
                    </mask>
                </defs>
                <path
                    d={points.join(" ")}
                    fill="none"
                    stroke={COLOR}
                    strokeWidth="1.2"
                    mask="url(#eegMask)"
                />
            </svg>
        </div>
    );
};