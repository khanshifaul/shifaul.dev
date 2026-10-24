// app/(public)/blog/[slug]/page.tsx
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { getPublicBlogPostBySlug } from "@/lib/actions/blogApi";
import { IBlogPost, ITag } from "@/types/globals";
import FeaturedArticles from "../_components/featured-articles";
import NewsletterForm from "../_components/newsletter-form";
import PostTags from "../_components/post-tags";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";
import { ClientMotionWrapper } from "@/components/common/ClientMotionWrapper";
import { RadarSweep } from "@/components/common/RadarSweep";
import { serializeJsonLd } from "@/lib/utils/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;

  let fetchedPost: IBlogPost | null = null;
  let error: string | null = null;

  try {
    const response = await getPublicBlogPostBySlug(slug, true);

    if (response.data.success && response.data.data) {
      const post = response.data.data;
      fetchedPost = {
        id: post.id,
        title: post.title,
        slug: post.slug,
        authorId: post.authorId,
        authorName: post.authorName,
        author: {
          name: post.authorName || "Admin",
          avatar: "",
        },
        thumbnail: post.thumbnail,
        excerpt: post.content ? `${post.content.substring(0, 160)}...` : "No content available",
        content: post.content,
        tags: post.tags as ITag[],
        reactions: post.reactions,
        published: !!post.published,
        publishedAt: post.published ? new Date(post.createdAt) : null,
        createdAt: new Date(post.createdAt),
        updatedAt: new Date(post.updatedAt),
      };
    } else {
      error = "Post not found";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to fetch post";
  }

  if (error || !fetchedPost) {
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-red-500 font-mono p-8 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none">
          <Backgrounds />
          <Globe />
          <RadarSweep />
        </div>
        <div className="relative z-10 max-w-2xl w-full bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-md border border-red-500/20 p-12 text-center">
          <h1 className="text-3xl font-black mb-6 tracking-tighter">[SYSTEM_ERROR]</h1>
          <p className="mb-10 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{error || "POST_NOT_FOUND"}</p>
          <Link href="/blog" className="inline-flex items-center gap-3 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-widest border-b border-zinc-950/20 dark:border-white/20 pb-1 hover:text-green-500 hover:border-green-500 transition-all">
            &lt; RETURN_TO_ARCHIVE
          </Link>
        </div>
      </div>
    );
  }

  // Custom components for MDX
  const components = {
    h1: (props: any) => <h1 className="text-zinc-950 dark:text-white font-black tracking-tight uppercase mt-12 mb-6" {...props} />,
    h2: (props: any) => <h2 className="text-zinc-950 dark:text-white font-black tracking-tight uppercase mt-10 mb-4 border-l-4 border-green-500 pl-4" {...props} />,
    h3: (props: any) => <h3 className="text-zinc-950 dark:text-white font-bold uppercase mt-8 mb-3" {...props} />,
    p: (props: any) => <p className="leading-relaxed text-zinc-600 dark:text-zinc-400 text-lg mb-6" {...props} />,
    ul: (props: any) => <ul className="list-disc list-inside space-y-2 mb-6 text-zinc-600 dark:text-zinc-400" {...props} />,
    ol: (props: any) => <ol className="list-decimal list-inside space-y-2 mb-6 text-zinc-600 dark:text-zinc-400" {...props} />,
    li: (props: any) => <li className="leading-relaxed" {...props} />,
    blockquote: (props: any) => (
      <blockquote className="border-l-4 border-zinc-300 dark:border-zinc-800 pl-6 py-2 italic text-zinc-500 my-8 bg-zinc-100/30 dark:bg-zinc-950/30" {...props} />
    ),
    code: ({ className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const isInline = !match;
      return isInline ? (
        <code className="bg-zinc-900/80 text-green-400 px-1.5 py-0.5 rounded-sm font-mono text-sm border border-zinc-800/50" {...props}>
          {children}
        </code>
      ) : (
        <code className={`${className} block overflow-x-auto text-zinc-300 font-mono text-sm leading-relaxed`} {...props}>
          {children}
        </code>
      );
    },
    pre: (props: any) => (
      <pre className="bg-zinc-950 dark:bg-black border border-zinc-200 dark:border-zinc-900 p-6 rounded-sm my-8 overflow-x-auto selection:bg-green-500/30" {...props} />
    ),
    hr: () => <hr className="border-zinc-200 dark:border-zinc-900 my-12" />,
    strong: (props: any) => <strong className="text-green-600 dark:text-green-500 font-black" {...props} />,
    a: (props: any) => <a className="text-green-600 dark:text-green-500 no-underline hover:underline decoration-2 underline-offset-4" {...props} />,
  };

  // Pre-process content for MDX
  const mdxContent = (fetchedPost.content || "")
    .replace(/\\n/g, '\n') // Normalize escaped newlines
    .replace(/\\\[([\s\S]*?)\\\]/g, '$$$$1$$')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$$$1$$');

  // Options for MDX
  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm, remarkMath],
      rehypePlugins: [rehypeKatex],
    }
  };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: fetchedPost.title,
    description: fetchedPost.excerpt,
    image: fetchedPost.thumbnail
      ? new URL(fetchedPost.thumbnail, "https://www.shifaul.dev").toString()
      : undefined,
    datePublished: fetchedPost.createdAt.toISOString(),
    dateModified: fetchedPost.updatedAt.toISOString(),
    author: {
      "@type": "Person",
      name: fetchedPost.authorName || "Shifaul Islam",
    },
    publisher: {
      "@type": "Person",
      name: "Md Shifaul Islam",
      url: "https://www.shifaul.dev/",
    },
    mainEntityOfPage: `https://www.shifaul.dev/blog/${fetchedPost.slug}`,
  };

  return (
    <div className="min-h-screen overflow-hidden text-zinc-600 dark:text-zinc-400 font-mono selection:bg-green-500 selection:text-black bg-[var(--bg-color)] transition-colors duration-500">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(articleSchema) }}
      />
      {/* Universal Terminal Backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <ClientMotionWrapper>
          {/* Breadcrumb / Path */}
          <div className="text-[10px] text-zinc-500 dark:text-zinc-600 flex items-center gap-2 font-black tracking-[0.3em]">
            <Link href="/blog" className="hover:text-green-600 dark:hover:text-green-500 transition-colors uppercase">BLOG_ARCHIVE</Link>
            <span className="opacity-30">/</span>
            <span className="text-zinc-400 dark:text-zinc-400 uppercase truncate max-w-[150px] md:max-w-none inline-block">{fetchedPost.slug}</span>
          </div>

          {/* Header Section */}
          <header className="border-b border-zinc-200 dark:border-zinc-900 pb-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-green-500 font-black text-[10px] tracking-[0.2em] uppercase">
                  {fetchedPost.publishedAt ? new Date(fetchedPost.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : "UNKNOWN_DATE"}
                </span>
                <div className="h-[1px] w-12 bg-zinc-800"></div>
                <span className="text-zinc-600 font-black text-[10px] tracking-[0.2em] uppercase">
                  BY {fetchedPost.authorName || "ADMIN"}
                </span>
              </div>
              <h1 className="text-4xl md:text-7xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none uppercase">
                {fetchedPost.title}
              </h1>
            </div>

            <div className="bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 border-l-2 border-green-600 dark:border-green-500/50 text-sm leading-relaxed max-w-5xl transition-colors duration-500">
              <span className="text-green-600 dark:text-green-500 font-bold">$</span> cat <span className="break-all text-zinc-950 dark:text-white">{fetchedPost.slug}</span>.md --verbose
              <br />
              <span className="text-zinc-600 dark:text-zinc-500 mt-3 block">
                {fetchedPost.excerpt}
              </span>
            </div>
          </header>

          {/* Featured Image */}
          <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden border border-zinc-200 dark:border-zinc-900 rounded-sm">
            <Image
              src={fetchedPost.thumbnail || ""}
              alt={fetchedPost.title}
              fill
              className="object-cover opacity-80 dark:opacity-80"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/80 dark:from-black via-transparent to-transparent"></div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <article className="prose prose-invert prose-zinc max-w-none prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-headings:text-zinc-950 dark:prose-headings:text-white">
                <MDXRemote source={mdxContent} options={mdxOptions} components={components} />
              </article>

              {/* Tags Section */}
              <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-900 flex flex-wrap gap-3">
                {(fetchedPost.tags || []).map((tag, idx) => (
                  <span key={idx} className="text-[10px] text-green-600 dark:text-green-500 font-black tracking-widest uppercase border border-green-600/20 dark:border-green-500/20 px-3 py-1 bg-green-500/5 hover:bg-green-500/10 transition-colors">
                    #{typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-24 space-y-12">
                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 dark:text-green-500 font-black text-xs">[ HOT_LOGS ]</span>
                    <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                  </div>
                  <FeaturedArticles />
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 dark:text-green-500 font-black text-xs">[ TAG_CLOUD ]</span>
                    <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                  </div>
                  <PostTags />
                </section>

                <section className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 dark:text-green-500 font-black text-xs">[ SUBSCRIBE ]</span>
                    <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                  </div>
                  <NewsletterForm />
                </section>
              </div>
            </aside>
          </div>

          {/* Footer Navigation */}
          <footer className="pt-24 border-t border-zinc-200 dark:border-zinc-900">
            <Link href="/blog" className="group flex items-center gap-4 text-zinc-600 hover:text-zinc-950 dark:hover:text-white transition-all font-black text-[10px] tracking-[0.4em]">
              <span className="group-hover:-translate-x-2 transition-transform text-green-600">&lt;&lt;</span>
              <span>BACK_TO_ARCHIVE_DIRECTORY</span>
            </Link>
          </footer>
        </ClientMotionWrapper>
      </div>
    </div>
  );
}
