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

    // ── Subjects ─────────────────────────────────────────────────────────
    getSubjects: build.query({
      query: () => ({ url: "/academic/subjects", params: { limit: 200 } }),
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
    createSubject: build.mutation({
      query: (body) => ({ url: "/academic/subjects", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Academic"],
    }),
    updateSubject: build.mutation({
      query: ({ id, ...body }) => ({ url: `/academic/subjects/${id}`, method: "PUT", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Academic"],
    }),
    deleteSubject: build.mutation({
      query: (id) => ({ url: `/academic/subjects/${id}`, method: "DELETE" }),
      invalidatesTags: ["Academic"],
    }),

    // ── Class ↔ subject mapping ──────────────────────────────────────────
    getClassSubjectMap: build.query({
      query: (classId) => `/academic/classes/${classId}/subjects`,
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
    assignSubject: build.mutation({
      query: ({ classId, subjectId, teacherId }) => ({
        url: `/academic/classes/${classId}/subjects/assign`, method: "POST", body: { classId, subjectId, ...(teacherId ? { teacherId } : {}) },
      }),
      transformResponse: unwrap,
      invalidatesTags: ["Academic"],
    }),
    unassignSubject: build.mutation({
      query: ({ classId, subjectId }) => ({ url: `/academic/classes/${classId}/subjects/${subjectId}`, method: "DELETE" }),
      invalidatesTags: ["Academic"],
    }),

    // ── Periods + section timetable ──────────────────────────────────────
    getPeriods: build.query({
      query: () => "/academic/periods",
      transformResponse: unwrap,
      providesTags: ["Periods"],
    }),
    upsertPeriod: build.mutation({
      query: (body) => ({ url: "/academic/periods", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Periods", "Timetable"],
    }),
    deletePeriod: build.mutation({
      query: (id) => ({ url: `/academic/periods/${id}`, method: "DELETE" }),
      invalidatesTags: ["Periods", "Timetable"],
    }),
    getSectionTimetable: build.query({
      query: (sectionId) => `/academic/sections/${sectionId}/timetable`,
      transformResponse: unwrap,
      providesTags: ["Timetable"],
    }),
    saveSectionTimetable: build.mutation({
      query: ({ sectionId, slots }) => ({ url: `/academic/sections/${sectionId}/timetable`, method: "POST", body: { slots } }),
      transformResponse: unwrap,
      invalidatesTags: ["Timetable"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
  useGetSubjectsQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,
  useGetClassSubjectMapQuery,
  useAssignSubjectMutation,
  useUnassignSubjectMutation,
  useGetPeriodsQuery,
  useUpsertPeriodMutation,
  useDeletePeriodMutation,
  useGetSectionTimetableQuery,
  useSaveSectionTimetableMutation,
} = academicApi;
