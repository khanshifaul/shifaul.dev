"use client";

import { Button } from "@/components/ui/button";
import { getBlogPostStats } from "@/lib/actions/blogApi";
import { getContactMessageStats } from "@/lib/actions/contactApi";
import { getNewsletterSubscribers } from "@/lib/actions/newsletterApi";
import { getProjectStats } from "@/lib/actions/projectsApi";
import { getVisitorStats, getActiveVisitors } from "@/lib/actions/analyticsApi";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PiProjectorScreenChart } from "react-icons/pi";
import { RecentActivity } from "./_components/recent-activity";
import { StatsCard } from "./_components/stats-card";
import { DashboardChart } from "./_components/dashboard-chart";
import { LuBookOpen, LuExternalLink, LuFilePlus, LuFileText, LuMessageSquare, LuPlus, LuSettings, LuTarget, LuUser, LuUsers } from "react-icons/lu";

interface DashboardStats {
  posts: number;
  projects: number;
  messages: number;
  subscribers: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    posts: 0,
    projects: 0,
    messages: 0,
    subscribers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<any[]>([]);
  const [emqScore, setEmqScore] = useState<string>("0.0");
  const [activeVisitors, setActiveVisitors] = useState<number>(0);
  const [timeRange, setTimeRange] = useState<string>("7d");

  useEffect(() => {
    async function fetchStats() {
      try {
        const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        const token = accessToken || undefined;

        // Fetch all stats in parallel using Promise.allSettled to prevent one failure from breaking the page
        const results = await Promise.allSettled([
          getBlogPostStats(token),
          getProjectStats(token),
          getContactMessageStats(token),
          getNewsletterSubscribers({ limit: 1 }),
          getVisitorStats(timeRange, token),
          getActiveVisitors(token),
        ]);

        const [postsResult, projectsResult, messagesResult, subscribersResult, visitorStatsResult, activeVisitorsResult] = results;

        // Helper to safely extract data from settled promise
        const getVal = (result: PromiseSettledResult<any>, path: (data: any) => number) => {
          if (result.status === 'fulfilled') {
            try {
              return path(result.value);
            } catch (e) {
              console.error("Error parsing stats result", e);
              return 0;
            }
          } else {
            console.error("Failed to fetch specific stat:", result.reason);
            return 0;
          }
        };

        setStats({
          posts: getVal(postsResult, d => d.data.data?.total) || 0,
          projects: getVal(projectsResult, d => d.data.data?.total) || 0,
          messages: getVal(messagesResult, d => d.data.data?.total) || 0,
          subscribers: getVal(subscribersResult, d => d.data.pagination?.total) || 0,
        });

        if (visitorStatsResult.status === 'fulfilled') {
          setVisitorStats(visitorStatsResult.value.data.data?.stats || []);
          setEmqScore(visitorStatsResult.value.data.data?.avgEmqScore || '0.0');
        }

        if (activeVisitorsResult.status === 'fulfilled') {
          setActiveVisitors(activeVisitorsResult.value.data.data || 0);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [timeRange]);

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="bg-gradient-to-r from-primary/10 via-accent/5 to-transparent p-6 rounded-xl border border-border/50">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, Shifaul! 👋</h2>
        <p className="text-muted-foreground mt-1">
          Here's a quick overview of your portfolio and blog performance.
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Projects"
          value={stats.projects}
          icon={PiProjectorScreenChart}
          description="Portfolio projects"
          loading={loading}
        />
        <StatsCard
          title="Blog Posts"
          value={stats.posts}
          icon={LuFileText}
          description="Published and drafts"
          loading={loading}
        />
        <StatsCard
          title="Messages"
          value={stats.messages}
          icon={LuMessageSquare}
          description="Contact form submissions"
          loading={loading}
        />
        <StatsCard
          title="Subscribers"
          value={stats.subscribers}
          icon={LuUsers}
          description="Newsletter subscribers"
          loading={loading}
        />
        <StatsCard
          title="Active Visitors"
          value={activeVisitors}
          icon={LuUsers}
          description="Unique sessions in last 5m"
          loading={loading}
        />
        <StatsCard
          title="Avg EMQ Score"
          value={emqScore}
          icon={LuTarget}
          description="Event Match Quality (0-10)"
          loading={loading}
        />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <DashboardChart data={visitorStats} timeRange={timeRange} onRangeChange={setTimeRange} />
        <RecentActivity />
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow">
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">Shortcuts to common tasks</p>
        </div>
        <div className="p-6 pt-0 grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/blog-posts/new">
              <LuFilePlus className="h-6 w-6 text-primary" />
              <span>New Post</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/projects/new">
              <LuPlus className="h-6 w-6 text-primary" />
              <span>Add Project</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/messages">
              <LuMessageSquare className="h-6 w-6 text-primary" />
              <span>Messages</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/settings">
              <LuSettings className="h-6 w-6 text-primary" />
              <span>Settings</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/subscribers">
              <LuUsers className="h-6 w-6 text-primary" />
              <span>Subscribers</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/admin/users">
              <LuUser className="h-6 w-6 text-primary" />
              <span>Users</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/" target="_blank">
              <LuExternalLink className="h-6 w-6 text-primary" />
              <span>View Site</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer" asChild>
            <Link href="/blog" target="_blank">
              <LuBookOpen className="h-6 w-6 text-primary" />
              <span>View Blog</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
