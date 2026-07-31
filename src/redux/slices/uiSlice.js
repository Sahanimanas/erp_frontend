/**
 * uiSlice.js
 * Manages all UI state: sidebar, dark mode, active nav section.
 */
import { createSlice } from "@reduxjs/toolkit";

// Dark mode is scoped to the sidebar only (the `dark` class is put on the
// <aside>, not on <html>), but the preference itself survives reloads.
// Dark is the default: only an explicit "0" written by the toggle turns it off,
// so a first-time visitor (nothing stored) gets the dark sidebar.
const DARK_KEY = "erp_sidebar_dark";
const readDark = () => {
  try { return localStorage.getItem(DARK_KEY) !== "0"; } catch { return true; }
};
const writeDark = (on) => {
  try { localStorage.setItem(DARK_KEY, on ? "1" : "0"); } catch { /* ignore */ }
};

const initialState = {
  sidebarCollapsed: false,
  darkMode: readDark(),
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
      writeDark(state.darkMode);
    },
    setDarkMode(state, { payload }) {
      state.darkMode = !!payload;
      writeDark(state.darkMode);
    },
    // Accordion behaviour: only one section open at a time. Opening a section
    // closes any other; clicking the open one collapses it.
    toggleSection(state, { payload: key }) {
      state.expandedSections = state.expandedSections.includes(key) ? [] : [key];
    },
    openSection(state, { payload: key }) {
      // Auto-expand (e.g. on the active route) — collapse others to keep the
      // accordion to a single open section.
      if (!state.expandedSections.includes(key)) {
        state.expandedSections = [key];
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
  setDarkMode,
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
