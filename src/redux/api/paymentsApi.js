/**
 * paymentsApi.js — Payments module. Backend: /api/v1/payments
 * Ledger (expected/paid/due from class fee structure), collect, history,
 * bulk discount/extra, late-fee rules, per-student export.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const paymentsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getLedger: build.query({
      query: (studentId) => `/payments/students/${studentId}/ledger`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "Ledger", id }],
    }),
    getPaymentHistory: build.query({
      query: (studentId) => `/payments/students/${studentId}/history`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "PaymentHistory", id }],
    }),
    getInstallments: build.query({
      query: (studentId) => `/payments/students/${studentId}/installments`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "Installments", id }],
    }),
    collectPayment: build.mutation({
      query: (body) => ({ url: "/payments/collect", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { studentId }) => [
        { type: "Ledger", id: studentId }, { type: "PaymentHistory", id: studentId }, { type: "Installments", id: studentId },
      ],
    }),
    adjustInstallment: build.mutation({
      query: ({ studentId, ...body }) => ({ url: `/payments/students/${studentId}/adjust`, method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { studentId }) => [{ type: "Ledger", id: studentId }, { type: "Installments", id: studentId }],
    }),
    deleteInstallmentPayment: build.mutation({
      query: ({ studentId, ...body }) => ({ url: `/payments/students/${studentId}/delete-installment`, method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { studentId }) => [
        { type: "Ledger", id: studentId }, { type: "Installments", id: studentId }, { type: "PaymentHistory", id: studentId },
      ],
    }),
    revertReceipt: build.mutation({
      query: ({ receiptNo }) => ({ url: `/payments/receipts/${receiptNo}/revert`, method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { studentId }) => [
        { type: "Ledger", id: studentId }, { type: "Installments", id: studentId }, { type: "PaymentHistory", id: studentId },
      ],
    }),
    exportClassFees: build.query({
      query: (classId) => ({ url: "/payments/export", params: { classId } }),
      transformResponse: unwrap,
    }),
    getFeeDetails: build.query({
      query: (classId) => ({ url: "/payments/fee-details", params: { classId } }),
      transformResponse: unwrap,
    }),
    getMonthlyDues: build.query({
      query: ({ classId, month }) => ({ url: "/payments/monthly-dues", params: { classId, ...(month ? { month } : {}) } }),
      transformResponse: unwrap,
    }),
    bulkDiscount: build.mutation({
      query: (body) => ({ url: "/payments/bulk-discount", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Ledger"],
    }),
    bulkExtra: build.mutation({
      query: (body) => ({ url: "/payments/bulk-extra", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["Ledger"],
    }),
    getLateFeeRules: build.query({
      query: () => "/payments/late-fee-rules",
      transformResponse: unwrap,
      providesTags: ["LateFeeRule"],
    }),
    createLateFeeRule: build.mutation({
      query: (body) => ({ url: "/payments/late-fee-rules", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["LateFeeRule"],
    }),
    updateLateFeeRule: build.mutation({
      query: ({ id, ...body }) => ({ url: `/payments/late-fee-rules/${id}`, method: "PATCH", body }),
      transformResponse: unwrap,
      invalidatesTags: ["LateFeeRule"],
    }),
    deleteLateFeeRule: build.mutation({
      query: (id) => ({ url: `/payments/late-fee-rules/${id}`, method: "DELETE" }),
      invalidatesTags: ["LateFeeRule"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLedgerQuery,
  useGetPaymentHistoryQuery,
  useGetInstallmentsQuery,
  useCollectPaymentMutation,
  useAdjustInstallmentMutation,
  useDeleteInstallmentPaymentMutation,
  useRevertReceiptMutation,
  useLazyExportClassFeesQuery,
  useGetFeeDetailsQuery,
  useLazyGetMonthlyDuesQuery,
  useBulkDiscountMutation,
  useBulkExtraMutation,
  useGetLateFeeRulesQuery,
  useCreateLateFeeRuleMutation,
  useUpdateLateFeeRuleMutation,
  useDeleteLateFeeRuleMutation,
} = paymentsApi;
