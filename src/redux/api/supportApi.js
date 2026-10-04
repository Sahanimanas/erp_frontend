/**
 * supportApi.js — school ⇄ vendor support threads. Backend: /api/v1/support
 *
 * Scoping is server-side: a school always gets back only its own threads
 * however these are called, so the same hooks serve both the school screen and
 * the vendor's screen.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const supportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTickets: build.query({
      query: (params = {}) => ({ url: "/support/tickets", params }),
      transformResponse: unwrap,
      providesTags: [{ type: "Communication", id: "TICKETS" }],
    }),

    getTicket: build.query({
      query: (id) => `/support/tickets/${id}`,
      transformResponse: unwrap,
      providesTags: (_r, _e, id) => [{ type: "Communication", id }],
    }),

    createTicket: build.mutation({
      query: (body) => ({ url: "/support/tickets", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: [{ type: "Communication", id: "TICKETS" }],
    }),

    replyTicket: build.mutation({
      query: ({ id, body }) => ({ url: `/support/tickets/${id}/replies`, method: "POST", body: { body } }),
      transformResponse: unwrap,
      // The thread AND the list both move: a reply changes the thread's status
      // and its position in the list, so both must refetch.
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Communication", id },
        { type: "Communication", id: "TICKETS" },
      ],
    }),

    /** Super admin only. */
    setTicketStatus: build.mutation({
      query: ({ id, status }) => ({ url: `/support/tickets/${id}/status`, method: "PATCH", body: { status } }),
      transformResponse: unwrap,
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Communication", id },
        { type: "Communication", id: "TICKETS" },
      ],
    }),

    /** Super admin only — the header counters. */
    getSupportStats: build.query({
      query: () => "/support/stats",
      transformResponse: unwrap,
      providesTags: [{ type: "Communication", id: "TICKETS" }],
    }),
  }),
});

export const {
  useGetTicketsQuery,
  useGetTicketQuery,
  useCreateTicketMutation,
  useReplyTicketMutation,
  useSetTicketStatusMutation,
  useGetSupportStatsQuery,
} = supportApi;
