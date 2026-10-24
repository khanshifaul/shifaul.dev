"use client"

import { usePathname } from "next/navigation"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { data } from "@/lib/sidebar-data"
import React from "react"

export function DynamicBreadcrumb() {
    const pathname = usePathname()

    // Helper to find breadcrumb titles based on path
    const getBreadcrumbs = (path: string) => {
        const segments = path.split('/').filter(Boolean)
        const crumbs: { title: string; href?: string }[] = [

        ]

        if (segments.length === 0) return crumbs

        let currentPath = ""

        // Find matching navigation items
        for (const segment of segments) {
            currentPath += `/${segment}`

            // Search in navMain
            let found = false
            for (const group of data.navMain) {
                // Check items within groups
                if (group.items) {
                    for (const item of group.items) {
                        if (item.url === currentPath) {
                            crumbs.push({ title: item.title, href: item.url })
                            found = true
                            break
                        }
                    }
                }
                if (found) break;
            }

            // If not found in sidebar (e.g. details page), just capitalize segment
            if (!found) {
                const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
                crumbs.push({ title, href: currentPath })
            }
        }

        return crumbs
    }

    const breadcrumbs = getBreadcrumbs(pathname)

    if (breadcrumbs.length === 0) return null;

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1

                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                {isLast ? (
                                    <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                ) : (
                                    crumb.href ? (
                                        <BreadcrumbLink href={crumb.href}>
                                            {crumb.title}
                                        </BreadcrumbLink>
                                    ) : (
                                        <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                                    )
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
