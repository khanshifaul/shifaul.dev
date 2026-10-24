// app/(public)/portfolio/[slug]/page.tsx
import React from "react";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";

import { getPublicProjectBySlug } from "@/lib/actions/projectsApi";
import { IProject } from "@/types/globals";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ClientMotionWrapper } from "@/components/common/ClientMotionWrapper";
import { RadarSweep } from "@/components/common/RadarSweep";
import { serializeJsonLd } from "@/lib/utils/json-ld";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;

  let project: IProject | null = null;
  let error: string | null = null;

  try {
    const response = await getPublicProjectBySlug(slug);
    if (response.data.success && response.data.data) {
      const data = response.data.data;
      project = {
        ...data,
        published: !!data.published,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      } as IProject;
    } else {
      error = "Project not found";
    }
  } catch (err) {
    console.error('Error fetching project:', err);
    error = err instanceof Error ? err.message : 'Failed to load project';
  }

  if (error || !project) {
    const displayError = error || `The requested artifact \`${slug}\` does not exist in the vault.`;
    const title = error ? "[SYSTEM_ERROR]" : "[404_NOT_FOUND]";
    return (
      <div className="min-h-screen bg-[var(--bg-color)] text-red-500 font-mono p-8 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
        <div className="fixed inset-0 pointer-events-none">
          <Backgrounds />
          <Globe />
          <RadarSweep />
        </div>
        <div className="relative z-10 max-w-2xl w-full bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-md border border-red-500/20 p-12 text-center">
          <h1 className="text-3xl font-black mb-6 tracking-tighter">{title}</h1>
          <p className="mb-10 text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{displayError}</p>
          <Link href="/portfolio" className="inline-flex items-center gap-3 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-widest border-b border-zinc-950/20 dark:border-white/20 pb-1 hover:text-green-500 hover:border-green-500 transition-all">
            &lt; RETURN_TO_BASE
          </Link>
        </div>
      </div>
    );
  }

  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.about,
    url: `https://www.shifaul.dev/portfolio/${project.slug}`,
    image: project.thumbnail
      ? new URL(project.thumbnail, "https://www.shifaul.dev").toString()
      : undefined,
    dateCreated: project.createdAt.toISOString(),
    dateModified: project.updatedAt.toISOString(),
    creator: {
      "@type": "Person",
      name: "Md Shifaul Islam",
      url: "https://www.shifaul.dev/",
    },
    keywords: project.technologies,
  };

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
      <pre className="bg-zinc-950 border border-zinc-900 p-6 rounded-sm my-8 overflow-x-auto selection:bg-green-500/30" {...props} />
    ),
    hr: () => <hr className="border-zinc-200 dark:border-zinc-900 my-12" />,
    strong: (props: any) => <strong className="text-green-600 dark:text-green-500 font-black" {...props} />,
    a: (props: any) => <a className="text-green-600 dark:text-green-500 no-underline hover:underline decoration-2 underline-offset-4" {...props} />,
  };

  // Options for MDX
  const mdxOptions = {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
    }
  };

  return (
    <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-mono selection:bg-green-500 selection:text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(projectSchema) }}
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
            <Link href="/portfolio" className="hover:text-green-600 dark:hover:text-green-500 transition-colors uppercase">PORTFOLIO</Link>
            <span className="opacity-30">/</span>
            <span className="text-zinc-400 dark:text-zinc-400 truncate max-w-[150px] md:max-w-none inline-block">{project.slug.toUpperCase()}</span>
          </div>

          {/* Header Section */}
          <header className="border-b border-zinc-200 dark:border-zinc-900 pb-12">
            <h1 className="text-5xl md:text-8xl font-black text-zinc-950 dark:text-white mb-6 tracking-tighter leading-none">
              {project.title.toUpperCase()}
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-500 max-w-2xl leading-relaxed">
              {project.subtitle}
            </p>
          </header>

          {/* Meta Grid - System Data */}
          <div className="border border-zinc-200 dark:border-zinc-900 bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm py-12 px-8 flex flex-col md:flex-row flex-wrap gap-12 md:gap-24 relative overflow-hidden">
            {/* Ambient Background Marker */}
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-[120px] font-black pointer-events-none select-none uppercase leading-none tracking-tighter">
              {project.slug.split('-')[0]}
            </div>

            <div className="space-y-8 min-w-[140px]">
              <div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase mb-3 tracking-[0.4em] flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  CLIENT_ENTITY
                </div>
                <div className="text-zinc-950 dark:text-zinc-100 text-sm font-bold tracking-tight">
                  {project.client || "INTERNAL_LAB"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase mb-3 tracking-[0.4em]">RELEASE_CYCLE</div>
                <div className="text-zinc-950 dark:text-zinc-100 text-sm font-bold">
                  {new Date(project.createdAt).getFullYear()}
                </div>
              </div>
            </div>

            <div className="space-y-8 flex-1 min-w-[200px]">
              <div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase mb-3 tracking-[0.4em]">CORE_SERVICES</div>
                <div className="flex flex-wrap gap-2">
                  {(project.services || []).map((service, idx) => (
                    <span key={idx} className="text-zinc-600 dark:text-zinc-300 text-[10px] px-2 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-sm font-black tracking-widest uppercase transition-colors duration-500">
                      {service}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-600 font-black uppercase mb-3 tracking-[0.4em]">TECH_STACK</div>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {(project.technologies || []).map((tech, idx) => (
                    <span key={idx} className="text-green-500 text-[10px] font-black tracking-widest">
                      #{tech.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:border-l md:border-zinc-200 dark:md:border-zinc-900 md:pl-12 flex flex-col justify-between py-1 transition-colors duration-500">
              <div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-600 font-black uppercase mb-3 tracking-[0.4em]">SYSTEM_STATUS</div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 text-[10px] font-black rounded-sm tracking-widest uppercase">
                    DEPLOYED_STABLE
                  </div>
                </div>
              </div>
              <div className="mt-8 md:mt-0 flex flex-wrap gap-4">
                {project.website && (
                  <Link
                    href={project.website}
                    target="_blank"
                    className="group inline-flex items-center gap-4 px-8 py-4 bg-zinc-950 dark:bg-zinc-100 text-white dark:text-black text-[10px] font-black uppercase tracking-widest hover:bg-green-600 dark:hover:bg-green-500 transition-all duration-300"
                  >
                    {project.github ? "LIVE_DEPLOYMENT" : "INITIALIZE_SOURCE"}
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                )}
                {project.github && (
                  <Link
                    href={project.github}
                    target="_blank"
                    className="group inline-flex items-center gap-4 px-8 py-4 bg-transparent border border-zinc-950 dark:border-zinc-800 text-zinc-950 dark:text-white text-[10px] font-black uppercase tracking-widest hover:border-green-600 dark:hover:border-green-500 hover:text-green-600 dark:hover:text-green-500 transition-all duration-300"
                  >
                    SOURCE_CODE
                    <span className="group-hover:translate-x-1 transition-transform opacity-50">#</span>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Project Documentation */}
          <div className="space-y-24 py-12">
            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-green-500 font-black text-sm tracking-tighter">[ 01 ]</span>
                <h2 className="text-lg text-zinc-950 dark:text-white font-black tracking-[0.4em] uppercase">OVERVIEW</h2>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900 group-hover:bg-green-500/30 transition-colors"></div>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-headings:text-zinc-950 dark:prose-headings:text-white prose-strong:text-green-600 dark:prose-strong:text-green-500 font-medium">
                <MDXRemote source={(project.about || "").replace(/\\n/g, '\n')} options={mdxOptions} components={components} />
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-green-500 font-black text-sm tracking-tighter">[ 02 ]</span>
                <h2 className="text-lg text-zinc-950 dark:text-white font-black tracking-[0.4em] uppercase">THE_GOAL</h2>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900 group-hover:bg-green-500/30 transition-colors"></div>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-headings:text-zinc-950 dark:prose-headings:text-white prose-strong:text-green-600 dark:prose-strong:text-green-500 font-medium">
                <MDXRemote source={(project.goal || "").replace(/\\n/g, '\n')} options={mdxOptions} components={components} />
              </div>
              {project.goalImages && project.goalImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  {project.goalImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-video border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 group/img overflow-hidden">
                      <img
                        src={img}
                        alt={`${project?.title} Goal ${idx + 1}`}
                        className="object-cover w-full h-full grayscale opacity-50 group-hover/img:grayscale-0 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <div className="absolute bottom-4 left-4 text-[8px] font-black tracking-widest text-zinc-500 uppercase opacity-0 group-hover/img:opacity-100 transition-opacity">
                        IMAGE_REF_0{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-green-500 font-black text-sm tracking-tighter">[ 03 ]</span>
                <h2 className="text-lg text-zinc-950 dark:text-white font-black tracking-[0.4em] uppercase">EXECUTION</h2>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900 group-hover:bg-green-500/30 transition-colors"></div>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-headings:text-zinc-950 dark:prose-headings:text-white prose-strong:text-green-600 dark:prose-strong:text-green-500 font-medium">
                <MDXRemote source={(project.execution || "").replace(/\\n/g, '\n')} options={mdxOptions} components={components} />
              </div>
            </section>

            <section className="group">
              <div className="flex items-center gap-4 mb-8">
                <span className="text-green-500 font-black text-sm tracking-tighter">[ 04 ]</span>
                <h2 className="text-lg text-zinc-950 dark:text-white font-black tracking-[0.4em] uppercase">OUTCOME</h2>
                <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-zinc-900 group-hover:bg-green-500/30 transition-colors"></div>
              </div>
              <div className="prose prose-invert prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 dark:prose-p:text-zinc-400 prose-headings:text-zinc-950 dark:prose-headings:text-white prose-strong:text-green-600 dark:prose-strong:text-green-500 font-medium">
                <MDXRemote source={(project.results || "").replace(/\\n/g, '\n')} options={mdxOptions} components={components} />
              </div>
              {project.resultImages && project.resultImages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {project.resultImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-[4/3] border border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-950 group/img overflow-hidden">
                      <img
                        src={img}
                        alt={`${project?.title} Result ${idx + 1}`}
                        className="object-cover w-full h-full grayscale opacity-50 group-hover/img:grayscale-0 group-hover/img:opacity-100 group-hover/img:scale-105 transition-all duration-700 ease-in-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 pointer-events-none" />
                      <div className="absolute bottom-4 left-4 text-[8px] font-black tracking-widest text-zinc-500 uppercase opacity-0 group-hover/img:opacity-100 transition-opacity">
                        DEPLOYMENT_VIEW_0{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer - Navigation */}
          <footer className="pt-24 border-t border-zinc-200 dark:border-zinc-900">
            <Link href="/portfolio" className="group flex items-center gap-4 text-zinc-600 hover:text-zinc-950 dark:hover:text-white transition-all font-black text-[10px] tracking-[0.4em]">
              <span className="group-hover:-translate-x-2 transition-transform text-green-600">&lt;&lt;</span>
              <span>BACK_TO_ROOT_DIRECTORY</span>
            </Link>
          </footer>
        </ClientMotionWrapper>
      </div>
    </div>
  );
}
