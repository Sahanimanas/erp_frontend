/**
 * superAdminApi.js — Super Admin (platform) endpoints
 * ─────────────────────────────────────────────────────────────────────────────
 * Talks to the backend `admin` module mounted at /api/v1/admin.
 *
 * Backend response envelope is { success, data, pagination? }. List endpoints
 * here transform to { rows, pagination }; item endpoints return `data` directly.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;
const unwrapList = (res) => ({ rows: res?.data ?? [], pagination: res?.pagination ?? null });

export const superAdminApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Analytics ────────────────────────────────────────────────────────
    getAnalytics: build.query({
      query: () => "/admin/analytics",
      transformResponse: unwrap,
      providesTags: ["SaAnalytics"],
    }),

    // ── Schools ──────────────────────────────────────────────────────────
    getSchools: build.query({
      query: (params = {}) => ({ url: "/admin/schools", params }),
      transformResponse: unwrapList,
      providesTags: ["SaSchools"],
    }),
    getSchool: build.query({
      query: (id) => `/admin/schools/${id}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "SaSchool", id }],
    }),
    createSchool: build.mutation({
      query: (body) => ({ url: "/admin/schools", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["SaSchools", "SaAnalytics", "SaDomains", "SaAudit"],
    }),
    updateSchool: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/schools/${id}`, method: "PATCH", body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { id }) => ["SaSchools", { type: "SaSchool", id }, "SaAudit"],
    }),
    deleteSchool: build.mutation({
      query: (id) => ({ url: `/admin/schools/${id}`, method: "DELETE" }),
      invalidatesTags: ["SaSchools", "SaAnalytics", "SaAudit"],
    }),
    activateSchool: build.mutation({
      query: (id) => ({ url: `/admin/schools/${id}/activate`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => ["SaSchools", { type: "SaSchool", id }, "SaAudit"],
    }),
    suspendSchool: build.mutation({
      query: (id) => ({ url: `/admin/schools/${id}/suspend`, method: "PATCH" }),
      invalidatesTags: (_r, _e, id) => ["SaSchools", { type: "SaSchool", id }, "SaAudit"],
    }),
    updateSchoolModules: build.mutation({
      query: ({ id, modules }) => ({ url: `/admin/schools/${id}/modules`, method: "PATCH", body: { modules } }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { id }) => [{ type: "SaSchool", id }, "SaAudit"],
    }),
    getSchoolUsers: build.query({
      query: ({ id, role }) => ({ url: `/admin/schools/${id}/users`, params: role ? { role } : {} }),
      transformResponse: unwrap,
      providesTags: (_r, _e, { id }) => [{ type: "SaUsers", id }],
    }),
    loginAsSchoolAdmin: build.mutation({
      query: (id) => ({ url: `/admin/schools/${id}/login-as`, method: "POST" }),
      transformResponse: unwrap,
      invalidatesTags: ["SaAudit"],
    }),
    resetSchoolAdminPassword: build.mutation({
      // password optional — omit to have the server generate a strong one.
      query: ({ id, password }) => ({
        url: `/admin/schools/${id}/reset-password`,
        method: "POST",
        body: password ? { password } : {},
      }),
      transformResponse: unwrap,
      invalidatesTags: ["SaAudit"],
    }),
    checkSubdomain: build.mutation({
      query: (subdomain) => ({ url: "/admin/schools/check-subdomain", method: "POST", body: { subdomain } }),
      transformResponse: unwrap,
    }),

    // ── Subscription plans ───────────────────────────────────────────────
    getPlans: build.query({
      query: () => "/admin/plans",
      transformResponse: unwrapList,
      providesTags: ["SaPlans"],
    }),
    createPlan: build.mutation({
      query: (body) => ({ url: "/admin/plans", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["SaPlans"],
    }),
    updatePlan: build.mutation({
      query: ({ id, ...body }) => ({ url: `/admin/plans/${id}`, method: "PUT", body }),
      transformResponse: unwrap,
      invalidatesTags: ["SaPlans"],
    }),

    // ── Subscriptions ────────────────────────────────────────────────────
    getSchoolSubscription: build.query({
      query: (schoolId) => `/admin/subscriptions/${schoolId}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "SaSubscription", id }],
    }),
    assignSubscription: build.mutation({
      query: (body) => ({ url: "/admin/subscriptions", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { schoolId }) => [
        { type: "SaSubscription", id: schoolId },
        { type: "SaSchool", id: schoolId },
        "SaSchools",
        "SaAnalytics",
        "SaAudit",
      ],
    }),

    // ── Domains ──────────────────────────────────────────────────────────
    getDomains: build.query({
      query: () => "/admin/domains",
      transformResponse: unwrap,
      providesTags: ["SaDomains"],
    }),
    addDomain: build.mutation({
      query: (body) => ({ url: "/admin/domains", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["SaDomains", "SaAudit"],
    }),
    verifyDomain: build.mutation({
      query: (domainId) => ({ url: `/admin/domains/${domainId}/verify`, method: "POST" }),
      invalidatesTags: ["SaDomains", "SaAudit"],
    }),
    deleteDomain: build.mutation({
      query: (domainId) => ({ url: `/admin/domains/${domainId}`, method: "DELETE" }),
      invalidatesTags: ["SaDomains", "SaAudit"],
    }),

    // ── Metadata + audit ─────────────────────────────────────────────────
    getModules: build.query({
      query: () => "/admin/modules",
      transformResponse: unwrap,
    }),
    getAuditLogs: build.query({
      query: (params = {}) => ({ url: "/admin/audit-logs", params }),
      transformResponse: unwrapList,
      providesTags: ["SaAudit"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAnalyticsQuery,
  useGetSchoolsQuery,
  useGetSchoolQuery,
  useCreateSchoolMutation,
  useUpdateSchoolMutation,
  useDeleteSchoolMutation,
  useActivateSchoolMutation,
  useSuspendSchoolMutation,
  useUpdateSchoolModulesMutation,
  useGetSchoolUsersQuery,
  useLoginAsSchoolAdminMutation,
  useResetSchoolAdminPasswordMutation,
  useCheckSubdomainMutation,
  useGetPlansQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useGetSchoolSubscriptionQuery,
  useAssignSubscriptionMutation,
  useGetDomainsQuery,
  useAddDomainMutation,
  useVerifyDomainMutation,
  useDeleteDomainMutation,
  useGetModulesQuery,
  useGetAuditLogsQuery,
} = superAdminApi;
