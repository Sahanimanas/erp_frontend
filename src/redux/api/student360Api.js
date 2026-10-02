/**
 * student360Api.js — the two feeds Student 360 needs that no other api slice
 * already exposes. Everything else the page shows is reused:
 *   identity + parents + documents → studentsApi  (useGetStudentQuery)
 *   search / picker                → studentsApi  (useGetStudentsQuery)
 *   fee ledger + receipts          → paymentsApi  (useGetLedgerQuery,
 *                                                  useGetPaymentHistoryQuery)
 *
 * Both endpoints below are already live in production (the mobile app's
 * Student 360 calls them), so nothing new is required on the backend.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const student360Api = baseApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * Attendance rows for one student, newest first. The backend defaults to
     * 30 per page, which is barely a month — 400 covers a full session in one
     * call so the month grid and the percentage agree with each other.
     */
    getStudent360Attendance: build.query({
      query: ({ studentId, limit = 400 }) => ({
        url: `/attendance/students/${studentId}`,
        params: { limit },
      }),
      transformResponse: unwrap,
      providesTags: (_r, _e, { studentId }) => [{ type: "Attendance", id: studentId }],
    }),

    /** Exam results grouped by exam: [{ exam, subjects: [{ subject, marks }] }]. */
    getStudent360Performance: build.query({
      query: (studentId) => `/exams/students/${studentId}/performance`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "Exams", id }],
    }),

    /**
     * Guardians with their children, for searching a family rather than a child.
     *
     * GET /parents already does the hard part: it returns real Parent records
     * with their linked students AND derives a guardian row for students who
     * have no parent login, merging siblings by the household phone number. So
     * one search by a father's name returns him once with all his children —
     * including the ones whose own record has no father's name typed on it,
     * which a plain /students search would miss.
     *
     * Rows: { id, source: "parent" | "student", relationship, user: { firstName,
     * lastName, phone, email }, students: [{ id, rollNumber, user, section }] }
     */
    getGuardians: build.query({
      query: ({ search, limit = 50 } = {}) => ({
        url: "/parents",
        params: { ...(search ? { search } : {}), limit },
      }),
      transformResponse: unwrap,
      providesTags: [{ type: "Parents", id: "SEARCH" }],
    }),
  }),
});

export const {
  useGetStudent360AttendanceQuery,
  useGetStudent360PerformanceQuery,
  useGetGuardiansQuery,
} = student360Api;
