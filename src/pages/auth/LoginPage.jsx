import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import { Eye, EyeOff, GraduationCap, Lock, User, ArrowRight } from "lucide-react";
import apiClient from "../../services/axios";

export default function LoginPage() {
  const [form,setForm]=useState({email:"",password:""});
  const [showPass,setShowPass]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const dispatch=useDispatch(); const navigate=useNavigate();

  const handle=async(e)=>{
    e.preventDefault();
    setError("");
    if(!form.email||!form.password){
      setError("Please enter credentials");
      return;
    }
    setLoading(true);
    try {
      // Call backend API
      const response = await apiClient.post("/auth/login", {
        email: form.email,
        password: form.password,
      });

      if(response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        const tokenExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes

        // Save to localStorage (for axios interceptor)
        localStorage.setItem('erp_auth', JSON.stringify({
          token: accessToken,
          refreshToken: refreshToken,
          tokenExpiry: tokenExpiry
        }));

        // Save to Redux (for React components)
        dispatch(loginSuccess({
          token: accessToken,
          refreshToken: refreshToken,
          tokenExpiry: tokenExpiry,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            schoolId: user.schoolId,
            avatar: null
          }
        }));
        navigate("/dashboard");
      } else {
        setError(response.data.error || "Login failed");
      }
    } catch(err) {
      setError(err.response?.data?.error || err.message || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#111827] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50 flex">
        <div className="hidden md:flex flex-col justify-between w-2/5 bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-600 p-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10"/><div className="absolute bottom-20 -left-10 w-32 h-32 rounded-full bg-white/5"/>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8"><div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><GraduationCap size={18} className="text-white"/></div><span className="text-white font-bold text-lg">EduServe</span></div>
            <h1 className="text-3xl font-bold text-white leading-tight mb-2">WELCOME TO</h1>
            <div className="w-12 h-0.5 bg-white/40 mb-4"/>
            <p className="text-white/70 text-sm leading-relaxed">Complete School Management System for modern institutions</p>
          </div>
          <div className="relative z-10"><p className="text-white/60 text-xs mb-3">School ERP · 2026</p></div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-10">
          <div className="w-full max-w-xs">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/30"><GraduationCap size={24} className="text-white"/></div>
              <h2 className="text-xl font-bold text-white">EduServe</h2>
              <p className="text-slate-400 text-xs mt-1">School Management System</p>
            </div>
            <form onSubmit={handle} className="space-y-4">
              {error&&<div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs">{error}</div>}
              <div className="relative"><User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input type="email" placeholder="Email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full pl-9 pr-4 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"/></div>
              <div className="relative"><Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"/><input type={showPass?"text":"password"} placeholder="Password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className="w-full pl-9 pr-10 py-3 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"/><button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPass?<EyeOff size={14}/>:<Eye size={14}/>}</button></div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70">
                {loading?<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<><ArrowRight size={16}/><span>Login</span></>}
              </button>
            </form>
            <div className="mt-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-3 py-2 text-center"><p className="text-xs text-indigo-400">Demo: <span className="font-mono font-bold">admin@school.com</span> / <span className="font-mono font-bold">test123</span></p></div>
            <p className="text-center text-xs text-slate-600 mt-4">© 2026 EduServe School Management</p>
          </div>
        </div>
      </div>
    </div>
  );
}
