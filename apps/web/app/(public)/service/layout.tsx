import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  alternates: { canonical: "https://www.shifaul.dev/service" },
  robots: { index: false, follow: true },
};

export default function ServiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
