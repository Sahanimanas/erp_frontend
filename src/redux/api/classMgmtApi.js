/**
 * classMgmtApi.js — Class Management module. Backend: /api/v1/class-management
 *
 * Sessions / Classes / Subjects write to the SAME core tables (AcademicYear,
 * Class, Section, Subject) that Settings → Classes & Sections and every
 * class/section dropdown use. So these queries share the "Academic"/"Sessions"
 * cache tags: create a class here and the Settings page + all dropdowns refresh,
 * and vice-versa — one merged dataset.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const classMgmtApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Sessions (AcademicYear) ─────────────────────────────────────────────
    cmGetSessions: build.query({
      query: () => "/class-management/sessions",
      transformResponse: unwrap,
      providesTags: ["Sessions"],
    }),
    cmSaveSession: build.mutation({
      query: (body) => ({ url: "/class-management/sessions", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Sessions"],
    }),
    cmSetActiveSession: build.mutation({
      query: (id) => ({ url: `/class-management/sessions/${id}/active`, method: "PATCH" }),
      invalidatesTags: ["Sessions"],
    }),
    cmDeleteSession: build.mutation({
      query: (id) => ({ url: `/class-management/sessions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Sessions"],
    }),

    // ── Classes ─────────────────────────────────────────────────────────────
    cmGetClasses: build.query({
      query: (academicYearId) => ({ url: "/class-management/classes", params: academicYearId ? { academicYearId } : {} }),
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
    cmSaveClass: build.mutation({
      query: (body) => ({ url: "/class-management/classes", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Academic"],
    }),
    cmDeleteClass: build.mutation({
      query: (id) => ({ url: `/class-management/classes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Academic"],
    }),

    // ── Class details (per year) ────────────────────────────────────────────
    cmGetClassDetails: build.query({
      query: (classId) => ({ url: "/class-management/class-details", params: { classId } }),
      transformResponse: unwrap,
      providesTags: ["ClassDetails"],
    }),
    cmSaveClassDetails: build.mutation({
      query: (body) => ({ url: "/class-management/class-details", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["ClassDetails"],
    }),

    // ── Subjects (per class) ────────────────────────────────────────────────
    cmGetSubjects: build.query({
      query: (classId) => ({ url: "/class-management/subjects", params: { classId } }),
      transformResponse: unwrap,
      providesTags: ["Academic"],
    }),
    cmSaveSubject: build.mutation({
      query: (body) => ({ url: "/class-management/subjects", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Academic"],
    }),

    // ── Non-subjects ────────────────────────────────────────────────────────
    cmGetNonSubjects: build.query({
      query: (classId) => ({ url: "/class-management/non-subjects", params: classId ? { classId } : {} }),
      transformResponse: unwrap,
      providesTags: ["NonSubjects"],
    }),
    cmSaveNonSubject: build.mutation({
      query: (body) => ({ url: "/class-management/non-subjects", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["NonSubjects"],
    }),

    // ── Syllabus ────────────────────────────────────────────────────────────
    cmGetSyllabusList: build.query({
      query: () => "/class-management/syllabus",
      transformResponse: unwrap,
      providesTags: ["Syllabus"],
    }),
    cmSaveSyllabus: build.mutation({
      query: (body) => ({ url: "/class-management/syllabus", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Syllabus"],
    }),
    cmDeleteSyllabus: build.mutation({
      query: (id) => ({ url: `/class-management/syllabus/${id}`, method: "DELETE" }),
      invalidatesTags: ["Syllabus"],
    }),

    // ── Employee ↔ subject mapping ──────────────────────────────────────────
    cmGetEmployeeMapping: build.query({
      query: ({ employeeId, classId }) => ({ url: "/class-management/employee-mapping", params: { employeeId, classId } }),
      transformResponse: unwrap,
      providesTags: ["EmpSubjectMap"],
    }),
    cmSaveEmployeeMapping: build.mutation({
      query: (body) => ({ url: "/class-management/employee-mapping", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["EmpSubjectMap"],
    }),

    // Departments for the Add Class dropdown (reads the employee module's list).
    cmGetDepartments: build.query({
      query: () => "/employees/departments",
      transformResponse: unwrap,
      providesTags: ["HR"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCmGetSessionsQuery,
  useCmSaveSessionMutation,
  useCmSetActiveSessionMutation,
  useCmDeleteSessionMutation,
  useCmGetClassesQuery,
  useCmSaveClassMutation,
  useCmDeleteClassMutation,
  useCmGetClassDetailsQuery,
  useCmSaveClassDetailsMutation,
  useCmGetSubjectsQuery,
  useCmSaveSubjectMutation,
  useCmGetNonSubjectsQuery,
  useCmSaveNonSubjectMutation,
  useCmGetSyllabusListQuery,
  useCmSaveSyllabusMutation,
  useCmDeleteSyllabusMutation,
  useCmGetEmployeeMappingQuery,
  useCmSaveEmployeeMappingMutation,
  useCmGetDepartmentsQuery,
} = classMgmtApi;
