import { Suspense } from 'react';
import CursorWrapper from "@/components/common/CursorWrapper";
import { StoreProvider } from "@/components/providers/store-provider";
import { ProtectionProvider } from "@/components/providers/ProtectionProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AnimatePresence } from "motion/react";
import type { Metadata } from "next";
import "./globals.css";
import GoogleTagManager from "@/components/ui/google-tag-manager";
import MicrosoftClarity from "@/components/ui/microsoft-clarity";
import AnalyticsTracker from "@/components/common/AnalyticsTracker";
export const metadata: Metadata = {
  metadataBase: new URL("https://www.shifaul.dev"),
  title: {
    default: "Shifaul Islam — Full-Stack Developer",
    template: "%s | Shifaul Islam",
  },
  description:
    "Portfolio of Shifaul Islam, a full-stack developer building production web applications with Next.js, NestJS, and TypeScript. Explore projects, writing, and contact information.",
  openGraph: {
    type: "website",
    url: "https://www.shifaul.dev/",
    siteName: "Shifaul Islam",
    title: "Shifaul Islam — Full-Stack Developer",
    description:
      "Explore software projects and technical writing by Shifaul Islam, a full-stack developer working with Next.js, NestJS, and TypeScript.",
    images: [
      {
        url: "/og-cover.jpeg",
        width: 1680,
        height: 640,
        alt: "Md Shifaul Islam — full-stack developer portfolio cover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shifaul Islam — Full-Stack Developer",
    description:
      "Explore software projects and technical writing by Shifaul Islam, a full-stack developer working with Next.js, NestJS, and TypeScript.",
    images: ["/og-cover.jpeg"],
  },
  verification: {
    google: "lbyp2dC9_aYxIWYVGEV5cnZ74DaZK40hAyrvvfiZqCQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`w-full max-w-screen h-screen`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <GoogleTagManager containers={[{ gtmId: "GTM-K3LXK5Z3" }]} />
          <MicrosoftClarity clarityIds={["woxcwqxzi9"]} />
          <Suspense fallback={null}>
            <AnalyticsTracker />
          </Suspense>
          <CursorWrapper>
            <ProtectionProvider>
              <main
                className={`cursor-default`}
              >
                <StoreProvider>
                  <AnimatePresence>{children}</AnimatePresence>
                </StoreProvider>
              </main>
            </ProtectionProvider>
          </CursorWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
