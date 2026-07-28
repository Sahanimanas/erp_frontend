/**
 * transportApi.js — Transport Management (vehicles, drivers, stoppages, routes,
 * route↔stoppage and student↔route assignment, student transport report).
 * Backend: /api/v1/transport
 *
 * NOTE ON ROUTES: `getTransportRoutes` and Fee Management's `getRoutes` read the
 * SAME TransportRoute rows — this endpoint returns the operational columns
 * (from/to, vehicle, driver, staff) plus the fee, Fee Management returns the
 * fee-shaped view. Both mutations invalidate the shared "TransportRoute" tag so
 * creating a route on either screen refreshes the other.
 */
import { baseApi } from "./baseApi";

const unwrap = (res) => res?.data ?? res;

export const transportApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // ── Vehicles ──────────────────────────────────────────────────────────
    getVehicles: build.query({
      query: () => "/transport/vehicles",
      transformResponse: unwrap,
      providesTags: ["TransportVehicle"],
    }),
    upsertVehicle: build.mutation({
      query: (body) => ({ url: "/transport/vehicles", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["TransportVehicle", "TransportRoute"],
    }),
    deleteVehicle: build.mutation({
      query: (id) => ({ url: `/transport/vehicles/${id}`, method: "DELETE" }),
      invalidatesTags: ["TransportVehicle", "TransportRoute"],
    }),

    // ── Drivers ───────────────────────────────────────────────────────────
    getDrivers: build.query({
      query: () => "/transport/drivers",
      transformResponse: unwrap,
      providesTags: ["TransportDriver"],
    }),
    upsertDriver: build.mutation({
      query: (body) => ({ url: "/transport/drivers", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["TransportDriver", "TransportRoute"],
    }),
    deleteDriver: build.mutation({
      query: (id) => ({ url: `/transport/drivers/${id}`, method: "DELETE" }),
      invalidatesTags: ["TransportDriver", "TransportRoute"],
    }),

    // ── Stoppages ─────────────────────────────────────────────────────────
    getStoppages: build.query({
      query: () => "/transport/stoppages",
      transformResponse: unwrap,
      providesTags: ["TransportStoppage"],
    }),
    upsertStoppage: build.mutation({
      query: (body) => ({ url: "/transport/stoppages", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["TransportStoppage", "RouteStoppage"],
    }),
    deleteStoppage: build.mutation({
      query: (id) => ({ url: `/transport/stoppages/${id}`, method: "DELETE" }),
      invalidatesTags: ["TransportStoppage", "RouteStoppage"],
    }),

    // ── Routes (shared with Fee Management) ───────────────────────────────
    getTransportRoutes: build.query({
      query: () => "/transport/routes",
      transformResponse: unwrap,
      providesTags: ["TransportRoute"],
    }),
    upsertTransportRoute: build.mutation({
      query: (body) => ({ url: "/transport/routes", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["TransportRoute"],
    }),
    deleteTransportRoute: build.mutation({
      query: (id) => ({ url: `/transport/routes/${id}`, method: "DELETE" }),
      invalidatesTags: ["TransportRoute", "RouteStoppage", "StudentRoute"],
    }),

    // ── Stoppages on a route ──────────────────────────────────────────────
    getRouteStoppages: build.query({
      query: (routeId) => ({ url: "/transport/route-stoppages", params: routeId ? { routeId } : {} }),
      transformResponse: unwrap,
      providesTags: ["RouteStoppage"],
    }),
    addRouteStoppage: build.mutation({
      query: (body) => ({ url: "/transport/route-stoppages", method: "POST", body }),
      transformResponse: unwrap,
      invalidatesTags: ["RouteStoppage", "TransportRoute"],
    }),
    deleteRouteStoppage: build.mutation({
      query: (id) => ({ url: `/transport/route-stoppages/${id}`, method: "DELETE" }),
      invalidatesTags: ["RouteStoppage", "TransportRoute"],
    }),

    // ── Students on a route ───────────────────────────────────────────────
    getStudentRoutes: build.query({
      query: (routeId) => ({ url: "/transport/student-routes", params: routeId ? { routeId } : {} }),
      transformResponse: unwrap,
      providesTags: ["StudentRoute"],
    }),
    assignStudentsToRoute: build.mutation({
      query: (body) => ({ url: "/transport/student-routes", method: "POST", body }),
      transformResponse: unwrap,
      // Students' transportRoute/transportAllotted change, which drives the fee
      // ledger — invalidate Students and Ledger so fees reflect it immediately.
      invalidatesTags: ["StudentRoute", "TransportRoute", "Students", "Ledger"],
    }),
    unassignStudentRoute: build.mutation({
      query: (id) => ({ url: `/transport/student-routes/${id}`, method: "DELETE" }),
      invalidatesTags: ["StudentRoute", "TransportRoute", "Students", "Ledger"],
    }),

    // ── Report ────────────────────────────────────────────────────────────
    getStudentTransportReport: build.query({
      query: (params = {}) => ({ url: "/transport/student-report", params }),
      transformResponse: unwrap,
      providesTags: ["StudentRoute"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetVehiclesQuery,
  useUpsertVehicleMutation,
  useDeleteVehicleMutation,
  useGetDriversQuery,
  useUpsertDriverMutation,
  useDeleteDriverMutation,
  useGetStoppagesQuery,
  useUpsertStoppageMutation,
  useDeleteStoppageMutation,
  useGetTransportRoutesQuery,
  useUpsertTransportRouteMutation,
  useDeleteTransportRouteMutation,
  useGetRouteStoppagesQuery,
  useAddRouteStoppageMutation,
  useDeleteRouteStoppageMutation,
  useGetStudentRoutesQuery,
  useAssignStudentsToRouteMutation,
  useUnassignStudentRouteMutation,
  useGetStudentTransportReportQuery,
} = transportApi;
