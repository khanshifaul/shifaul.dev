// PublicLayout.tsx
import DevFooter from "@/components/common/DevFooter";
import { FloatingDock } from "@/components/common/FloatingDock";
import NavBar from "@/components/common/NavBar";
import HireBanner from "@/components/common/HireBanner";
import { siteConfig } from "@/config/site.config";
import { serializeJsonLd } from "@/lib/utils/json-ld";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "https://www.shifaul.dev/" },
  description:
    "Welcome to the portfolio of Shifaul Islam, a full-stack developer building production web applications with Next.js, NestJS, and TypeScript. Explore projects, skills, and technical writing.",
  keywords: [
    "Shifaul Islam",
    "Software Engineer",
    "AI",
    "BCI",
    "portfolio",
    "technology",
    "projects",
    "blog",
  ],
  openGraph: {
    title: "Shifaul Islam — Full-Stack Developer",
    description:
      "Welcome to the portfolio of Shifaul Islam, a full-stack developer building production web applications with Next.js, NestJS, and TypeScript. Explore projects, skills, and technical writing.",
    url: "https://www.shifaul.dev/",
    type: "website",
    images: [{ url: "/og-cover.jpeg", width: 1680, height: 640, alt: "Md Shifaul Islam — full-stack developer portfolio cover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shifaul Islam — Full-Stack Developer",
    description:
      "Welcome to the portfolio of Shifaul Islam, a full-stack developer building production web applications with Next.js, NestJS, and TypeScript. Explore projects, skills, and technical writing.",
    images: ["/og-cover.jpeg"],
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Md Shifaul Islam",
  url: "https://www.shifaul.dev/",
  image: "https://www.shifaul.dev/og-cover.jpeg",
  jobTitle: "Full-Stack Developer",
  description: siteConfig.description,
  email: "connect@shifaul.dev",
  knowsAbout: ["Software Engineering", "Artificial Intelligence", "Brain-Computer Interfaces"],
  sameAs: Object.values(siteConfig.SocialMediaLinks).filter(Boolean),
};

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative flex flex-col w-full h-screen overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personSchema) }}
      />
      {/* Persistent Sticky Header */}
      <div className="sticky top-0 z-50 w-full">
        <HireBanner />
        <NavBar className="backdrop-blur-md" />
      </div>

      <main className="flex-1 overflow-y-auto snap-y snap-mandatory scroll-smooth scrollbar-none">
        {children}
      </main>
      <DevFooter className="sticky bottom-0 z-50" />
      {/* Floating dock — combines social share + AI chat trigger */}
      <FloatingDock />
    </div>
  );
}
