/**
 * authSlice.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages JWT auth state.
 *
 * State persisted to localStorage via the helper below so the user
 * stays logged in across page refreshes.
 */
import { createSlice } from "@reduxjs/toolkit";

// ─── Persist helpers ──────────────────────────────────────────────────────
const LS_KEY = "erp_auth";

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveToStorage(state) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({
      token:        state.token,
      refreshToken: state.refreshToken,
      tokenExpiry:  state.tokenExpiry,
      user:         state.user,
    }));
  } catch { /* ignore */ }
}

function clearStorage() {
  localStorage.removeItem(LS_KEY);
}

// ─── Initial state ────────────────────────────────────────────────────────
const persisted = loadFromStorage();

const initialState = {
  token:        persisted.token        ?? null,
  refreshToken: persisted.refreshToken ?? null,
  tokenExpiry:  persisted.tokenExpiry  ?? null,
  user:         persisted.user         ?? null,
  loading:      false,
  error:        null,
};

// ─── Slice ────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    /** Called after a successful login API response */
    loginSuccess(state, { payload }) {
      state.token        = payload.token;
      state.refreshToken = payload.refreshToken;
      state.tokenExpiry  = payload.tokenExpiry;   // Unix ms timestamp
      state.user         = payload.user;
      state.error        = null;
      saveToStorage(state);
    },

    /** Update access token after a refresh */
    tokenRefreshed(state, { payload }) {
      state.token       = payload.token;
      state.tokenExpiry = payload.tokenExpiry;
      saveToStorage(state);
    },

    /** Clear all auth data */
    logout(state) {
      state.token        = null;
      state.refreshToken = null;
      state.tokenExpiry  = null;
      state.user         = null;
      state.error        = null;
      clearStorage();
    },

    setAuthLoading(state, { payload }) {
      state.loading = payload;
    },

    setAuthError(state, { payload }) {
      state.error   = payload;
      state.loading = false;
    },
  },
});

// ─── Actions ──────────────────────────────────────────────────────────────
export const {
  loginSuccess,
  tokenRefreshed,
  logout,
  setAuthLoading,
  setAuthError,
} = authSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────
export const selectAuth       = (state) => state.auth;
export const selectToken      = (state) => state.auth.token;
export const selectUser       = (state) => state.auth.user;
export const selectUserRole   = (state) => state.auth.user?.role;

export default authSlice.reducer;
