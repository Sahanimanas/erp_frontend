/**
 * feeMgmtApi.js — Fee Management (class/transport fee types, per-class structure,
 * transport route fee). Backend: /api/v1/fee-management
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const feeMgmtApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFeeTypes: build.query({
      query: (isTransport) => ({ url: "/fee-management/fee-types", params: isTransport === undefined ? {} : { isTransport } }),
      transformResponse: unwrap,
      providesTags: ["FeeType"],
    }),
    createFeeType: build.mutation({
      query: (body) => ({ url: "/fee-management/fee-types", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["FeeType", "FeeStructure"],
    }),
    updateFeeType: build.mutation({
      query: ({ id, ...body }) => ({ url: `/fee-management/fee-types/${id}`, method: "PATCH", body }),
      transformResponse: unwrap,
      invalidatesTags: ["FeeType", "FeeStructure"],
    }),
    deleteFeeType: build.mutation({
      query: (id) => ({ url: `/fee-management/fee-types/${id}`, method: "DELETE" }),
      invalidatesTags: ["FeeType", "FeeStructure"],
    }),

    getClassStructure: build.query({
      query: ({ classId, includeTransport, academicYearId }) => ({ url: "/fee-management/structure", params: { classId, ...(includeTransport ? { includeTransport: true } : {}), ...(academicYearId ? { academicYearId } : {}) } }),
      transformResponse: unwrap,
      providesTags: ["FeeStructure"],
    }),
    saveClassStructure: build.mutation({
      query: (body) => ({ url: "/fee-management/structure", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["FeeStructure"],
    }),

    getRoutes: build.query({
      query: () => "/fee-management/routes",
      transformResponse: unwrap,
      providesTags: ["TransportRoute"],
    }),
    upsertRoute: build.mutation({
      query: (body) => ({ url: "/fee-management/routes", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["TransportRoute"],
    }),

    getIncomeHeads: build.query({
      query: () => "/fee-management/income-heads",
      transformResponse: unwrap,
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFeeTypesQuery,
  useCreateFeeTypeMutation,
  useUpdateFeeTypeMutation,
  useDeleteFeeTypeMutation,
  useGetClassStructureQuery,
  useSaveClassStructureMutation,
  useGetRoutesQuery,
  useUpsertRouteMutation,
  useGetIncomeHeadsQuery,
} = feeMgmtApi;
