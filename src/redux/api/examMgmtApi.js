/**
 * examMgmtApi.js — Exam Management (session-based exams, grading scale,
 * per-class schedules, halls, seating, hall tickets, exam attendance).
 * Backend: /api/v1/exams
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const examMgmtApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Exams (session-scoped) ───────────────────────────────────────────
    getExams: build.query({
      query: ({ academicYearId } = {}) => ({
        url: "/exams",
        params: { limit: 100, ...(academicYearId ? { academicYearId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["Exams"],
    }),
    createExam: build.mutation({
      query: (body) => ({ url: "/exams", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Exams"],
    }),
    updateExam: build.mutation({
      query: ({ id, ...body }) => ({ url: `/exams/${id}`, method: "PATCH", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Exams"],
    }),
    deleteExam: build.mutation({
      query: (id) => ({ url: `/exams/${id}`, method: "DELETE" }),
      invalidatesTags: ["Exams"],
    }),
    setExamStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/exams/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: unwrap,
      invalidatesTags: ["Exams"],
    }),

    // ── Grading scale ────────────────────────────────────────────────────
    getGrades: build.query({
      query: () => "/exams/grading",
      transformResponse: unwrap,
      providesTags: ["Grading"],
    }),
    saveGrades: build.mutation({
      query: (items) => ({ url: "/exams/grading", method: "POST", body: { items } }),
      transformResponse: unwrap,
      invalidatesTags: ["Grading"],
    }),
    deleteGrade: build.mutation({
      query: (id) => ({ url: `/exams/grading/${id}`, method: "DELETE" }),
      invalidatesTags: ["Grading"],
    }),

    // ── Schedule ─────────────────────────────────────────────────────────
    getExamSchedule: build.query({
      query: ({ examId, classId }) => ({
        url: `/exams/${examId}/schedule`,
        params: classId ? { classId } : {},
      }),
      transformResponse: unwrap,
      providesTags: ["ExamSchedule"],
    }),
    saveExamSchedule: build.mutation({
      query: ({ examId, classId, items }) => ({
        url: `/exams/${examId}/schedule`, method: "POST", body: { classId, items },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["ExamSchedule", "Exams"],
    }),
    deleteScheduleItem: build.mutation({
      query: (id) => ({ url: `/exams/schedule/${id}`, method: "DELETE" }),
      invalidatesTags: ["ExamSchedule", "Exams"],
    }),

    // ── Halls ────────────────────────────────────────────────────────────
    getHalls: build.query({
      query: () => "/exams/halls",
      transformResponse: unwrap,
      providesTags: ["ExamHall"],
    }),
    upsertHall: build.mutation({
      query: (body) => ({ url: "/exams/halls", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["ExamHall"],
    }),
    deleteHall: build.mutation({
      query: (id) => ({ url: `/exams/halls/${id}`, method: "DELETE" }),
      invalidatesTags: ["ExamHall", "ExamSeat"],
    }),

    // ── Seating / hall plan / hall tickets ───────────────────────────────
    generateSeating: build.mutation({
      query: ({ examId, classIds, hallIds }) => ({
        url: `/exams/${examId}/seating/generate`, method: "POST", body: { classIds, hallIds },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["ExamSeat", "ExamHall"],
    }),
    getSeating: build.query({
      query: ({ examId, hallId, classId }) => ({
        url: `/exams/${examId}/seating`,
        params: { ...(hallId ? { hallId } : {}), ...(classId ? { classId } : {}) },
      }),
      transformResponse: unwrap,
      providesTags: ["ExamSeat"],
    }),
    getHallPlan: build.query({
      query: (examId) => `/exams/${examId}/hall-plan`,
      transformResponse: unwrap,
      providesTags: ["ExamSeat", "ExamHall"],
    }),
    getHallTickets: build.query({
      query: ({ examId, classId }) => ({ url: `/exams/${examId}/hall-tickets`, params: { classId } }),
      transformResponse: unwrap,
      providesTags: ["ExamSeat", "ExamSchedule"],
    }),

    // ── Exam attendance ──────────────────────────────────────────────────
    getExamAttendance: build.query({
      query: (scheduleId) => `/exams/schedule/${scheduleId}/attendance`,
      transformResponse: unwrap,
      providesTags: ["ExamAttendance"],
    }),
    saveExamAttendance: build.mutation({
      query: ({ scheduleId, records }) => ({
        url: `/exams/schedule/${scheduleId}/attendance`, method: "POST", body: { records },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["ExamAttendance"],
    }),

    // ── Class subjects (for building a schedule) ─────────────────────────
    getClassSubjects: build.query({
      query: (classId) => `/academic/classes/${classId}/subjects`,
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
    getAllSubjects: build.query({
      query: () => ({ url: "/academic/subjects", params: { limit: 200 } }),
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useUpdateExamMutation,
  useDeleteExamMutation,
  useSetExamStatusMutation,
  useGetGradesQuery,
  useSaveGradesMutation,
  useDeleteGradeMutation,
  useGetExamScheduleQuery,
  useSaveExamScheduleMutation,
  useDeleteScheduleItemMutation,
  useGetHallsQuery,
  useUpsertHallMutation,
  useDeleteHallMutation,
  useGenerateSeatingMutation,
  useGetSeatingQuery,
  useGetHallPlanQuery,
  useGetHallTicketsQuery,
  useGetExamAttendanceQuery,
  useSaveExamAttendanceMutation,
  useGetClassSubjectsQuery,
  useGetAllSubjectsQuery,
} = examMgmtApi;
