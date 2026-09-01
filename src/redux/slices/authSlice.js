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
// Where a Super Admin's OWN session is parked while they are impersonating a
// school admin, so "Exit" can put them back instead of dumping them at /login.
const SUPER_KEY = "erp_auth_super";

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
      token:         state.token,
      refreshToken:  state.refreshToken,
      tokenExpiry:   state.tokenExpiry,
      user:          state.user,
      impersonation: state.impersonation,
    }));
  } catch { /* ignore */ }
}

function clearStorage() {
  localStorage.removeItem(LS_KEY);
  localStorage.removeItem(SUPER_KEY);
}

// ─── Initial state ────────────────────────────────────────────────────────
const persisted = loadFromStorage();

const initialState = {
  token:        persisted.token        ?? null,
  refreshToken: persisted.refreshToken ?? null,
  tokenExpiry:  persisted.tokenExpiry  ?? null,
  user:         persisted.user         ?? null,
  // { byEmail, byName, since } while a Super Admin is signed in AS a school
  // admin; null in an ordinary session. Drives the impersonation banner — the
  // only on-screen difference between "I am the school admin" and "I am still
  // the Super Admin", which is exactly what Change Password depends on.
  impersonation: persisted.impersonation ?? null,
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
      state.impersonation = null;                 // a real login is never an impersonation
      state.error        = null;
      try { localStorage.removeItem(SUPER_KEY); } catch { /* ignore */ }
      saveToStorage(state);
    },

    /**
     * Super Admin → "Login as Admin". Swaps in the impersonation token but
     * parks the operator's own session first, and flags the session so the UI
     * can say whose account is on screen. Without the flag, an impersonated
     * session and the Super Admin's own session look identical — which is how
     * a "change password" ends up on the wrong account.
     */
    impersonateStart(state, { payload }) {
      try {
        if (!state.impersonation && state.token) {
          localStorage.setItem(SUPER_KEY, JSON.stringify({
            token:        state.token,
            refreshToken: state.refreshToken,
            tokenExpiry:  state.tokenExpiry,
            user:         state.user,
          }));
        }
      } catch { /* ignore */ }

      const operator = state.user;
      state.token        = payload.token;
      state.refreshToken = payload.refreshToken ?? null;
      state.tokenExpiry  = payload.tokenExpiry;
      state.user         = payload.user;
      state.impersonation = {
        byEmail: operator?.email ?? null,
        byName:  operator?.name ?? null,
        since:   Date.now(),
      };
      state.error = null;
      saveToStorage(state);
    },

    /** Leave an impersonated session and restore the Super Admin's own. */
    impersonationEnd(state) {
      let parked = null;
      try {
        parked = JSON.parse(localStorage.getItem(SUPER_KEY));
        localStorage.removeItem(SUPER_KEY);
      } catch { /* ignore */ }

      state.impersonation = null;
      if (parked?.token) {
        state.token        = parked.token;
        state.refreshToken = parked.refreshToken ?? null;
        state.tokenExpiry  = parked.tokenExpiry ?? null;
        state.user         = parked.user ?? null;
        state.error        = null;
        saveToStorage(state);
      } else {
        // Nothing parked (older session, cleared storage) → clean logout.
        state.token        = null;
        state.refreshToken = null;
        state.tokenExpiry  = null;
        state.user         = null;
        state.error        = null;
        clearStorage();
      }
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
      state.impersonation = null;
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
  impersonateStart,
  impersonationEnd,
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
// Non-null while a Super Admin is signed in as somebody else.
export const selectImpersonation = (state) => state.auth.impersonation ?? null;
// Designation module privileges; `null`/`undefined` ⇒ not restricted.
export const selectUserPermissions = (state) => state.auth.user?.permissions ?? null;

export default authSlice.reducer;
