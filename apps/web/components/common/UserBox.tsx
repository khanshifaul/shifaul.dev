'use client';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/hooks/useAuth";
import useTheme from "@/lib/hooks/useTheme";
import { useWindowSize } from "@/lib/hooks/useWindowSize";
import { logout } from "@/lib/store/slices/authSlice";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LuCog, LuLogOut, LuMoon, LuSun } from "react-icons/lu";
import { useDispatch } from "react-redux";

interface UserBoxProps {
  showLabels?: boolean;
  color?: string;
  avatar?: string;
  isExpired?: boolean;
  remainingTime?: {
    text: string;
    unit: string;
    value: number;
  };
}

export const UserBox = ({
  showLabels = false,
  color = "default",
  avatar = "/images/avatar/avatar1.png",
}: UserBoxProps) => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useWindowSize();
  const { mode, toggleMode } = useTheme();
  const dispatch = useDispatch();
  const router = useRouter();
  const effectiveShowLabels = showLabels || isMobile || isTablet;

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full flex justify-center">
        {/* Render a default state or skeleton to match server-side as best as possible, 
                or just the icon version if that's the default safe state */}
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {effectiveShowLabels ? (
            <div
              className={cn(
                "dark:text-white flex gap-3 items-center cursor-pointer",
                color === "cosmic" ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Avatar className="w-10 h-10">
                <AvatarImage
                  src={avatar}
                  alt={`${user?.name || "User"} profile picture`}
                />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="max-w-[75%] min-w-0">
                <p className="text-lg leading-6 font-semibold capitalize truncate">
                  {user?.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full flex justify-center">
              <Avatar className="w-8 h-8 transition-transform duration-200 hover:scale-110 cursor-pointer">
                <AvatarImage
                  src={avatar}
                  alt={`${user?.name || "User"} profile picture`}
                />
                <AvatarFallback>{user?.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={isMobile || isTablet ? "top" : "bottom"}
          align={isMobile || isTablet ? "center" : "end"}
        >
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/profile">
              <LuCog className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={toggleMode} className="cursor-pointer">
            {mode === "light" ? (
              <LuMoon className="h-4 w-4" />
            ) : (
              <LuSun className="h-4 w-4" />
            )}
            <span>{mode === "light" ? "Dark Mode" : "Light Mode"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
            <LuLogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};