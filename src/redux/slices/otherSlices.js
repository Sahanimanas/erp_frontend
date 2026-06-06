/**
 * studentsSlice.js — Student list + pagination + filter state
 */
import { createSlice } from "@reduxjs/toolkit";

const studentsSlice = createSlice({
  name: "students",
  initialState: {
    list:       [],
    total:      0,
    page:       1,
    pageSize:   25,
    filters:    { search: "", classId: "", sectionId: "", feeStatus: "" },
    loading:    false,
    error:      null,
    selected:   null,   // currently viewed student
  },
  reducers: {
    setStudents(state, { payload }) {
      state.list  = payload.data;
      state.total = payload.total;
    },
    setStudentFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload };
      state.page    = 1;
    },
    setStudentPage(state, { payload }) {
      state.page = payload;
    },
    setSelectedStudent(state, { payload }) {
      state.selected = payload;
    },
    setStudentsLoading(state, { payload }) {
      state.loading = payload;
    },
  },
});

export const {
  setStudents, setStudentFilters, setStudentPage,
  setSelectedStudent, setStudentsLoading,
} = studentsSlice.actions;

export const selectStudents = (state) => state.students;
export default studentsSlice.reducer;


/**
 * attendanceSlice.js
 */
import { createSlice as cs2 } from "@reduxjs/toolkit";

const attendanceSlice = cs2({
  name: "attendance",
  initialState: {
    daily:   [],
    monthly: [],
    date:    new Date().toISOString().slice(0, 10),
    loading: false,
  },
  reducers: {
    setDailyAttendance(state, { payload }) { state.daily = payload; },
    setMonthlyAttendance(state, { payload }) { state.monthly = payload; },
    setAttendanceDate(state, { payload }) { state.date = payload; },
    setAttendanceLoading(state, { payload }) { state.loading = payload; },
  },
});

export const {
  setDailyAttendance, setMonthlyAttendance,
  setAttendanceDate, setAttendanceLoading,
} = attendanceSlice.actions;

export const selectAttendance = (state) => state.attendance;
export const attendanceReducer = attendanceSlice.reducer;


/**
 * feesSlice.js
 */
import { createSlice as cs3 } from "@reduxjs/toolkit";

const feesSlice = cs3({
  name: "fees",
  initialState: {
    list:    [],
    pending: [],
    summary: { collected: 0, pending: 0, total: 0 },
    loading: false,
  },
  reducers: {
    setFeesList(state, { payload }) { state.list = payload; },
    setPendingFees(state, { payload }) { state.pending = payload; },
    setFeesSummary(state, { payload }) { state.summary = payload; },
    setFeesLoading(state, { payload }) { state.loading = payload; },
  },
});

export const { setFeesList, setPendingFees, setFeesSummary, setFeesLoading } = feesSlice.actions;
export const selectFees = (state) => state.fees;
export const feesReducer = feesSlice.reducer;


/**
 * examsSlice.js
 */
import { createSlice as cs4 } from "@reduxjs/toolkit";

const examsSlice = cs4({
  name: "exams",
  initialState: {
    list:    [],
    results: [],
    loading: false,
  },
  reducers: {
    setExams(state, { payload }) { state.list = payload; },
    setExamResults(state, { payload }) { state.results = payload; },
    setExamsLoading(state, { payload }) { state.loading = payload; },
  },
});

export const { setExams, setExamResults, setExamsLoading } = examsSlice.actions;
export const selectExams = (state) => state.exams;
export const examsReducer = examsSlice.reducer;


/**
 * notificationsSlice.js
 */
import { createSlice as cs5 } from "@reduxjs/toolkit";

const notificationsSlice = cs5({
  name: "notifications",
  initialState: {
    items: [],
    unreadCount: 0,
  },
  reducers: {
    setNotifications(state, { payload }) {
      state.items = payload;
      state.unreadCount = payload.filter((n) => !n.read).length;
    },
    markAllRead(state) {
      state.items = state.items.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    markRead(state, { payload: id }) {
      const n = state.items.find((x) => x.id === id);
      if (n) {
        n.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    addNotification(state, { payload }) {
      state.items.unshift(payload);
      if (!payload.read) state.unreadCount += 1;
    },
  },
});

export const { setNotifications, markAllRead, markRead, addNotification } = notificationsSlice.actions;
export const selectNotifications = (state) => state.notifications;
export const notificationsReducer = notificationsSlice.reducer;
