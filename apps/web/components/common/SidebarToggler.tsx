"use client";
import { useSidebar } from "@/components/ui/sidebar";
import { LuMenu } from "react-icons/lu";

export function SidebarToggler() {
  const { toggleSidebar } = useSidebar();

  return (
    <button onClick={toggleSidebar} className="p-2 cursor-pointer">
      <LuMenu className="h-5 w-5" />
    </button>
  );
}
