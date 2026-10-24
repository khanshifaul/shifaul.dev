// PublicLayout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.shifaul.dev/about" },
  description:
    "Discover the journey of Shifaul Islam, a dedicated software engineer with a focus on AI and BCI technologies. Learn about his background, education, and vision for the future of technology.",
  keywords: [
    "About Shifaul Islam",
    "Software Engineer",
    "AI",
    "BCI",
    "background",
    "education",
    "innovation",
  ],
  openGraph: {
    title: "About Shifaul Islam - Software Engineer & Innovator in AI and BCI",
    description:
      "Discover the journey of Shifaul Islam, a dedicated software engineer with a focus on AI and BCI technologies. Learn about his background, education, and vision for the future of technology.",
    url: "https://www.shifaul.dev/about",
    type: "website",
    images: [{ url: "/og-cover.jpeg", width: 1680, height: 640, alt: "Md Shifaul Islam — full-stack developer portfolio cover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Shifaul Islam - Software Engineer & Innovator in AI and BCI",
    description:
      "Discover the journey of Shifaul Islam, a dedicated software engineer with a focus on AI and BCI technologies.",
    images: ["/og-cover.jpeg"],
  },
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
