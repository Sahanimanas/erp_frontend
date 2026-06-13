/**
 * academicApi.js — Academic sessions (a.k.a. academic years) per school.
 * Backend: /api/v1/academic/years
 *
 * A session is named like "2025-2026" and carries a start/end date. These feed
 * every "Session" dropdown across the app (Add Student, Admission, etc.).
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const academicApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getSessions: build.query({
      query: () => "/academic/years",
      transformResponse: unwrap,
      providesTags: ["Sessions"],
    }),
    createSession: build.mutation({
      query: (body) => ({ url: "/academic/years", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Sessions"],
    }),
    deleteSession: build.mutation({
      query: (id) => ({ url: `/academic/years/${id}`, method: "DELETE" }),
      transformResponse: unwrap,
      invalidatesTags: ["Sessions"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
} = academicApi;
