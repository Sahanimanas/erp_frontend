/**
 * resultMgmtApi.js — Result Management. Backend: /api/v1/result-management
 *
 * Exam subject results read/write the SHARED StudentMark table used by Exam
 * Management, so entering marks here updates exam results everywhere. The
 * "Results" tag is invalidated on every save so grids re-sync.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const resultMgmtApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getExamResult: build.query({
      query: (params) => ({ url: "/result-management/exam-result", params }),
      transformResponse: unwrap,
      providesTags: ["Results"],
    }),
    saveExamResult: build.mutation({
      query: (body) => ({ url: "/result-management/exam-result", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Results", "ReportCards"],
    }),

    getAllExamResult: build.query({
      query: (params) => ({ url: "/result-management/all-exam-result", params }),
      transformResponse: unwrap,
      providesTags: ["Results"],
    }),
    saveAllExamResult: build.mutation({
      query: (body) => ({ url: "/result-management/all-exam-result", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Results", "ReportCards"],
    }),

    getNonSubjectResult: build.query({
      query: (params) => ({ url: "/result-management/nonsubject-result", params }),
      transformResponse: unwrap,
      providesTags: ["Results"],
    }),
    saveNonSubjectResult: build.mutation({
      query: (body) => ({ url: "/result-management/nonsubject-result", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Results", "ReportCards"],
    }),

    getRemarks: build.query({
      query: (params) => ({ url: "/result-management/remarks", params }),
      transformResponse: unwrap,
      providesTags: ["ReportCards"],
    }),
    saveRemarks: build.mutation({
      query: (body) => ({ url: "/result-management/remarks", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["ReportCards"],
    }),

    getExamPublishStatus: build.query({
      query: (params) => ({ url: "/result-management/publish-exam", params }),
      transformResponse: unwrap,
      providesTags: ["Results"],
    }),
    publishExamResult: build.mutation({
      query: (body) => ({ url: "/result-management/publish-exam", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Results"],
    }),

    generateReportCards: build.mutation({
      query: (body) => ({ url: "/result-management/report-cards/generate", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["ReportCards"],
    }),
    listReportCards: build.query({
      query: (params) => ({ url: "/result-management/report-cards", params }),
      transformResponse: unwrap,
      providesTags: ["ReportCards"],
    }),
    publishReportCards: build.mutation({
      query: (body) => ({ url: "/result-management/report-cards/publish", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["ReportCards"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExamResultQuery,
  useSaveExamResultMutation,
  useGetAllExamResultQuery,
  useSaveAllExamResultMutation,
  useGetNonSubjectResultQuery,
  useSaveNonSubjectResultMutation,
  useGetRemarksQuery,
  useSaveRemarksMutation,
  useGetExamPublishStatusQuery,
  usePublishExamResultMutation,
  useGenerateReportCardsMutation,
  useListReportCardsQuery,
  usePublishReportCardsMutation,
} = resultMgmtApi;
