/**
 * admissionApi.js — Admission enquiry funnel (enquiry → registered → admitted)
 * Backend: /api/v1/admission/enquiries
 */
import { baseApi } from "./baseApi";

const unwrapList = (res) => ({ rows: res?.data ?? [], pagination: res?.pagination ?? null });
const unwrap = (res) => res?.data ?? res;

export const admissionApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEnquiries: build.query({
      query: (params = {}) => ({ url: "/admission/enquiries", params }),
      transformResponse: unwrapList,
      providesTags: ["Admission"],
    }),
    getEnquiryStats: build.query({
      query: () => "/admission/enquiries/stats",
      transformResponse: unwrap,
      providesTags: ["AdmissionStats"],
    }),
    createEnquiry: build.mutation({
      query: (body) => ({ url: "/admission/enquiries", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Admission", "AdmissionStats"],
    }),
    updateEnquiry: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admission/enquiries/${id}`, method: "PATCH", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Admission", "AdmissionStats"],
    }),
    deleteEnquiry: build.mutation({
      query: (id) => ({ url: `/admission/enquiries/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admission", "AdmissionStats"],
    }),
    // Convert an enquiry into a real Student (admission → student bridge).
    admitEnquiry: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admission/enquiries/${id}/admit`, method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Admission", "AdmissionStats", { type: "Students", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetEnquiriesQuery,
  useGetEnquiryStatsQuery,
  useCreateEnquiryMutation,
  useUpdateEnquiryMutation,
  useDeleteEnquiryMutation,
  useAdmitEnquiryMutation,
} = admissionApi;
