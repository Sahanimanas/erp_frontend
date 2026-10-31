/**
 * reportsApi.js — the Reports module (GET /reports/*). Everything is read-only
 * and scoped to the caller's school on the server.
 *
 * Dates go over the wire as YYYY-MM-DD and mean Indian calendar days; the
 * server does the IST conversion, so the client never builds a Date for them.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;
const range = ({ from, to } = {}) => ({ ...(from ? { from } : {}), ...(to ? { to } : {}) });
/** Optional class filter; omitted means the whole school. */
const cls = ({ classId } = {}) => (classId ? { classId } : {});

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getReportOverview: build.query({
      query: (args) => ({ url: "/reports/overview", params: { ...range(args), ...cls(args) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getIncomeReport: build.query({
      query: (args) => ({ url: "/reports/income", params: { ...range(args), ...cls(args) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getExpenseReport: build.query({
      query: (args) => ({ url: "/reports/expense", params: range(args) }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getFinancialReport: build.query({
      query: (args) => ({ url: "/reports/financial", params: { ...range(args), ...cls(args) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    /** `month` is the fee engine's label, e.g. "Oct-2026"; omitted = this month. */
    getFeesDueReport: build.query({
      query: ({ month, classId } = {}) => ({ url: "/reports/fees-due", params: { ...(month ? { month } : {}), ...cls({ classId }) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getAttendanceReport: build.query({
      query: ({ classId, threshold, ...rest } = {}) => ({
        url: "/reports/attendance",
        params: { ...range(rest), ...(classId ? { classId } : {}), ...(threshold ? { threshold } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getReportExams: build.query({
      query: () => ({ url: "/reports/exams" }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getExamReport: build.query({
      query: ({ examId, classId }) => ({
        url: "/reports/exam",
        params: { examId, ...(classId ? { classId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getStudentStrengthReport: build.query({
      query: (args) => ({ url: "/reports/students", params: { ...range(args), ...cls(args) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    /** Dashboard v2's overview: head-counts and today's / this month's figures. */
    getReportSnapshot: build.query({
      query: (args) => ({ url: "/reports/snapshot", params: cls(args) }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getStaffAttendanceReport: build.query({
      query: (args) => ({ url: "/reports/staff-attendance", params: range(args) }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    /** Birthdays in the next `days` days (today included). */
    getBirthdaysReport: build.query({
      query: ({ days, classId } = {}) => ({ url: "/reports/birthdays", params: { ...(days ? { days } : {}), ...cls({ classId }) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    /** Every exam of a session for one class (or all): `sessionId` "none" = exams with no session. */
    getExamSummary: build.query({
      query: ({ sessionId, classId } = {}) => ({ url: "/reports/exam-summary", params: { ...(sessionId ? { sessionId } : {}), ...cls({ classId }) } }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
    getWhatsappReport: build.query({
      query: (args) => ({ url: "/reports/whatsapp", params: range(args) }),
      transformResponse: unwrap,
      providesTags: ["Reports"],
    }),
  }),
});

export const {
  useGetReportOverviewQuery,
  useGetIncomeReportQuery,
  useGetExpenseReportQuery,
  useGetFinancialReportQuery,
  useGetFeesDueReportQuery,
  useGetAttendanceReportQuery,
  useGetReportExamsQuery,
  useGetExamReportQuery,
  useGetStudentStrengthReportQuery,
  useGetReportSnapshotQuery,
  useGetStaffAttendanceReportQuery,
  useGetBirthdaysReportQuery,
  useGetWhatsappReportQuery,
  useGetExamSummaryQuery,
} = reportsApi;
