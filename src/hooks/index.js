import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { selectAuth, logout } from "../redux/slices/authSlice";

export function useAuth() {
  const dispatch=useDispatch(); const navigate=useNavigate(); const auth=useSelector(selectAuth);
  const signOut=useCallback(()=>{dispatch(logout());navigate("/login");},[dispatch,navigate]);
  const hasRole=useCallback((...roles)=>roles.includes(auth.user?.role),[auth.user?.role]);
  return {user:auth.user,token:auth.token,isAuthenticated:!!auth.token,userRole:auth.user?.role,signOut,hasRole};
}

export function usePageTitle(title) {
  useEffect(()=>{document.title=title?`${title} — EduServe`:"EduServe";return()=>{document.title="EduServe";};},[title]);
}

export function useDebounce(value,delay=400) {
  const [d,setD]=useState(value);
  useEffect(()=>{const id=setTimeout(()=>setD(value),delay);return()=>clearTimeout(id);},[value,delay]);
  return d;
}

export function usePagination(initialPageSize=25) {
  const [page,setPage]=useState(1); const [pageSize,setPageSize]=useState(initialPageSize);
  const resetPage=useCallback(()=>setPage(1),[]);
  return {page,pageSize,setPage,setPageSize,resetPage};
}

export function useClickOutside(ref,callback) {
  useEffect(()=>{const h=e=>{if(ref.current&&!ref.current.contains(e.target))callback();};document.addEventListener("mousedown",h);return()=>document.removeEventListener("mousedown",h);},[ref,callback]);
}

export function useLocalStorage(key,initialValue) {
  const [value,setValue]=useState(()=>{try{const i=localStorage.getItem(key);return i?JSON.parse(i):initialValue;}catch{return initialValue;}});
  const set=useCallback((val)=>{try{const n=val instanceof Function?val(value):val;setValue(n);localStorage.setItem(key,JSON.stringify(n));}catch{}},[key,value]);
  return [value,set];
}
