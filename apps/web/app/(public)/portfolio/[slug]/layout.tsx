import type { Metadata } from "next";
import { ReactNode } from "react";
import { getPublicProjectBySlug } from "@/lib/actions/projectsApi";

type Props = {
  params: Promise<{ slug: string }>;
};

const siteUrl = "https://www.shifaul.dev";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const response = await getPublicProjectBySlug(slug);
  const project = response.data.success ? response.data.data : undefined;

  if (!project) {
    return {
      title: "Project not found",
      robots: { index: false, follow: false },
    };
  }

  const description = (project.about || project.subtitle || project.title)
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  const url = `${siteUrl}/portfolio/${project.slug}`;
  const image = project.thumbnail || "/og-cover.jpeg";

  return {
    title: project.title,
    description,
    keywords: ["Portfolio", "Project", ...project.technologies],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: project.title,
      description,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description,
      images: [{ url: image, alt: project.title }],
    },
  };
}

export default function ProjectLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
