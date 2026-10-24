import { createSlice } from "@reduxjs/toolkit";

interface NavigationState {
  isOpen: boolean;
  isFilterOpen: boolean;
}

const initialState: NavigationState = {
  isOpen: false,
  isFilterOpen: false,
};

export const navigationSlice = createSlice({
  name: "navigation",
  initialState,
  reducers: (create) => ({
    openNav: create.reducer((state) => {
      state.isOpen = true;
    }),
    closeNav: create.reducer((state) => {
      state.isOpen = false;
    }),
    toggleFilter: create.reducer((state) => {
      state.isFilterOpen = !state.isFilterOpen;
    }),
    openFilter: create.reducer((state) => {
      state.isFilterOpen = true;
    }),
    closeFilter: create.reducer((state) => {
      state.isFilterOpen = false;
    }),
  }),
  selectors: {
    selectNavIsOpen: (navigation) => navigation.isOpen,
    selectFilterIsOpen: (navigation) => navigation.isFilterOpen,
  },
});

export const { openNav, closeNav, toggleFilter, openFilter, closeFilter } =
  navigationSlice.actions;

export default navigationSlice.reducer;
