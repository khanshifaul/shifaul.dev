"use client";

import { useAppSelector } from "@/lib/store/hooks";
import { selectCurrentUser, selectIsInitialized, selectIsLoggedIn } from "@/lib/store/slices/authSlice";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface AdminGuardProps {
    children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
    const router = useRouter();
    const isInitialized = useAppSelector(selectIsInitialized);
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const user = useAppSelector(selectCurrentUser);

    useEffect(() => {
        if (isInitialized) {
            if (!isLoggedIn) {
                router.push("/sign-in");
            } else {
                const isAdmin = user?.roles?.some(role => role.toUpperCase() === "ADMIN");

                if (!isAdmin) {
                    router.push("/admin");
                }
            }
        }
    }, [isInitialized, isLoggedIn, user, router]);

    if (!isInitialized) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return null;
    }

    return <>{children}</>;
}
