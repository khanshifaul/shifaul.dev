// PublicLayout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.shifaul.dev/portfolio" },
  description:
    "Explore the portfolio of Shifaul Islam featuring projects in AI, machine learning, brain-computer interfaces, and software engineering. See how technology meets creativity.",
  keywords: [
    "Portfolio",
    "Shifaul Islam",
    "projects",
    "AI",
    "BCI",
    "software engineering",
    "innovation",
  ],
  openGraph: {
    title: "Portfolio - Innovative Projects by Shifaul Islam",
    description:
      "Explore the portfolio of Shifaul Islam featuring projects in AI, machine learning, brain-computer interfaces, and software engineering.",
    url: "https://www.shifaul.dev/portfolio",
    type: "website",
    images: [{ url: "/og-cover.jpeg", width: 1680, height: 640, alt: "Md Shifaul Islam — full-stack developer portfolio cover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio - Innovative Projects by Shifaul Islam",
    description:
      "Explore the portfolio of Shifaul Islam featuring projects in AI, machine learning, BCI, and software engineering.",
    images: ["/og-cover.jpeg"],
  },
};

export default function PortfolioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
