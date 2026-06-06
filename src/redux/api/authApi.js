/**
 * authApi.js — Authentication endpoints
 */
import { baseApi } from "../api/baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({

    /** POST /auth/login */
    login: build.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    /** POST /auth/logout */
    logoutApi: build.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),

    /** POST /auth/forgot-password */
    forgotPassword: build.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),

    /** POST /auth/reset-password */
    resetPassword: build.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
    }),

    /** POST /auth/refresh */
    refreshToken: build.mutation({
      query: (body) => ({ url: "/auth/refresh", method: "POST", body }),
    }),

    /** GET /auth/me */
    getMe: build.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutApiMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
} = authApi;
