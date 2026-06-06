/**
 * uiSlice.js
 * Manages all UI state: sidebar, dark mode, active nav section.
 */
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarCollapsed: false,
  darkMode: false,
  expandedSections: [],   // array of nav item keys that are open
  mobileOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, { payload }) {
      state.sidebarCollapsed = payload;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
    },
    toggleSection(state, { payload: key }) {
      if (state.expandedSections.includes(key)) {
        state.expandedSections = state.expandedSections.filter((k) => k !== key);
      } else {
        state.expandedSections = [...state.expandedSections, key];
      }
    },
    openSection(state, { payload: key }) {
      if (!state.expandedSections.includes(key)) {
        state.expandedSections.push(key);
      }
    },
    closeAllSections(state) {
      state.expandedSections = [];
    },
    setMobileOpen(state, { payload }) {
      state.mobileOpen = payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleDarkMode,
  toggleSection,
  openSection,
  closeAllSections,
  setMobileOpen,
} = uiSlice.actions;

export const selectUI              = (state) => state.ui;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectDarkMode        = (state) => state.ui.darkMode;
export const selectExpandedSections = (state) => state.ui.expandedSections;

export default uiSlice.reducer;
