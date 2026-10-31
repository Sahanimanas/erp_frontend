/**
 * certificatesApi.js — School Leaving and Bonafide certificates
 * (/certificates/*): the students of a class, the form prefilled from their
 * records, issuing, the issued list, reprint and remove. Scoped to the
 * caller's school on the server.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const certificatesApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCertificateStudents: build.query({
      query: (classId) => ({ url: "/certificates/students", params: { classId } }),
      transformResponse: unwrap,
    }),
    /** School letterhead, student details and suggested form values. */
    getCertificatePrefill: build.query({
      query: ({ type, studentId }) => ({ url: "/certificates/prefill", params: { type, studentId } }),
      transformResponse: unwrap,
      providesTags: ["Certificates"],
    }),
    getCertificates: build.query({
      query: (type) => ({ url: "/certificates", params: { type } }),
      transformResponse: unwrap,
      providesTags: ["Certificates"],
    }),
    issueCertificate: build.mutation({
      query: (body) => ({ url: "/certificates", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Certificates"],
    }),
    deleteCertificate: build.mutation({
      query: (id) => ({ url: `/certificates/${id}`, method: "DELETE" }),
      transformResponse: unwrap,
      invalidatesTags: ["Certificates"],
    }),
  }),
});

export const {
  useGetCertificateStudentsQuery,
  useGetCertificatePrefillQuery,
  useGetCertificatesQuery,
  useIssueCertificateMutation,
  useDeleteCertificateMutation,
} = certificatesApi;
