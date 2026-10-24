"use client";
import Link from "next/link";

interface Tag {
  name: string;
}

interface Project {
  slug: string;
  title: string;
  client?: string;
  tags: Tag[];
  createdAt: string;
  thumbnail?: string;
  website?: string;
  github?: string;
}

const TerminalProjectCard = ({ project }: { project: Project }) => {
  return (
    <Link href={`/portfolio/${project.slug}`} className="block w-full">
      <div className="group relative font-mono p-6 border border-zinc-200 dark:border-zinc-800 hover:border-green-500/50 transition-all mb-6 bg-zinc-100/40 dark:bg-black/40 backdrop-blur-sm rounded-sm overflow-hidden min-h-[300px] flex flex-col">
        {/* Project Thumbnail Background */}
        {project.thumbnail && (
          <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700">
            <img
              src={project.thumbnail}
              alt=""
              className="w-full h-full object-cover grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-zinc-100/80 dark:from-black dark:via-black/80 to-transparent"></div>
          </div>
        )}

        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-bold">➜</span>
              <span className="text-blue-400 font-bold">~/portfolio</span>
              <span className="text-zinc-500">on</span>
              <span className="text-purple-400 font-bold">main</span>
              <span className="text-yellow-400 font-bold">[*]</span>
            </div>
            <span className="text-zinc-600 text-xs">
              {new Date(project.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <div className="mb-4">
            <span className="text-green-600 dark:text-green-500 mr-2">$</span>
            <span className="text-zinc-800 dark:text-zinc-100 break-all">ls -la projects/{project.slug}</span>
          </div>

          <div className="pl-4 py-2 border-l border-zinc-200 dark:border-zinc-800 group-hover:border-green-500/30 transition-colors">
            <h2 className="text-2xl text-zinc-950 dark:text-white font-bold mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
              {project.title.toUpperCase()}
            </h2>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
              <div className="text-zinc-600 dark:text-zinc-400 text-sm">
                <span className="text-zinc-500 font-bold">CLIENT:</span> {project.client || "INTERNAL_LAB"}
              </div>
              <div className="text-zinc-600 dark:text-zinc-400 text-sm">
                <span className="text-zinc-500 font-bold">STATUS:</span> <span className="text-green-600 dark:text-green-500/80 underline decoration-dotted">DEPLOYED</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {project.tags.map((tag, i) => (
                <span key={i} className="text-zinc-600 dark:text-zinc-500 text-xs border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900/50">
                  #{tag.name.toLowerCase()}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-green-500/60 text-xs group-hover:text-green-400 transition-colors animate-pulse">
                <span>[READY]</span>
                <span className="h-1 w-12 bg-green-500/20 rounded-full overflow-hidden relative">
                  <span className="absolute inset-0 bg-green-500/60 animate-progress"></span>
                </span>
                <span>RUN ./view-details.sh</span>
              </div>

              {project.github && (
                <div onClick={(e) => { e.preventDefault(); window.open(project.github, '_blank'); }} className="text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors text-[10px] font-black flex items-center gap-2 cursor-pointer border-l border-zinc-200 dark:border-zinc-800 pl-6">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                  VIEW_SOURCE
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TerminalProjectCard;
