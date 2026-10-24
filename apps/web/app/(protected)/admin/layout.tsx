"use client"

import { useState, useEffect } from "react"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { DynamicBreadcrumb } from "@/components/layout/dynamic-breadcrumb"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { AppSidebar } from "@/components/common/AppSidebar"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRouter } from "next/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoggedIn, user, isInitialized } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth initialization

    // Check auth and role
    if (!isLoggedIn) {
      router.push("/sign-in")
      return
    }

    if (user && !user.roles.includes("admin")) {
      router.push("/sign-in")
      return
    }

    // Give time for screen size detection and initial render
    const timer = setTimeout(() => {
      setMounted(true)
    }, 100)
    return () => clearTimeout(timer)
  }, [isInitialized, isLoggedIn, user, router])

  if (!isInitialized || !mounted || !isLoggedIn || (user && !user.roles.includes("admin"))) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar collapsible="icon" variant="inset" />
      <SidebarInset>
        <header className="bg-background flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 max-h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
