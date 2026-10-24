import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth",
  description: "Welcome to the authentication section of Shifaul Islam's website.",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-screen h-screen">{children}</div>;
}
