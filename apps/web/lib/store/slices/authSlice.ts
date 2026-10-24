import type { RootState } from "@/lib/store";
import { createSlice } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

export type TUser = {
  id: string;
  email: string;
  name: string;
  avatar: string | null;
  provider: "LOCAL" | "GOOGLE" | "FACEBOOK" | "GITHUB";
  isEmailVerified: boolean;
  isTwoFactorEnabled: boolean;
  roles: string[];
};


type TAuthState = {
  user: null | TUser;
  accessToken: null | string;
  refreshToken: null | string;
  isInitialized: boolean;
};

const initialState: TAuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, accessToken, refreshToken } = action.payload;
      let decodedRole = null;

      if (accessToken) {
        try {
          const decoded: any = jwtDecode(accessToken);
          // Handle various role extraction cases (array, string, nested)
          const rawRole = decoded.role || decoded.roles || decoded.user?.role || decoded.user?.roles;

          if (Array.isArray(rawRole)) {
            decodedRole = rawRole[0]; // Take first role if array
          } else if (typeof rawRole === 'string') {
            decodedRole = rawRole;
          }

          console.log('🔓 [AuthSlice] Decoded token:', { role: decodedRole, sub: decoded.sub });
        } catch (e) {
          console.error('❌ [AuthSlice] Failed to decode token:', e);
        }
      }

      // Merge decoded role if user exists, prioritizing existing user.role if valid, otherwise decoded
      if (user) {
        state.user = {
          ...user,
          roles: user.roles || (decodedRole ? [decodedRole] : ["user"]) // Fallback to USER
        };
      } else {
        state.user = null;
      }

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;

      console.log('✅ [AuthSlice] State updated successfully', { roles: state.user?.roles });
    },
    setInitialized: (state, action) => {
      state.isInitialized = action.payload;
    },


    logout: (state) => {
      state.user = initialState.user;
      state.accessToken = initialState.accessToken;
      state.refreshToken = initialState.refreshToken;

      // Clear authentication tokens from storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");

      // Clear additional storages
      localStorage.removeItem("persist:root");
      localStorage.removeItem("playSound");

      // Clear cookies
      document.cookie.split(";").forEach((cookie) => {
        document.cookie = cookie.trim().split("=")[0] + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      });

      // Clear IndexedDB
      window.indexedDB.databases().then((dbs) => {
        dbs.forEach((db) => {
          if (db.name) window.indexedDB.deleteDatabase(db.name);
        });
      });

      // Clear Cache Storage
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            caches.delete(name);
          });
        });
      }

      // Unregister Service Workers
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });
      }

      console.info("User logged out successfully");
    },
  },
});

export const { setUser, logout, setInitialized } = authSlice.actions;

export const selectCurrentAccessToken = (state: RootState) => state.auth.accessToken;
export const selectCurrentRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsLoggedIn = (state: RootState) => {
  return !!state.auth.accessToken && !!state.auth.user;
};
export const selectIsInitialized = (state: RootState) => state.auth.isInitialized;
export default authSlice.reducer;