import type { Metadata } from "next";
import { ReactNode } from "react";
import { getPublicBlogPostBySlug } from "@/lib/actions/blogApi";

type Props = {
  params: Promise<{ slug: string }>;
};

const siteUrl = "https://www.shifaul.dev";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const response = await getPublicBlogPostBySlug(slug);
  const post = response.data.success ? response.data.data : undefined;

  if (!post) {
    return {
      title: "Article not found",
      robots: { index: false, follow: false },
    };
  }

  const description = post.content
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*_`>~]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const url = `${siteUrl}/blog/${post.slug}`;
  const image = post.thumbnail || "/og-cover.jpeg";

  return {
    title: post.title,
    description,
    keywords: ["Blog", "Shifaul Islam", ...post.tags.map((tag) => tag.name)],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.authorName || "Shifaul Islam"],
      images: [{ url: image, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [{ url: image, alt: post.title }],
    },
  };
}

export default function BlogpostLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
