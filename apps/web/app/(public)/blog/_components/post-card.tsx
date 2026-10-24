"use client";

import { IBlogPost } from "@/types/globals";
import Image from "next/image";
import Link from "next/link";

interface PostCardProps {
  post: IBlogPost;
}

const PostCard = ({ post }: PostCardProps) => (
  <Link href={`/blog/${post.slug}`} className="group block w-full">
    <div className="relative overflow-hidden border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 hover:border-green-600/30 dark:hover:border-green-500/30 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-all duration-500 rounded-sm">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8">
        {/* Thumbnail Section */}
        <div className="md:col-span-5 relative overflow-hidden aspect-video md:aspect-auto h-full">
          <Image
            src={post.thumbnail || ""}
            alt={post.title}
            width={600}
            height={400}
            className="w-full h-full object-cover opacity-60 dark:opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
          />
          {/* Metadata Overlay */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-2 py-0.5 bg-zinc-100/80 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 text-[8px] font-black tracking-widest uppercase">
              {post.authorName || "SHIFAUL_ADMIN"}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="md:col-span-7 p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-green-500 font-black text-[10px] tracking-tighter">
                {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-CA') : "0000-00-00"}
              </span>
              <div className="h-[1px] w-8 bg-zinc-800 group-hover:w-12 group-hover:bg-green-500/50 transition-all"></div>
            </div>
            
            <h2 className="text-2xl font-black text-zinc-950 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors tracking-tighter leading-tight uppercase">
              {post.title}
            </h2>
            
            <p className="text-zinc-600 dark:text-zinc-500 text-sm leading-relaxed line-clamp-3 font-medium">
              {post.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-900/50">
            <div className="flex gap-2">
              {(post.tags || []).slice(0, 3).map((tag: any, idx) => (
                <span key={idx} className="text-[9px] text-zinc-500 dark:text-zinc-600 font-black tracking-widest uppercase border border-zinc-200 dark:border-zinc-900 px-1.5 py-0.5 bg-zinc-50/50 dark:bg-zinc-900/50">
                  #{typeof tag === 'string' ? tag : tag.name}
                </span>
              ))}
            </div>
            <div className="text-zinc-400 dark:text-zinc-800 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors text-[10px] font-black tracking-widest uppercase flex items-center gap-2">
              READ_LOG <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none">
        <div className="absolute top-0 right-0 w-[1px] h-4 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-green-600 dark:group-hover:bg-green-500/50 transition-colors"></div>
        <div className="absolute top-0 right-0 h-[1px] w-4 bg-zinc-200 dark:bg-zinc-800 group-hover:bg-green-600 dark:group-hover:bg-green-500/50 transition-colors"></div>
      </div>
    </div>
  </Link>
);

export default PostCard;
