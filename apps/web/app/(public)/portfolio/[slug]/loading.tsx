// app/(public)/portfolio/[slug]/loading.tsx
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";
import { RadarSweep } from "@/components/common/RadarSweep";


export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-zinc-600 dark:text-zinc-500 font-mono flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />
      </div>
      <div className="relative z-10 flex items-center gap-4">
        <div className="w-4 h-4 bg-green-600 dark:bg-green-500 animate-pulse"></div>
        <span className="text-[10px] font-black tracking-[0.3em] uppercase">INITIALIZING_DATA_STREAM...</span>
      </div>
    </div>
  );
}
