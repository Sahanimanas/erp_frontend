/**
 * schoolSettingsApi.js — the school's own details and its settings sections.
 * Backend: /api/v1/schools
 *
 * Two stores, on purpose:
 *  - the school's identity (name, phone, city, address…) are real columns, so
 *    they go through PUT /schools;
 *  - everything else the settings screen collects has no column of its own and
 *    is saved per section as JSON via /schools/settings/:section.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const schoolSettingsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMySchool: build.query({
      query: () => "/schools",
      transformResponse: unwrap,
      providesTags: [{ type: "Settings", id: "SCHOOL" }],
    }),
    updateMySchool: build.mutation({
      query: (body) => ({ url: "/schools", method: "PUT", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Settings", id: "SCHOOL" }],
    }),

    getSchoolSettings: build.query({
      query: (section) => `/schools/settings/${section}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, section) => [{ type: "Settings", id: `SEC_${section}` }],
    }),
    saveSchoolSettings: build.mutation({
      query: ({ section, value }) => ({ url: `/schools/settings/${section}`, method: "PUT", body: value }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { section }) => [{ type: "Settings", id: `SEC_${section}` }],
    }),
  }),
});

export const {
  useGetMySchoolQuery,
  useUpdateMySchoolMutation,
  useGetSchoolSettingsQuery,
  useSaveSchoolSettingsMutation,
} = schoolSettingsApi;
