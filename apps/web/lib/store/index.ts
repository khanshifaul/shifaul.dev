// lib/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import navigationReducer from "./slices/navigationSlice";
import themeReducer from "./slices/themeSlice";
import authReducer from "./slices/authSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      navigation: navigationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ["persist/PERSIST"],
        },
      }),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
