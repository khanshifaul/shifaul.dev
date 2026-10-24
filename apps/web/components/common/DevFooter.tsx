import Link from "next/link";

interface DevFooterProps {
  className?: string;
}

const DevFooter = ({ className }: DevFooterProps) => {
  return (
    <footer
      className={`${className} w-full flex items-end justify-end p-2 text-sm md:text-normal text-zinc-600 dark:text-zinc-500 transition-colors duration-500`}
    >
      <p className="leading-tight md:leading-loose font-mono flex ">
        {new Date().getFullYear()} &copy;&nbsp;
        <span className="font-dancing text-primary font-semibold">
          <Link className="flex items-center gap-1" href="/" title="Portfolio">
            Shifaul Islam
          </Link>
        </span>
        <span className="mx-2 opacity-30">|</span>
        <Link href="/terms" className="hover:text-green-500 transition-colors">
          TERMS
        </Link>
      </p>
    </footer>
  );
};

export default DevFooter;
