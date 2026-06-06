import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({ name:"exams", initialState:{list:[],results:[],loading:false}, reducers:{ setExams(state,{payload}){state.list=payload;}, setExamResults(state,{payload}){state.results=payload;}, setExamsLoading(state,{payload}){state.loading=payload;} } });
export const {setExams,setExamResults,setExamsLoading}=s.actions;
export const selectExams=(state)=>state.exams;
export default s.reducer;
