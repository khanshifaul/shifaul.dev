"use client";

import React from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/lib/store";

import { AuthHydrator } from "@/components/providers/auth-hydrator";

const store = makeStore();

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator>{children}</AuthHydrator>
    </Provider>
  );
}

export default StoreProvider;
