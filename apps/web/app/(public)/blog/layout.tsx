// PublicLayout.tsx
import { AnimatePresence } from "motion/react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.shifaul.dev/blog" },
  description:
    "Stay updated with the latest trends and insights on AI, brain-computer interfaces, and software engineering through the blog of Shifaul Islam. Read articles, tutorials, and case studies.",
  keywords: [
    "Blog",
    "Shifaul Islam",
    "AI",
    "BCI",
    "software engineering",
    "tutorials",
    "technology insights",
  ],
  openGraph: {
    title: "Blog - Insights & Innovations in AI, BCI, and Software Engineering",
    description:
      "Stay updated with the latest trends and insights on AI, brain-computer interfaces, and software engineering through the blog of Shifaul Islam.",
    url: "https://www.shifaul.dev/blog",
    type: "website",
    images: [{ url: "/og-cover.jpeg", width: 1680, height: 640, alt: "Md Shifaul Islam — full-stack developer portfolio cover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog - Insights & Innovations in AI, BCI, and Software Engineering",
    description:
      "Stay updated with the latest trends and insights on AI, BCI, and software engineering. Read articles, tutorials, and case studies.",
    images: ["/og-cover.jpeg"],
  },
};

export default function BlogLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AnimatePresence>{children}</AnimatePresence>;
}
