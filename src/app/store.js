/**
 * store.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Redux Toolkit store.
 *
 * Slices registered:
 *   auth        – JWT token, user object, role
 *   ui          – sidebar collapsed, dark mode, active section
 *   students    – student list + pagination + filters
 *   attendance  – daily attendance records
 *   fees        – fee collection + pending
 *   exams       – exam list + results
 *   notifications – bell icon list
 */
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

// ── Slices ─────────────────────────────────────────────────────────────────
import authReducer         from "../redux/slices/authSlice";
import uiReducer           from "../redux/slices/uiSlice";
import studentsReducer     from "../redux/slices/studentsSlice";
import attendanceReducer   from "../redux/slices/attendanceSlice";
import feesReducer         from "../redux/slices/feesSlice";
import examsReducer        from "../redux/slices/examsSlice";
import notificationsReducer from "../redux/slices/notificationsSlice";

// ── RTK Query API services ─────────────────────────────────────────────────
import { baseApi } from "../redux/api/baseApi";

export const store = configureStore({
  reducer: {
    auth:          authReducer,
    ui:            uiReducer,
    students:      studentsReducer,
    attendance:    attendanceReducer,
    fees:          feesReducer,
    exams:         examsReducer,
    notifications: notificationsReducer,

    // RTK Query auto-generated reducer
    [baseApi.reducerPath]: baseApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),

  devTools: import.meta.env.DEV,
});

// Enable refetchOnFocus / refetchOnReconnect for RTK Query
setupListeners(store.dispatch);

/** @type {typeof store.getState} */
export const RootState = undefined;

/** @type {typeof store.dispatch} */
export const AppDispatch = undefined;
