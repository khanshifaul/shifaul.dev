"use client";

import React from "react";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
}

const PostTags = () => {
  // Static tags for now - you can implement dynamic tags from API later
  const tags: Tag[] = [
    { id: "1", name: "Technology" },
    { id: "2", name: "Development" },
    { id: "3", name: "Programming" },
    { id: "4", name: "Web Development" },
    { id: "5", name: "JavaScript" },
    { id: "6", name: "TypeScript" },
    { id: "7", name: "React" },
    { id: "8", name: "Next.js" },
  ];

  return (
    <div className="space-y-6">

      <div className="flex flex-wrap gap-2">
        {tags.map((tag: Tag) => (
          <Link
            key={tag.id}
            href={`/blog?tag=${encodeURIComponent(tag.name)}`}
            className="group relative px-3 py-1.5 border border-zinc-200 dark:border-zinc-900 bg-zinc-100/20 dark:bg-zinc-900/20 hover:border-green-600/30 dark:hover:border-green-500/30 hover:bg-zinc-100/40 dark:hover:bg-zinc-900/40 transition-all duration-300 rounded-sm overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors"></div>

            <div className="relative flex items-center gap-2">
              <span className="text-zinc-400 dark:text-zinc-600 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors text-[8px] font-black tracking-widest leading-none">
                #
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
                {tag.name}
              </span>
            </div>

            {/* Decorative Corner */}
            <div className="absolute top-0 right-0 w-1 h-1">
              <div className="absolute top-0 right-0 w-[1px] h-[1px] bg-zinc-300 dark:bg-zinc-800 group-hover:bg-green-600 dark:group-hover:bg-green-500 transition-colors"></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PostTags;
