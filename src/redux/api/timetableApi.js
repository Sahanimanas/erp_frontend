/**
 * timetableApi.js — rich, video-style class timetable (under Class Management).
 * Backend: /api/v1/timetable
 *
 * ONE record per (section, timetable-session DEFAULT|ONLINE, academic year) is
 * the single source of truth. Every page (Add builder, View, Teacher Allotment,
 * View Allotment, Employee Timetable, Session Timetable) reads it and all share
 * the "Timetable" cache tag, so saving on one page instantly refreshes the rest.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const timetableApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // One section's timetable for a timetable-session (Add / View / Allotment).
    getTimetable: build.query({
      query: ({ sectionId, session = "DEFAULT", academicYearId }) => ({
        url: "/timetable",
        params: { sectionId, session, ...(academicYearId ? { academicYearId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Timetable"],
    }),

    // Save the whole grid (subjects + times, or teacher allotment) in one call.
    saveTimetable: build.mutation({
      query: (body) => ({ url: "/timetable", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Timetable"],
    }),

    // A single teacher's week across every class.
    getEmployeeTimetable: build.query({
      query: ({ employeeId, session = "DEFAULT", academicYearId }) => ({
        url: "/timetable/employee",
        params: { employeeId, session, ...(academicYearId ? { academicYearId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Timetable"],
    }),

    // Every class's periods for ONE weekday.
    getSessionDayTimetable: build.query({
      query: ({ day, session = "DEFAULT", academicYearId }) => ({
        url: "/timetable/session-day",
        params: { day, session, ...(academicYearId ? { academicYearId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Timetable"],
    }),

    // Staff list for class-teacher + per-cell teacher dropdowns.
    getTimetableTeachers: build.query({
      query: () => ({ url: "/employees", params: { limit: 500 } }),
      transformResponse: (res) =>
        (res?.data ?? res ?? []).map((e) => ({
          id: e.id,
          name: `${e.user?.firstName ?? ""} ${e.user?.lastName ?? ""}`.trim() || e.employeeCode || "—",
          role: e.user?.role,
        })),
      providesTags: ["Teachers"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetTimetableQuery,
  useSaveTimetableMutation,
  useGetEmployeeTimetableQuery,
  useGetSessionDayTimetableQuery,
  useGetTimetableTeachersQuery,
} = timetableApi;
