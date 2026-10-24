import Link from "next/link";

interface LogoProps {
  className?: string;
}
const Logo = ({ className }: LogoProps) => {
  return (
    <div className={`${className}`}>
      <Link className="flex justify-center items-center" href="/">
        <h1 className="text-2xl font-extrabold font-[AmadeusAP] ">
          <span className="mr-1 bg-clip-text text-transparent bg-linear-to-r via-blue-500 to-red-700 from-blue-500">
            S
          </span>
        </h1>
      </Link>
    </div>
  );
};

export default Logo;
