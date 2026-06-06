// studentsSlice.js
import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({ name:"students", initialState:{ list:[],total:0,page:1,pageSize:25,filters:{search:"",classId:"",sectionId:"",feeStatus:""},loading:false,error:null,selected:null }, reducers:{ setStudents(state,{payload}){state.list=payload.data;state.total=payload.total;}, setStudentFilters(state,{payload}){state.filters={...state.filters,...payload};state.page=1;}, setStudentPage(state,{payload}){state.page=payload;}, setSelectedStudent(state,{payload}){state.selected=payload;}, setStudentsLoading(state,{payload}){state.loading=payload;} } });
export const {setStudents,setStudentFilters,setStudentPage,setSelectedStudent,setStudentsLoading}=s.actions;
export const selectStudents=(state)=>state.students;
export default s.reducer;
