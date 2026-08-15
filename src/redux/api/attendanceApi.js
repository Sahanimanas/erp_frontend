/**
 * attendanceApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All attendance-related REST endpoints.
 *
 * Backend expects:
 *   POST   /attendance/students           { studentId, date, status }
 *   GET    /attendance/students/:studentId  ?page&limit&month&year
 *   POST   /attendance/employees          { employeeId, date, status }
 *   GET    /attendance/employees/:employeeId
 *   GET    /attendance/sections/:sectionId/summary  ?startDate&endDate
 *   GET    /attendance/sections/:sectionId/monthly  ?month&year
 *   GET    /attendance/statistics        ?startDate&endDate
 */
import { baseApi } from "../api/baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // Mark student attendance for a specific date
    markStudentAttendance: build.mutation({
      query: (body) => ({
        url: "/attendance/students",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // Get student attendance records
    getStudentAttendance: build.query({
      query: ({ studentId, page = 1, limit = 30, month, year }) => {
        const params = { page, limit };
        if (month) params.month = month;
        if (year) params.year = year;
        return { url: `/attendance/students/${studentId}`, params };
      },
      providesTags: (_, __, { studentId }) => [{ type: "Attendance", id: studentId }],
    }),

    // Mark employee attendance for a specific date
    markEmployeeAttendance: build.mutation({
      query: (body) => ({
        url: "/attendance/employees",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Attendance", id: "LIST" }],
    }),

    // Get employee attendance records
    getEmployeeAttendance: build.query({
      query: ({ employeeId, page = 1, limit = 30 }) => ({
        url: `/attendance/employees/${employeeId}`,
        params: { page, limit },
      }),
      providesTags: (_, __, { employeeId }) => [{ type: "Attendance", id: employeeId }],
    }),

    // Get section attendance summary (date range)
    getSectionAttendanceSummary: build.query({
      query: ({ sectionId, startDate, endDate }) => ({
        url: `/attendance/sections/${sectionId}/summary`,
        params: { startDate, endDate },
      }),
      providesTags: (_, __, { sectionId }) => [{ type: "Attendance", id: sectionId }],
    }),

    // Get monthly attendance report for section
    getMonthlyAttendanceReport: build.query({
      query: ({ sectionId, month, year }) => ({
        url: `/attendance/sections/${sectionId}/monthly`,
        params: { month, year },
      }),
      providesTags: (_, __, { sectionId }) => [{ type: "Attendance", id: sectionId }],
    }),

    // Get attendance statistics (date range)
    getAttendanceStatistics: build.query({
      query: ({ startDate, endDate }) => ({
        url: "/attendance/statistics",
        params: { startDate, endDate },
      }),
      providesTags: [{ type: "Attendance", id: "STATS" }],
    }),

    // ── Roster + bulk endpoints (educationdesk-style screens) ──────────────
    // Employees with their attendance status for a single date (marking grid)
    getEmployeesDaily: build.query({
      query: (date) => ({ url: "/attendance/employees", params: { date } }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: [{ type: "Attendance", id: "EMP_DAILY" }],
    }),
    // Bulk save employee attendance
    markEmployeesBulk: build.mutation({
      query: ({ date, records }) => ({ url: "/attendance/employees/bulk", method: "POST", body: { date, records } }),
      transformResponse: (r) => r?.data ?? r,
      invalidatesTags: [{ type: "Attendance", id: "EMP_DAILY" }, { type: "Attendance", id: "LIST" }],
    }),
    // Employee attendance across a date range (optionally one employee)
    getEmployeeAttendanceRange: build.query({
      query: ({ startDate, endDate, employeeId }) => ({
        url: "/attendance/employees-range",
        params: { startDate, endDate, ...(employeeId ? { employeeId } : {}) },
      }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: [{ type: "Attendance", id: "EMP_RANGE" }],
    }),
    // Students with their status for a date, optionally narrowed to a section,
    // a whole class (all its sections) and/or an academic session.
    getStudentsDaily: build.query({
      query: ({ date, sectionId, classId, session } = {}) => ({
        url: "/attendance/students/daily",
        params: {
          date,
          ...(sectionId ? { sectionId } : {}),
          ...(!sectionId && classId ? { classId } : {}),
          ...(session ? { session } : {}),
        },
      }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: [{ type: "Attendance", id: "STU_DAILY" }],
    }),
    // Bulk save student attendance
    markStudentsBulk: build.mutation({
      query: ({ date, records }) => ({ url: "/attendance/students/bulk", method: "POST", body: { date, records } }),
      transformResponse: (r) => r?.data ?? r,
      invalidatesTags: [{ type: "Attendance", id: "STU_DAILY" }, { type: "Attendance", id: "LIST" }],
    }),

    // ── Academic selectors (Session → Class → Section) ─────────────────────
    getAcademicYears: build.query({
      query: () => ({ url: "/academic/years", params: { limit: 100 } }),
      transformResponse: (r) => r?.data ?? [],
    }),
    getClasses: build.query({
      query: () => ({ url: "/academic/classes", params: { limit: 200 } }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: [{ type: "Academic", id: "CLASSES" }],
    }),
    getSections: build.query({
      query: (classId) => ({ url: "/academic/sections", params: { limit: 500, ...(classId ? { classId } : {}) } }),
      transformResponse: (r) => r?.data ?? [],
      providesTags: [{ type: "Academic", id: "SECTIONS" }],
    }),

    // ── Class / Section management (Settings → Classes & Sections) ──────────
    // Creating/removing here refreshes every class & section dropdown app-wide
    // via the Academic cache tags above.
    createClass: build.mutation({
      query: (body) => ({ url: "/academic/classes", method: "POST", body }),
      transformResponse: (r) => r?.data ?? r,
      invalidatesTags: [{ type: "Academic", id: "CLASSES" }],
    }),
    deleteClass: build.mutation({
      query: (classId) => ({ url: `/academic/classes/${classId}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Academic", id: "CLASSES" }, { type: "Academic", id: "SECTIONS" }],
    }),
    createSection: build.mutation({
      query: (body) => ({ url: "/academic/sections", method: "POST", body }),
      transformResponse: (r) => r?.data ?? r,
      invalidatesTags: [{ type: "Academic", id: "SECTIONS" }, { type: "Academic", id: "CLASSES" }],
    }),
    deleteSection: build.mutation({
      query: (sectionId) => ({ url: `/academic/sections/${sectionId}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Academic", id: "SECTIONS" }, { type: "Academic", id: "CLASSES" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useMarkStudentAttendanceMutation,
  useGetStudentAttendanceQuery,
  useMarkEmployeeAttendanceMutation,
  useGetEmployeeAttendanceQuery,
  useGetSectionAttendanceSummaryQuery,
  useGetMonthlyAttendanceReportQuery,
  useGetAttendanceStatisticsQuery,
  // new
  useGetEmployeesDailyQuery,
  useMarkEmployeesBulkMutation,
  useGetEmployeeAttendanceRangeQuery,
  useGetStudentsDailyQuery,
  useMarkStudentsBulkMutation,
  useGetAcademicYearsQuery,
  useGetClassesQuery,
  useGetSectionsQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useCreateSectionMutation,
  useDeleteSectionMutation,
} = attendanceApi;
