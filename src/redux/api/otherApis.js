/**
 * teachersApi.js
 */
import { baseApi } from "../api/baseApi";

export const teachersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getTeachers:    build.query({ query: (p) => ({ url: "/teachers", params: p }), providesTags: [{ type:"Teachers", id:"LIST" }] }),
    getTeacher:     build.query({ query: (id) => `/teachers/${id}`, providesTags: (_,__,id) => [{ type:"Teachers", id }] }),
    createTeacher:  build.mutation({ query: (b) => ({ url:"/teachers", method:"POST", body:b }), invalidatesTags: [{ type:"Teachers", id:"LIST" }] }),
    updateTeacher:  build.mutation({ query: ({id,...b}) => ({ url:`/teachers/${id}`, method:"PUT", body:b }), invalidatesTags: (_,__,{id}) => [{type:"Teachers",id}] }),
    deleteTeacher:  build.mutation({ query: (id) => ({ url:`/teachers/${id}`, method:"DELETE" }), invalidatesTags: [{ type:"Teachers", id:"LIST" }] }),
    assignSubjects: build.mutation({ query: ({id,...b}) => ({ url:`/teachers/${id}/subjects`, method:"POST", body:b }), invalidatesTags: (_,__,{id}) => [{type:"Teachers",id}] }),
    getTeacherTimetable: build.query({ query: (id) => `/teachers/${id}/timetable`, providesTags: (_,__,id) => [{type:"Teachers",id}] }),
  }),
  overrideExisting: false,
});

export const { useGetTeachersQuery, useGetTeacherQuery, useCreateTeacherMutation, useUpdateTeacherMutation, useDeleteTeacherMutation, useAssignSubjectsMutation, useGetTeacherTimetableQuery } = teachersApi;


/**
 * libraryApi.js
 */
export const libraryApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getBooks:     build.query({ query: (p) => ({ url:"/library/books", params:p }), providesTags: [{type:"Library",id:"LIST"}] }),
    addBook:      build.mutation({ query: (b) => ({ url:"/library/books", method:"POST", body:b }), invalidatesTags: [{type:"Library",id:"LIST"}] }),
    issueBook:    build.mutation({ query: (b) => ({ url:"/library/issue", method:"POST", body:b }), invalidatesTags: ["Library"] }),
    returnBook:   build.mutation({ query: (b) => ({ url:"/library/return", method:"POST", body:b }), invalidatesTags: ["Library"] }),
    getIssuedBooks: build.query({ query: (p) => ({ url:"/library/issued", params:p }), providesTags: ["Library"] }),
    getOverdueBooks: build.query({ query: () => "/library/overdue", providesTags: ["Library"] }),
  }),
  overrideExisting: false,
});

export const { useGetBooksQuery, useAddBookMutation, useIssueBookMutation, useReturnBookMutation, useGetIssuedBooksQuery, useGetOverdueBooksQuery } = libraryApi;


/**
 * hrApi.js
 */
export const hrApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getEmployees:   build.query({ query: (p) => ({ url:"/hr/employees", params:p }), providesTags: [{type:"HR",id:"LIST"}] }),
    getEmployee:    build.query({ query: (id) => `/hr/employees/${id}`, providesTags: (_,__,id) => [{type:"HR",id}] }),
    createEmployee: build.mutation({ query: (b) => ({ url:"/hr/employees", method:"POST", body:b }), invalidatesTags: [{type:"HR",id:"LIST"}] }),
    updateEmployee: build.mutation({ query: ({id,...b}) => ({ url:`/hr/employees/${id}`, method:"PUT", body:b }), invalidatesTags: (_,__,{id}) => [{type:"HR",id}] }),
    getPayroll:     build.query({ query: (p) => ({ url:"/hr/payroll", params:p }), providesTags: ["HR"] }),
    processPayroll: build.mutation({ query: (b) => ({ url:"/hr/payroll/process", method:"POST", body:b }), invalidatesTags: ["HR"] }),
    getLeaves:      build.query({ query: (p) => ({ url:"/hr/leaves", params:p }), providesTags: ["HR"] }),
    approveLeave:   build.mutation({ query: ({id,...b}) => ({ url:`/hr/leaves/${id}/approve`, method:"PUT", body:b }), invalidatesTags: ["HR"] }),
  }),
  overrideExisting: false,
});

export const { useGetEmployeesQuery, useGetEmployeeQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useGetPayrollQuery, useProcessPayrollMutation, useGetLeavesQuery, useApproveLeavesMutation } = hrApi;


/**
 * dashboardApi.js
 */
export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats:   build.query({ query: () => "/dashboard/stats",    providesTags: ["Students","Teachers","Fees","Attendance"] }),
    getAnnualFeeSummary: build.query({ query: (year) => `/dashboard/fee-summary?year=${year}`, providesTags: ["Fees"] }),
    getAttendanceChart:  build.query({ query: (p) => ({ url:"/dashboard/attendance-chart", params:p }), providesTags: ["Attendance"] }),
    getRecentActivities: build.query({ query: (limit=10) => `/dashboard/activities?limit=${limit}`, providesTags: [] }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardStatsQuery, useGetAnnualFeeSummaryQuery, useGetAttendanceChartQuery, useGetRecentActivitiesQuery } = dashboardApi;


/**
 * communicationApi.js
 */
export const communicationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    sendSMS:    build.mutation({ query: (b) => ({ url:"/communication/sms", method:"POST", body:b }), invalidatesTags: ["Communication"] }),
    sendEmail:  build.mutation({ query: (b) => ({ url:"/communication/email", method:"POST", body:b }), invalidatesTags: ["Communication"] }),
    getTemplates: build.query({ query: () => "/communication/templates", providesTags: ["Communication"] }),
    createTemplate: build.mutation({ query: (b) => ({ url:"/communication/templates", method:"POST", body:b }), invalidatesTags: ["Communication"] }),
  }),
  overrideExisting: false,
});

export const { useSendSMSMutation, useSendEmailMutation, useGetTemplatesQuery, useCreateTemplateMutation } = communicationApi;
