import Link from "next/link";

interface LogoProps {
  className?: string;
}
const Logo = ({ className }: LogoProps) => {
  return (
    <div className={`${className} group`}>
      <Link className="flex flex-col p-2" href="/">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/20 group-hover:bg-red-500/60 transition-colors duration-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/20 group-hover:bg-yellow-500/60 transition-colors duration-500" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/20 group-hover:bg-green-500/60 transition-colors duration-500" />
          </div>
          <span className="text-[7px] md:text-[8px] text-zinc-500 dark:text-zinc-700 font-mono font-bold tracking-[0.2em] uppercase transition-colors group-hover:text-zinc-400 dark:group-hover:text-zinc-500">
            Shifaul_Dev_Kernel
          </span>
        </div>

        <div className="flex items-start font-mono text-lg md:text-xl font-black tracking-tighter">
          <span className="text-[12px] text-green-600 dark:text-green-500 mr-1.5 opacity-75 group-hover:opacity-100 transition-opacity">$</span>
          <span className="text-zinc-950 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">SHIFAUL</span>
          <span className="text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-600 transition-colors">ISLAM</span>
          <div className="ml-2 w-2 h-5 bg-green-600 dark:bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
        </div>
      </Link>
    </div>
  );
};

export default Logo;
