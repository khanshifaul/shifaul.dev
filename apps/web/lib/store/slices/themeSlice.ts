import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type ThemeMode = "light" | "dark";

type ThemeState = {
  mode: ThemeMode;
};

const initialState: ThemeState = {
  mode: "light",
};

const themeSlice = createSlice({
  name: "theme",
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
  },
});

export const { setThemeMode, toggleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
