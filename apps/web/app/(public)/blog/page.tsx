"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { getPublicBlogPosts, type BlogPost } from "@/lib/actions/blogApi";
import { type IBlogPost } from "@/types/globals";
import { motion, AnimatePresence } from "motion/react";
import FeaturedArticles from "./_components/featured-articles";
import NewsletterForm from "./_components/newsletter-form";
import PostCard from "./_components/post-card";
import PostTags from "./_components/post-tags";
import SearchForm from "./_components/search-form";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";
import { RadarSweep } from "@/components/common/RadarSweep";

const BlogPage = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BlogPost[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const loaderRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const fetchBlogPosts = useCallback(async (pageNum: number, query: string = "") => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getPublicBlogPosts({ page: pageNum, limit: 6, search: query, published: true });

      if (response.data?.success && response.data.data) {
        let newPosts = response.data.data;
        const isFallback = response.data.message?.includes("LOCAL_VAULT_FALLBACK") || response.data.message?.includes("BLOG_DATA_RECOVERED_FROM_VAULT");

        if (isFallback && query) {
          const isMatch = (target?: string) => {
            if (!target) return false;
            const nTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
            const nQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!nTarget || !nQuery) return false;
            return nTarget.includes(nQuery) || (nQuery.length > 3 && nQuery.includes(nTarget));
          };

          newPosts = newPosts.filter(p =>
            isMatch(p.title) ||
            isMatch(p.content) ||
            p.tags?.some(tag => {
              const tagName = typeof tag === 'string' ? tag : tag.name;
              return isMatch(tagName);
            })
          );
        }

        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setData((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const filtered = newPosts.filter(p => !existingIds.has(p.id));
            return [...prev, ...filtered];
          });

          if (isFallback) {
            setHasMore(false);
          } else {
            setPage(pageNum + 1);
            if (newPosts.length < 6) {
              setHasMore(false);
            }
          }
        }
      } else {
        setHasMore(false);
        if (pageNum === 1) {
          setError(response.data?.message || "Failed to fetch blog posts");
        }
      }
    } catch (err) {
      console.error("Failed to fetch blog posts:", err);
      setError("SYSTEM_FAILURE: Connection to API nodes lost.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== activeQuery) {
        setActiveQuery(searchInput);
        setData([]);
        setPage(1);
        setHasMore(true);
        fetchBlogPosts(1, searchInput);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput, activeQuery, fetchBlogPosts]);

  useEffect(() => {
    if (isInitialMount.current) {
      fetchBlogPosts(1, "");
      isInitialMount.current = false;
    }
  }, [fetchBlogPosts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchBlogPosts(page, activeQuery);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
      observer.disconnect();
    };
  }, [fetchBlogPosts, page, hasMore, loading, activeQuery]);

  const transformBlogPosts = (posts: BlogPost[]): IBlogPost[] => {
    return posts.map((post) => ({
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
      tags: post.tags,
      reactions: post.reactions,
      published: post.published,
      publishedAt: post.published ? new Date(post.createdAt) : null,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt),
    }));
  };

  const transformedPosts = transformBlogPosts(data);

  return (
    <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-mono selection:bg-green-500 selection:text-black">
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        <header className="mb-20 border-b border-zinc-200 dark:border-zinc-900 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-zinc-600 text-[10px] md:text-xs font-bold tracking-widest">
              <div className="flex gap-1.5 mr-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              </div>
              <span>guest@shifaul.dev: ~ (zsh)</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-8xl font-black text-zinc-950 dark:text-white tracking-tighter leading-none">
                INSIGHTS<span className="text-green-600 dark:text-green-500 animate-pulse">_</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-black uppercase tracking-tight md:tracking-[0.4em]">
                [ Directory: /var/log/musings ]
              </p>
            </div>

            <div className="bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 border-l-2 border-green-600 dark:border-green-500/50 text-sm leading-relaxed max-w-2xl">
              <span className="text-green-600 dark:text-green-500 font-bold">$</span> ls -la --time-style=long-iso
              <br />
              <span className="text-zinc-600 dark:text-zinc-500 mt-3 block">
                Exploring technology, software architecture, and the intersection of human-computer interaction. Decrypting insights, one post at a time.
              </span>
            </div>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8 space-y-12">
            {transformedPosts.length > 0 ? (
              <div className="space-y-12">
                <AnimatePresence mode="popLayout">
                  {transformedPosts.map((post, index) => (
                    <motion.div
                      key={post.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (index % 6) * 0.1 }}
                    >
                      <PostCard post={post} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : !loading && !error && (
              <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-900 rounded-sm">
                <div className="text-zinc-400 dark:text-zinc-700 text-[10px] font-black uppercase tracking-[0.3em]">
                  NO_DATA_LOGS_FOUND_IN_THIS_DIRECTORY
                </div>
              </div>
            )}

            {/* Loader / Infinite Scroll Trigger */}
            <div ref={loaderRef} className="py-12 text-center min-h-[100px] flex flex-col items-center justify-center">
              {loading && (
                <div className="flex flex-col items-center gap-6">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-2 border-green-600/10 dark:border-green-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-2 border-transparent border-t-green-600 dark:border-t-green-500 rounded-full animate-spin"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-700 tracking-[0.2em] font-bold uppercase animate-pulse">
                      Streaming_Data_Packets...
                    </span>
                  </div>
                </div>
              )}

              {!hasMore && transformedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-zinc-400 dark:text-zinc-800 text-[10px] tracking-[0.3em] font-black flex items-center justify-center gap-8 w-full"
                >
                  <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900/50"></div>
                  <span>EOF_NULL_POINTER_REACHED</span>
                  <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900/50"></div>
                </motion.div>
              )}

              {error && (
                <div className="text-red-500/60 text-xs p-6 border border-red-500/10 bg-red-500/5 rounded font-black uppercase tracking-widest">
                  [CRITICAL_ERROR] {error.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-12">
              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-green-500 font-black text-xs">[ SEARCH ]</span>
                  <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                </div>
                <SearchForm value={searchInput} onChange={setSearchInput} />
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-green-500 font-black text-xs">[ HOT_LOGS ]</span>
                  <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                </div>
                <FeaturedArticles posts={data.filter(p => p.published)} />
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-green-500 font-black text-xs">[ TAG_CLOUD ]</span>
                  <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900"></div>
                </div>
                <PostTags />
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-green-500 font-black text-xs">[ SUBSCRIBE ]</span>
                  <div className="h-[1px] flex-1 bg-zinc-900"></div>
                </div>
                <NewsletterForm />
              </section>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
