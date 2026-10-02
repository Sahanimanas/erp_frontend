/**
 * platformUsageApi.js — the vendor's cross-tenant usage reports.
 * Backend: /api/v1/platform-usage (SUPER_ADMIN only)
 *
 * Read-only: these endpoints sum counters the WhatsApp module already keeps.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const platformUsageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getWhatsappUsage: build.query({
      query: (params = {}) => ({ url: "/platform-usage/whatsapp", params }),
      transformResponse: unwrap,
      providesTags: [{ type: "Reports", id: "WA_USAGE" }],
    }),
    getWhatsappDaily: build.query({
      query: (params = {}) => ({ url: "/platform-usage/whatsapp/daily", params }),
      transformResponse: unwrap,
      providesTags: [{ type: "Reports", id: "WA_DAILY" }],
    }),
  }),
});

export const { useGetWhatsappUsageQuery, useGetWhatsappDailyQuery } = platformUsageApi;
