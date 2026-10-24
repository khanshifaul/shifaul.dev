"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  LuArrowLeft,
  LuArrowUpRight,
  LuCopy,
  LuFileText,
  LuRotateCcw,
} from "react-icons/lu";
import { siteConfig } from "@/config/site.config";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

/**
 * Replaces the browser context menu with the site menu and blocks common
 * developer-tools shortcuts.
 */
export const ProtectionProvider = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable='true']")) {
        return;
      }
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Common DevTools shortcuts)
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && e.key === "u")
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="min-w-52">
        <ContextMenuLabel>{siteConfig.name}</ContextMenuLabel>
        <ContextMenuSeparator />
        {siteConfig.navItems
          .filter(
            ({ href }) =>
              pathname !== href &&
              (href === "/" || !pathname.startsWith(`${href}/`)),
          )
          .map((item) => (
            <ContextMenuItem
              key={item.href}
              onClick={() => window.location.assign(item.href)}
            >
              <LuArrowUpRight className="mr-2 h-4 w-4" aria-hidden="true" />
              {item.label}
            </ContextMenuItem>
        ))}
        {pathname !== "/resume" && (
          <ContextMenuItem onClick={() => window.location.assign("/resume")}>
            <LuFileText className="mr-2 h-4 w-4" aria-hidden="true" />
            View resume
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => window.history.back()}>
          <LuArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Go back
        </ContextMenuItem>
        <ContextMenuItem onClick={() => window.location.reload()}>
          <LuRotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
          Reload page
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => navigator.clipboard.writeText(window.location.href)}
        >
          <LuCopy className="mr-2 h-4 w-4" aria-hidden="true" />
          Copy page link
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
