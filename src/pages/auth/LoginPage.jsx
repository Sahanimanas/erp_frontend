import { useState, useEffect } from "react";
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
  const [brand,setBrand]=useState(null); // { name, logo } resolved from the domain
  const dispatch=useDispatch(); const navigate=useNavigate();

  // Resolve the school for this domain/subdomain so the login page shows that
  // school's name + logo. Falls back to the platform brand on localhost / apex.
  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/public/school", { params: { host: window.location.hostname } });
        if (res.data?.success && res.data.data) setBrand(res.data.data);
      } catch { /* keep platform default */ }
    })();
  }, []);

  const brandName = brand?.name || "GlobalSchoolMitra";
  const brandLogo = brand?.logo || null;

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
            schoolName: user.schoolName ?? null,
            schoolLogo: user.schoolLogo ?? null,
            // Designation module privileges — gate sidebar/pages. Admin roles
            // bypass this filter (see Sidebar); null means "not restricted".
            permissions: user.permissions ?? null,
            avatar: null
          }
        }));
        // Super Admins land in the platform control plane; everyone else in the
        // school dashboard.
        navigate(user.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard");
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 bg-gradient-to-br from-[#0b1020] via-[#111827] to-[#1a1030] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 -left-24 w-96 h-96 rounded-full bg-pink-600/10 blur-3xl" />

      {/* ── Welcome text — upper middle, close to the form ───────────────── */}
      <header className="relative z-10 w-full text-center mb-6">
        {brandLogo ? (
          <img src={brandLogo} alt={brandName} className="inline-block w-16 h-16 rounded-2xl object-cover bg-white shadow-lg shadow-indigo-500/20 mb-4" />
        ) : (
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 mb-4">
            <GraduationCap size={30} className="text-white" />
          </div>
        )}
        <p className="text-indigo-300/80 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase">Welcome to</p>
        <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 bg-gradient-to-r from-indigo-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">
          {brandName}
        </h1>
        <p className="text-slate-400 text-sm mt-3 max-w-md mx-auto">
          Complete School Management System for modern institutions
        </p>
      </header>

      {/* ── Login form — bigger, centered right under the heading ────────── */}
      <main className="relative z-10 w-full flex justify-center">
        <form onSubmit={handle} className="w-full max-w-md bg-[#111827]/80 backdrop-blur-xl border border-slate-800/60 rounded-2xl shadow-2xl p-8 sm:p-10 space-y-5">
          <div className="text-center mb-1">
            <h2 className="text-xl font-bold text-white">Sign in</h2>
            <p className="text-slate-500 text-xs mt-1">Enter your credentials to continue</p>
          </div>
          {error && <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2.5 text-red-400 text-xs">{error}</div>}
          <div className="relative"><User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" /></div>
          <div className="relative"><Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" /><input type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full pl-10 pr-11 py-3.5 bg-slate-800/60 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-70">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={16} /><span>Login</span></>}
          </button>
          <p className="text-center text-[11px] text-slate-600 pt-1">© 2026 {brandName} School Management</p>
        </form>
      </main>
    </div>
  );
}
