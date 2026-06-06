/**
 * studentsApi.js
 * ─────────────────────────────────────────────────────────────────────────────
 * All student-related REST endpoints.
 *
 * Backend expects:
 *   GET    /students          ?page&pageSize&search&classId&sectionId&feeStatus
 *   GET    /students/:id
 *   POST   /students
 *   PUT    /students/:id
 *   DELETE /students/:id
 *   GET    /students/:id/attendance
 *   POST   /students/bulk-import           (multipart/form-data)
 *   GET    /students/:id/fee-summary
 *   GET    /students/:id/report-card/:examId
 */
import { baseApi } from "../api/baseApi";

export const studentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    getStudents: build.query({
      query: (params = {}) => ({ url: "/students", params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ _id }) => ({ type: "Students", id: _id })), { type: "Students", id: "LIST" }]
          : [{ type: "Students", id: "LIST" }],
    }),

    getStudent: build.query({
      query: (id) => `/students/${id}`,
      providesTags: (_, __, id) => [{ type: "Students", id }],
    }),

    createStudent: build.mutation({
      query: (body) => ({ url: "/students", method: "POST", body }),
      invalidatesTags: [{ type: "Students", id: "LIST" }],
    }),

    updateStudent: build.mutation({
      query: ({ id, ...body }) => ({ url: `/students/${id}`, method: "PUT", body }),
      invalidatesTags: (_, __, { id }) => [{ type: "Students", id }],
    }),

    deleteStudent: build.mutation({
      query: (id) => ({ url: `/students/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Students", id: "LIST" }],
    }),

    getStudentAttendance: build.query({
      query: ({ id, month, year }) => `/students/${id}/attendance?month=${month}&year=${year}`,
      providesTags: (_, __, { id }) => [{ type: "Attendance", id }],
    }),

    getStudentFeeSummary: build.query({
      query: (id) => `/students/${id}/fee-summary`,
      providesTags: (_, __, id) => [{ type: "Fees", id }],
    }),

    uploadStudentPhoto: build.mutation({
      query: ({ id, formData }) => ({
        url: `/students/${id}/photo`,
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: "Students", id }],
    }),

    bulkImportStudents: build.mutation({
      query: (formData) => ({
        url: "/students/bulk-import",
        method: "POST",
        body: formData,
        formData: true,
      }),
      invalidatesTags: [{ type: "Students", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStudentsQuery,
  useGetStudentQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation,
  useGetStudentAttendanceQuery,
  useGetStudentFeeSummaryQuery,
  useUploadStudentPhotoMutation,
  useBulkImportStudentsMutation,
} = studentsApi;
