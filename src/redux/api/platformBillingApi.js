/**
 * platformBillingApi.js — the ERP vendor's own payment QR, and the payments
 * schools report against it. Backend: /api/v1/platform-billing
 *
 * Scoping is done server-side, not here: a school always gets back only its own
 * payments however this is called, so the same `getPlatformPayments` hook is
 * safe to use from both the school screen and the vendor's screen.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const platformBillingApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getCompanyQr: build.query({
      query: () => "/platform-billing/qr",
      transformResponse: unwrap,
      providesTags: [{ type: "Settings", id: "COMPANY_QR" }],
    }),

    /** Super admin only — a school calling this gets a 403. */
    saveCompanyQr: build.mutation({
      query: (body) => ({ url: "/platform-billing/qr", method: "PUT", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Settings", id: "COMPANY_QR" }],
    }),

    getPlatformPayments: build.query({
      query: (params = {}) => ({ url: "/platform-billing/payments", params }),
      transformResponse: unwrap,
      providesTags: [{ type: "Accounting", id: "PLATFORM_PAYMENTS" }],
    }),

    /** The school says it has paid; the row lands as REPORTED. */
    reportPlatformPayment: build.mutation({
      query: (body) => ({ url: "/platform-billing/payments", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Accounting", id: "PLATFORM_PAYMENTS" }],
    }),

    /**
     * School-wise ledger — super admin only. Includes schools with no payments
     * at all, which is the whole point: those are the ones to chase.
     */
    getPlatformSummary: build.query({
      query: () => "/platform-billing/summary",
      transformResponse: unwrap,
      providesTags: [{ type: "Accounting", id: "PLATFORM_PAYMENTS" }],
    }),

    /** Super admin only — confirming a claim out of band. */
    setPlatformPaymentStatus: build.mutation({
      query: ({ id, status }) => ({
        url: `/platform-billing/payments/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Accounting", id: "PLATFORM_PAYMENTS" }],
    }),
  }),
});

export const {
  useGetCompanyQrQuery,
  useSaveCompanyQrMutation,
  useGetPlatformPaymentsQuery,
  useGetPlatformSummaryQuery,
  useReportPlatformPaymentMutation,
  useSetPlatformPaymentStatusMutation,
} = platformBillingApi;
