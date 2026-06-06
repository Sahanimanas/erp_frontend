import { createSlice } from "@reduxjs/toolkit";
const s = createSlice({ name:"notifications", initialState:{items:[],unreadCount:0}, reducers:{ setNotifications(state,{payload}){state.items=payload;state.unreadCount=payload.filter(n=>!n.read).length;}, markAllRead(state){state.items=state.items.map(n=>({...n,read:true}));state.unreadCount=0;}, markRead(state,{payload:id}){const n=state.items.find(x=>x.id===id);if(n){n.read=true;state.unreadCount=Math.max(0,state.unreadCount-1);}}, addNotification(state,{payload}){state.items.unshift(payload);if(!payload.read)state.unreadCount+=1;} } });
export const {setNotifications,markAllRead,markRead,addNotification}=s.actions;
export const selectNotifications=(state)=>state.notifications;
export default s.reducer;
