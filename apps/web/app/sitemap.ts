import type { MetadataRoute } from "next";
import { getPublicBlogPosts } from "@/lib/actions/blogApi";
import { getPublicProjects } from "@/lib/actions/projectsApi";

const baseUrl = "https://www.shifaul.dev";

const staticPages: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "", priority: 1, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/portfolio", priority: 0.8, changeFrequency: "monthly" },
  { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/resume", priority: 0.6, changeFrequency: "yearly" },
];

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${baseUrl}${page.path}`,
    priority: page.priority,
    changeFrequency: page.changeFrequency,
  }));

  const [blogResponse, projectResponse] = await Promise.all([
    getPublicBlogPosts({ page: 1, limit: 100, published: true }),
    getPublicProjects({ page: 1, limit: 100 }),
  ]);

  for (const post of blogResponse.data.data || []) {
    if (!post.published || !post.slug) continue;
    entries.push({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || post.createdAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  for (const project of projectResponse.data.data || []) {
    if (project.published === false || !project.slug) continue;
    entries.push({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: project.updatedAt || project.createdAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
