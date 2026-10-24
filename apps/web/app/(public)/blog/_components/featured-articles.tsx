"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { BlogPost, getPublicBlogPosts } from "@/lib/actions/blogApi";
import Image from "next/image";
import { useEffect, useState } from "react";

interface FeaturedArticlesProps {
  posts?: BlogPost[];
}

const FeaturedArticles = ({ posts }: FeaturedArticlesProps) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchFeaturedPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        if (posts) {
          // Use provided posts
          const filteredPosts = posts
            .filter((post) => post.published)
            .sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )
            .slice(0, 5);
          setFeaturedPosts(filteredPosts);
        } else {
          // Fetch from API
          console.log('Fetching blog posts from:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api');
          const response = await getPublicBlogPosts({ limit: 5, sortBy: 'createdAt', sortOrder: 'desc' });
          if (response.data.success && response.data.data) {
            setFeaturedPosts(response.data.data.filter(post => post.published));
          } else {
            setError(response.data?.message || 'Failed to fetch posts');
            setFeaturedPosts([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch featured posts:", err);
        setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        setFeaturedPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPosts();
  }, [posts]);

  return (
    <div className="mt-8">
      <div className="text-xl font-bold mb-4">Featured</div>
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center space-x-4 hover:bg-accent p-2 rounded-lg">
            <Skeleton className="w-16 h-16 rounded-lg aspect-square bg-muted" />
            <Skeleton className="w-full h-16 bg-muted" />
          </div>
        ) : error ? (
          <div className="text-destructive text-sm p-2 border border-destructive/20 rounded-lg bg-destructive/10">
            Error: {error}
          </div>
        ) : featuredPosts.length > 0 ? (
          featuredPosts.map((post: BlogPost) => (
            <a
              key={post.id}
              href={`/blog/${post.slug}`}
              className="flex items-center space-x-4 hover:bg-accent p-2 rounded-lg"
            >
              <Image
                src={post.thumbnail}
                alt={post.title}
                width={64}
                height={64}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="text-sm font-medium">{post.title}</div>
            </a>
          ))
        ) : (
          <div className="text-muted-foreground text-sm">No featured posts available</div>
        )}
      </div>
    </div>
  );
};

export default FeaturedArticles;
