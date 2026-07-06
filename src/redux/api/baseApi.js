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
// Use the same API origin as the axios client (services/axios.js). Falls back to
// the local backend (port 3000, /api/v1) when VITE_API_URL is unset.
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,

  prepareHeaders(headers, { getState }) {
    // Prefer the in-memory Redux token; fall back to the persisted localStorage
    // token so RTK Query works on a hard refresh before the slice rehydrates.
    let token = getState().auth?.token;
    if (!token) {
      try {
        token = JSON.parse(localStorage.getItem("erp_auth"))?.token;
      } catch {
        /* ignore */
      }
    }
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

      // Backend envelope: { success, data: { accessToken, refreshToken } }
      const newAccess = refreshResult.data?.data?.accessToken;
      if (newAccess) {
        api.dispatch(
          tokenRefreshed({
            token: newAccess,
            tokenExpiry: Date.now() + 15 * 60 * 1000,
          })
        );
        // Keep localStorage in sync for the axios client.
        try {
          const persisted = JSON.parse(localStorage.getItem("erp_auth")) ?? {};
          localStorage.setItem(
            "erp_auth",
            JSON.stringify({
              ...persisted,
              token: newAccess,
              refreshToken: refreshResult.data?.data?.refreshToken ?? persisted.refreshToken,
              tokenExpiry: Date.now() + 15 * 60 * 1000,
            })
          );
        } catch {
          /* ignore */
        }
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
    // Super Admin (platform) tags
    "SaAnalytics", "SaSchools", "SaSchool", "SaPlans",
    "SaDomains", "SaAudit", "SaSubscription", "SaUsers",
    // Admission
    "Admission", "AdmissionStats",
    // Academic structure (classes / sections) + sessions (academic years)
    "Academic", "Sessions",
    // Fee management
    "FeeType", "FeeStructure", "TransportRoute",
    // Payments
    "Ledger", "PaymentHistory", "LateFeeRule",
    // Exam management
    "Grading", "ExamSchedule", "ExamHall", "ExamSeat", "ExamAttendance",
    // Subjects / timetable
    "Periods", "Timetable",
  ],

  // No endpoints here — all injected via injectEndpoints() in individual service files
  endpoints: () => ({}),
});
