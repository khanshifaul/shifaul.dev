"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logout, setInitialized } from "@/lib/store/slices/authSlice";
import { refreshToken } from "@/lib/actions/authAPi";

export const AuthHydrator = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch();

    useEffect(() => {
        const hydrateAuth = async () => {
            const storedRefreshToken =
                localStorage.getItem("refreshToken") ||
                sessionStorage.getItem("refreshToken");

            if (storedRefreshToken) {
                try {
                    await refreshToken(storedRefreshToken, dispatch);
                    console.log("✅ [AuthHydrator] User session restored.");
                } catch (error) {
                    console.error("❌ [AuthHydrator] Failed to restore session:", error);
                    dispatch(logout());
                }
            }
        };

        hydrateAuth().finally(() => {
            dispatch(setInitialized(true));
        });
    }, [dispatch]);

    return <>{children}</>;
};
