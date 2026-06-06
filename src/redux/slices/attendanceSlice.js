import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({ name:"attendance", initialState:{daily:[],monthly:[],date:new Date().toISOString().slice(0,10),loading:false}, reducers:{ setDailyAttendance(state,{payload}){state.daily=payload;}, setMonthlyAttendance(state,{payload}){state.monthly=payload;}, setAttendanceDate(state,{payload}){state.date=payload;}, setAttendanceLoading(state,{payload}){state.loading=payload;} } });
export const {setDailyAttendance,setMonthlyAttendance,setAttendanceDate,setAttendanceLoading}=s.actions;
export const selectAttendance=(state)=>state.attendance;
export default s.reducer;
