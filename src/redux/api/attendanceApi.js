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
} = attendanceApi;
