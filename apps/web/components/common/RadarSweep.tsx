// components/common/RadarSweep.tsx
"use client";

import React, { useRef, useState } from "react";
import { useAnimationFrame } from "motion/react";

// ─── Config ────────────────────────────────────────────────────────────────────
const CX = 100;
const CY = 100;
const R = 82;                    // outer ring radius
const COLOR = "#10b981";
const SWEEP_SPEED = 0.6;         // full rotations per second
const TRAIL_STEPS = 60;          // how many trail slices to render
const TRAIL_ARC = Math.PI * 1.1; // radians of visible trail sweep
const RING_COUNT = 4;            // concentric range rings
const TICK_COUNT = 12;           // bearing tick marks
const BLIP_COUNT = 6;            // number of blips on screen

// ─── Types ─────────────────────────────────────────────────────────────────────
type Blip = {
    angle: number;   // radians — fixed position on the radar
    dist: number;    // 0–1 normalized distance from center
    size: number;    // dot radius
    decay: number;   // how fast this blip fades (0.3–1.0)
    alpha: number;   // current brightness (written each frame)
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
function polarToXY(angle: number, dist: number, cx = CX, cy = CY, r = R) {
    return {
        x: cx + Math.cos(angle) * dist * r,
        y: cy + Math.sin(angle) * dist * r,
    };
}

/** Angular difference normalised to [−π, +π] */
function angleDelta(a: number, b: number): number {
    let d = ((a - b) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
    if (d > Math.PI) d -= 2 * Math.PI;
    return d;
}

function initBlips(): Blip[] {
    return Array.from({ length: BLIP_COUNT }, () => ({
        angle: Math.random() * 2 * Math.PI,
        dist: 0.2 + Math.random() * 0.75,
        size: 1.2 + Math.random() * 1.6,
        decay: 0.35 + Math.random() * 0.55,
        alpha: 0,
    }));
}

export const RadarSweep: React.FC = () => {
    const sweepRef = useRef(0);          // current sweep angle in radians
    const lastT = useRef<number | null>(null);
    const blipsRef = useRef<Blip[]>(initBlips());

    const [isMounted, setIsMounted] = useState(false);
    const [frame, setFrame] = useState({
        sweep: 0,
        blips: blipsRef.current,
    });

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    useAnimationFrame((time) => {
        const dt = lastT.current === null ? 0 : (time - lastT.current) / 1000;
        lastT.current = time;

        // Advance sweep angle
        sweepRef.current += SWEEP_SPEED * 2 * Math.PI * dt;

        const sweep = sweepRef.current % (2 * Math.PI);
        const blips = blipsRef.current;

        // Update blip brightness
        for (const blip of blips) {
            const delta = angleDelta(sweep, blip.angle);

            if (delta >= 0 && delta < 0.12) {
                // Sweep just passed over this blip — light it up
                blip.alpha = 1;
            } else {
                // Decay
                blip.alpha = Math.max(0, blip.alpha - blip.decay * dt);
            }
        }

        setFrame({ sweep, blips: [...blips] });
    });

    const { sweep, blips } = frame;

    if (!isMounted) {
        return <div className="absolute left-[-60px] top-[-60px] w-[280px] h-[280px]" />;
    }

    // ── Sweep trail: render as stacked arcs from oldest → newest ────────────────
    const trailSegments = Array.from({ length: TRAIL_STEPS }, (_, i) => {
        // i=0 is the trailing edge, i=TRAIL_STEPS-1 is the sweep tip
        const frac = i / TRAIL_STEPS;            // 0 (tail) → 1 (tip)
        const segAngle = sweep - TRAIL_ARC * (1 - frac);
        const nextAngle = sweep - TRAIL_ARC * (1 - (i + 1) / TRAIL_STEPS);
        const opacity = Math.pow(frac, 1.8) * 0.55;

        // Arc path for this thin wedge slice
        const r = R;
        const x1 = CX + Math.cos(segAngle) * r;
        const y1 = CY + Math.sin(segAngle) * r;
        const x2 = CX + Math.cos(nextAngle) * r;
        const y2 = CY + Math.sin(nextAngle) * r;

        // Wedge: center → arc start → arc end → center
        const largeArc = Math.abs(nextAngle - segAngle) > Math.PI ? 1 : 0;
        const d = [
            `M ${CX} ${CY}`,
            `L ${x1.toFixed(4)} ${y1.toFixed(4)}`,
            `A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(4)} ${y2.toFixed(4)}`,
            "Z",
        ].join(" ");

        return { d, opacity: Number(opacity.toFixed(4)) };
    });

    // ── Sweep tip line ───────────────────────────────────────────────────────────
    const tipX = CX + Math.cos(sweep) * R;
    const tipY = CY + Math.sin(sweep) * R;

    // ── Range rings ──────────────────────────────────────────────────────────────
    const rings = Array.from({ length: RING_COUNT }, (_, i) => ({
        r: ((i + 1) / RING_COUNT) * R,
    }));

    // ── Bearing ticks ────────────────────────────────────────────────────────────
    const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
        const angle = (i / TICK_COUNT) * 2 * Math.PI;
        const inner = R * 0.93;
        const outer = R * 1.0;
        return {
            x1: Number((CX + Math.cos(angle) * inner).toFixed(4)),
            y1: Number((CY + Math.sin(angle) * inner).toFixed(4)),
            x2: Number((CX + Math.cos(angle) * outer).toFixed(4)),
            y2: Number((CY + Math.sin(angle) * outer).toFixed(4)),
            // Label positions
            lx: Number((CX + Math.cos(angle) * (R * 0.82)).toFixed(4)),
            ly: Number((CY + Math.sin(angle) * (R * 0.82)).toFixed(4)),
            label: i === 0 ? "N" : i === 3 ? "E" : i === 6 ? "S" : i === 9 ? "W" : null,
        };
    });

    // ── Crosshair ────────────────────────────────────────────────────────────────
    const crossSize = R * 0.06;

    return (
        <div className="absolute left-[-60px] top-[-60px] w-[280px] h-[280px] pointer-events-none select-none opacity-[0.14] overflow-hidden animate-in fade-in duration-500">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <defs>
                    {/* Sweep gradient — fades from tip inward */}
                    <radialGradient id="sweepGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={COLOR} stopOpacity="0.0" />
                        <stop offset="100%" stopColor={COLOR} stopOpacity="1" />
                    </radialGradient>

                    {/* Blip glow */}
                    <filter id="blipGlow" x="-100%" y="-100%" width="300%" height="300%">
                        <feGaussianBlur stdDeviation="1.8" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Tip glow */}
                    <filter id="tipGlow" x="-200%" y="-200%" width="500%" height="500%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    {/* Clip to circle */}
                    <clipPath id="radarClip">
                        <circle cx={CX} cy={CY} r={R} />
                    </clipPath>
                </defs>

                {/* ── Sphere fill ─────────────────────────────────────────────────── */}
                <circle cx={CX} cy={CY} r={R} fill={COLOR} fillOpacity="0.025" />

                {/* ── Range rings ─────────────────────────────────────────────────── */}
                {rings.map((ring, i) => (
                    <circle
                        key={`ring-${i}`}
                        cx={CX} cy={CY} r={ring.r}
                        fill="none"
                        stroke={COLOR}
                        strokeWidth={i === RING_COUNT - 1 ? "0.6" : "0.3"}
                        opacity={i === RING_COUNT - 1 ? 0.55 : 0.22}
                        strokeDasharray={i === RING_COUNT - 1 ? "none" : "3 3"}
                    />
                ))}

                {/* ── Cardinal crosshairs ─────────────────────────────────────────── */}
                <line x1={CX} y1={CY - R} x2={CX} y2={CY + R} stroke={COLOR} strokeWidth="0.25" opacity="0.18" strokeDasharray="2 4" />
                <line x1={CX - R} y1={CY} x2={CX + R} y2={CY} stroke={COLOR} strokeWidth="0.25" opacity="0.18" strokeDasharray="2 4" />

                {/* ── Bearing tick marks ──────────────────────────────────────────── */}
                {ticks.map((tick, i) => (
                    <g key={`tick-${i}`}>
                        <line
                            x1={tick.x1} y1={tick.y1}
                            x2={tick.x2} y2={tick.y2}
                            stroke={COLOR}
                            strokeWidth={tick.label ? "0.8" : "0.4"}
                            opacity={tick.label ? 0.6 : 0.3}
                        />
                        {tick.label && (
                            <text
                                x={tick.lx} y={tick.ly}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={COLOR}
                                fontSize="5"
                                fontFamily="monospace"
                                fontWeight="bold"
                                opacity="0.45"
                            >
                                {tick.label}
                            </text>
                        )}
                    </g>
                ))}

                {/* ── Sweep trail wedges ──────────────────────────────────────────── */}
                <g clipPath="url(#radarClip)">
                    {trailSegments.map((seg, i) => (
                        <path
                            key={`trail-${i}`}
                            d={seg.d}
                            fill={COLOR}
                            opacity={seg.opacity}
                        />
                    ))}
                </g>

                {/* ── Sweep tip line ──────────────────────────────────────────────── */}
                <line
                    x1={CX} y1={CY}
                    x2={tipX} y2={tipY}
                    stroke={COLOR}
                    strokeWidth="0.9"
                    opacity="0.85"
                    filter="url(#tipGlow)"
                    clipPath="url(#radarClip)"
                />

                {/* ── Blips ───────────────────────────────────────────────────────── */}
                {blips.map((blip, i) => {
                    if (blip.alpha < 0.01) return null;
                    const { x, y } = polarToXY(blip.angle, blip.dist);
                    return (
                        <g key={`blip-${i}`} filter="url(#blipGlow)">
                            {/* Outer ring */}
                            <circle
                                cx={x} cy={y}
                                r={blip.size * 2.2}
                                fill="none"
                                stroke={COLOR}
                                strokeWidth="0.4"
                                opacity={Number((blip.alpha * 0.5).toFixed(4))}
                            />
                            {/* Core dot */}
                            <circle
                                cx={x} cy={y}
                                r={blip.size}
                                fill={COLOR}
                                opacity={Number(blip.alpha.toFixed(4))}
                            />
                        </g>
                    );
                })}

                {/* ── Center crosshair ────────────────────────────────────────────── */}
                <line x1={CX - crossSize} y1={CY} x2={CX + crossSize} y2={CY} stroke={COLOR} strokeWidth="0.6" opacity="0.7" />
                <line x1={CX} y1={CY - crossSize} x2={CX} y2={CY + crossSize} stroke={COLOR} strokeWidth="0.6" opacity="0.7" />
                <circle cx={CX} cy={CY} r="1.2" fill={COLOR} opacity="0.8" />

                {/* ── Outer boundary ring ─────────────────────────────────────────── */}
                <circle cx={CX} cy={CY} r={R} fill="none" stroke={COLOR} strokeWidth="0.7" opacity="0.5" />

                {/* ── Tiny status readout ─────────────────────────────────────────── */}
                <text x={CX + R * 0.38} y={CY + R * 0.91} fill={COLOR} fontSize="3.8" fontFamily="monospace" opacity="0.35" textAnchor="middle">
                    {`AZ ${((sweep / (2 * Math.PI)) * 360 % 360).toFixed(1)}°`}
                </text>
            </svg>
        </div>
    );
};