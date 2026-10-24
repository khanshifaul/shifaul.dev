import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms and conditions for using the Shifaul Islam portfolio website.",
  alternates: { canonical: "https://www.shifaul.dev/terms" },
  openGraph: {
    title: "Terms and Conditions",
    description:
      "Terms and conditions for using the Shifaul Islam portfolio website.",
    url: "https://www.shifaul.dev/terms",
    type: "website",
    images: ["/og-cover.jpeg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms and Conditions",
    description:
      "Terms and conditions for using the Shifaul Islam portfolio website.",
    images: ["/og-cover.jpeg"],
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
