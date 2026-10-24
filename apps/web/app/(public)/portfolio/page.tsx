"use client";
import { getPublicProjects, type Project } from "@/lib/actions/projectsApi";
import { Backgrounds } from "@/components/common/Backgrounds";
import { Globe } from "@/components/common/Globe";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import TerminalProjectCard from "./_components/TerminalProjectCard";
import { RadarSweep } from "@/components/common/RadarSweep";
import SearchForm from "../blog/_components/search-form";

const PortfolioPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");

  const loaderRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  const fetchProjects = useCallback(async (pageNum: number, query: string = "") => {
    if (loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await getPublicProjects({ page: pageNum, limit: 6, search: query });

      if (response.data?.success && response.data.data) {
        let newProjects = response.data.data;
        const isFallback = response.data.message?.includes("LOCAL_VAULT_FALLBACK");

        if (isFallback && query) {
          const isMatch = (target?: string) => {
            if (!target) return false;
            const nTarget = target.toLowerCase().replace(/[^a-z0-9]/g, '');
            const nQuery = query.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!nTarget || !nQuery) return false;
            return nTarget.includes(nQuery) || (nQuery.length > 3 && nQuery.includes(nTarget));
          };

          newProjects = newProjects.filter(p =>
            isMatch(p.title) ||
            isMatch(p.about) ||
            p.technologies?.some(t => isMatch(t)) ||
            p.services?.some(s => isMatch(s)) ||
            p.tags?.some(tag => isMatch(tag.name))
          );
        }

        if (newProjects.length === 0) {
          setHasMore(false);
        } else {
          setProjects((prev) => {
            // Filter out duplicates just in case
            const existingIds = new Set(prev.map(p => p.id));
            const filtered = newProjects.filter(p => !existingIds.has(p.id));
            return [...prev, ...filtered];
          });

          if (isFallback) {
            // If local vault fallback is active, we assume all data is loaded at once
            setHasMore(false);
          } else {
            setPage(pageNum + 1);
            // If we got fewer than requested, there's no more
            if (newProjects.length < 6) {
              setHasMore(false);
            }
          }
        }
      } else {
        setHasMore(false);
        if (pageNum === 1) {
          setError(response.data?.message || "Failed to fetch projects");
        }
      }
    } catch (err) {
      console.error("Failed to fetch projects:", err);
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
        setProjects([]);
        setPage(1);
        setHasMore(true);
        fetchProjects(1, searchInput);
      }
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [searchInput, activeQuery, fetchProjects]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput !== activeQuery) {
      setActiveQuery(searchInput);
      setProjects([]);
      setPage(1);
      setHasMore(true);
      fetchProjects(1, searchInput);
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      fetchProjects(1, "");
      isInitialMount.current = false;
    }
  }, [fetchProjects]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchProjects(page, activeQuery);
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
  }, [fetchProjects, page, hasMore, loading, activeQuery]);

  return (
    <div className="min-h-screen text-zinc-600 dark:text-zinc-400 font-mono selection:bg-green-500 selection:text-black">
      {/* Universal Terminal Backgrounds */}
      <div className="fixed inset-0 pointer-events-none">
        <Backgrounds />
        <Globe />
        <RadarSweep />

      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 md:py-24">
        {/* Terminal Header */}
        <header className="mb-20 border-b border-zinc-200 dark:border-zinc-900 pb-12 flex flex-col md:flex-row items-end justify-between gap-8">
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
                ARCHIVE<span className="text-green-600 dark:text-green-500 animate-pulse">_</span>
              </h1>
              <p className="text-zinc-500 dark:text-zinc-600 text-[10px] font-black uppercase tracking-tight md:tracking-[0.4em]">
                [ Directory: /dev/projects ]
              </p>
            </div>

            <div className="bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-sm p-6 border-l-2 border-green-600 dark:border-green-500/50 text-sm leading-relaxed max-w-2xl">
              <span className="text-green-600 dark:text-green-500 font-bold">$</span> cat readme.txt
              <br />
              <span className="text-zinc-600 dark:text-zinc-500 mt-3 block">
                Welcome to the digital vault. Below is a stream of projects, experiments, and architectural artifacts.
              </span>
            </div>

          </motion.div>
          <div className="w-full md:w-1/2">
            <SearchForm
              value={searchInput}
              onChange={setSearchInput}
              onSubmit={handleSearchSubmit}
              placeholder="SEARCH_PROJECTS..."
            />
          </div>
        </header>

        {/* Project List */}
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: (index % 6) * 0.05 }}
              >
                <TerminalProjectCard project={project as any} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Loader / Infinite Scroll Trigger */}
        <div ref={loaderRef} className="py-24 text-center min-h-[200px] flex flex-col items-center justify-center">
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

          {!hasMore && projects.length > 0 && (
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

          {!loading && hasMore && projects.length === 0 && !error && (
            <div className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">INITIALIZING_QUERY...</div>
          )}
        </div>
      </div>
    </div>
  );
};


export default PortfolioPage;

