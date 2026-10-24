import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Shifaul Islam about software engineering, AI, BCI, and project collaboration.",
  alternates: { canonical: "https://www.shifaul.dev/contact" },
  openGraph: {
    title: "Contact Shifaul Islam",
    description:
      "Contact Shifaul Islam about software engineering, AI, BCI, and project collaboration.",
    url: "https://www.shifaul.dev/contact",
    type: "website",
    images: ["/og-cover.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Shifaul Islam",
    description:
      "Contact Shifaul Islam about software engineering, AI, BCI, and project collaboration.",
    images: ["/og-cover.jpeg"],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
