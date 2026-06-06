/**
 * attendanceApi.js
 */
import { baseApi } from "../api/baseApi";

export const attendanceApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDailyAttendance: build.query({
      query: ({ classId, sectionId, date }) =>
        `/attendance/daily?classId=${classId}&sectionId=${sectionId}&date=${date}`,
      providesTags: ["Attendance"],
    }),
    markAttendance: build.mutation({
      query: (body) => ({ url: "/attendance", method: "POST", body }),
      invalidatesTags: ["Attendance"],
    }),
    getMonthlyReport: build.query({
      query: ({ classId, month, year }) =>
        `/attendance/monthly?classId=${classId}&month=${month}&year=${year}`,
      providesTags: ["Attendance"],
    }),
    getAttendanceSummary: build.query({
      query: (params) => ({ url: "/attendance/summary", params }),
      providesTags: ["Attendance"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDailyAttendanceQuery,
  useMarkAttendanceMutation,
  useGetMonthlyReportQuery,
  useGetAttendanceSummaryQuery,
} = attendanceApi;


/**
 * feesApi.js
 */
export const feesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFees: build.query({
      query: (params) => ({ url: "/fees", params }),
      providesTags: [{ type: "Fees", id: "LIST" }],
    }),
    getFeeStructure: build.query({
      query: () => "/fees/structure",
      providesTags: ["Fees"],
    }),
    collectFee: build.mutation({
      query: (body) => ({ url: "/fees/collect", method: "POST", body }),
      invalidatesTags: ["Fees"],
    }),
    getPendingFees: build.query({
      query: (params) => ({ url: "/fees/pending", params }),
      providesTags: ["Fees"],
    }),
    generateReceipt: build.mutation({
      query: (feeId) => ({ url: `/fees/${feeId}/receipt`, method: "POST" }),
    }),
    getFeeSummary: build.query({
      query: (params) => ({ url: "/fees/summary", params }),
      providesTags: ["Fees"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeesQuery,
  useGetFeeStructureQuery,
  useCollectFeeMutation,
  useGetPendingFeesQuery,
  useGenerateReceiptMutation,
  useGetFeeSummaryQuery,
} = feesApi;


/**
 * examsApi.js
 */
export const examsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExams: build.query({
      query: (params) => ({ url: "/exams", params }),
      providesTags: [{ type: "Exams", id: "LIST" }],
    }),
    createExam: build.mutation({
      query: (body) => ({ url: "/exams", method: "POST", body }),
      invalidatesTags: [{ type: "Exams", id: "LIST" }],
    }),
    updateExam: build.mutation({
      query: ({ id, ...body }) => ({ url: `/exams/${id}`, method: "PUT", body }),
      invalidatesTags: [{ type: "Exams", id: "LIST" }],
    }),
    getExamResults: build.query({
      query: ({ examId, classId }) => `/exams/${examId}/results?classId=${classId}`,
      providesTags: (_, __, { examId }) => [{ type: "Exams", id: examId }],
    }),
    enterMarks: build.mutation({
      query: ({ examId, ...body }) => ({ url: `/exams/${examId}/marks`, method: "POST", body }),
      invalidatesTags: (_, __, { examId }) => [{ type: "Exams", id: examId }],
    }),
    generateReportCard: build.mutation({
      query: ({ studentId, examId }) => ({ url: `/exams/${examId}/report-card/${studentId}`, method: "POST" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useGetExamResultsQuery,
  useEnterMarksMutation,
  useGenerateReportCardMutation,
} = examsApi;
