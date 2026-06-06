import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({ name:"fees", initialState:{list:[],pending:[],summary:{collected:0,pending:0,total:0},loading:false}, reducers:{ setFeesList(state,{payload}){state.list=payload;}, setPendingFees(state,{payload}){state.pending=payload;}, setFeesSummary(state,{payload}){state.summary=payload;}, setFeesLoading(state,{payload}){state.loading=payload;} } });
export const {setFeesList,setPendingFees,setFeesSummary,setFeesLoading}=s.actions;
export const selectFees=(state)=>state.fees;
export default s.reducer;
