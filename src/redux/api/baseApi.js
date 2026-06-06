/**
 * baseApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * RTK Query base API setup.
 *
 * ALL other API slices (studentsApi, feesApi, etc.) are injected into
 * this single base instance → they share the same cache + middleware.
 *
 * Auth flow:
 *   1. prepareHeaders injects the Bearer token from Redux state.
 *   2. baseQueryWithReauth intercepts 401 responses and tries a
 *      silent token refresh. If refresh fails → dispatch logout().
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { tokenRefreshed, logout } from "../slices/authSlice";

// ─── Base query with auto-refresh ─────────────────────────────────────────
const rawBaseQuery = fetchBaseQuery({
  baseUrl: "http://localhost:5000/api",

  prepareHeaders(headers, { getState }) {
    const token = getState().auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    headers.set("Content-Type", "application/json");
    return headers;
  },
});

async function baseQueryWithReauth(args, api, extraOptions) {
  let result = await rawBaseQuery(args, api, extraOptions);

  // 401 → try to refresh the token
  if (result.error?.status === 401) {
    const refreshToken = api.getState().auth.refreshToken;

    if (refreshToken) {
      const refreshResult = await rawBaseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        api.dispatch(tokenRefreshed(refreshResult.data));
        // Retry original query with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        // Refresh failed → force logout
        api.dispatch(logout());
      }
    } else {
      api.dispatch(logout());
    }
  }

  return result;
}

// ─── Base API ─────────────────────────────────────────────────────────────
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery:   baseQueryWithReauth,

  // Global cache invalidation tags
  tagTypes: [
    "Auth", "Students", "Teachers", "Parents",
    "Attendance", "Fees", "Exams", "Library",
    "Transport", "Hostel", "HR", "Accounting",
    "Settings", "Notifications", "Inventory",
    "Communication", "Reports",
  ],

  // No endpoints here — all injected via injectEndpoints() in individual service files
  endpoints: () => ({}),
});
