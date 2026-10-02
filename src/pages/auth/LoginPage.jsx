import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import { Eye, EyeOff, Lock, User, ArrowRight } from "lucide-react";
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
        // Trimmed — a stray space pasted along with an emailed credential is a
        // common cause of "invalid credentials". The password is sent verbatim.
        email: form.email.trim(),
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
            schoolWatermark: user.schoolWatermark ?? null,
            schoolUpiQr: user.schoolUpiQr ?? null,
            schoolAddress: user.schoolAddress ?? null,
            schoolPhone: user.schoolPhone ?? null,
            schoolEmail: user.schoolEmail ?? null,
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden bg-[#070b16]">
      {/* ── Backdrop ──────────────────────────────────────────────────────
          Three slowly drifting colour fields over a faint grid. Purely
          decorative and pointer-events-none, so it can never sit between the
          user and the form. It stops moving under prefers-reduced-motion. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="aurora absolute -top-1/4 -left-1/4 w-[70vw] h-[70vw] rounded-full blur-[120px]
                        bg-[radial-gradient(circle,rgba(249,115,22,.34),transparent_62%)]" />
        <div className="aurora-2 absolute -bottom-1/3 -right-1/4 w-[65vw] h-[65vw] rounded-full blur-[120px]
                        bg-[radial-gradient(circle,rgba(244,63,94,.26),transparent_62%)]" />
        <div className="aurora absolute top-1/3 left-1/2 w-[45vw] h-[45vw] rounded-full blur-[130px]
                        bg-[radial-gradient(circle,rgba(56,189,248,.18),transparent_65%)]" />
        <div className="absolute inset-0 opacity-[0.05]"
             style={{
               backgroundImage:
                 "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
               backgroundSize: "56px 56px",
             }} />
      </div>

      {/* ── Welcome text — upper middle, close to the form ───────────────── */}
      <header className="relative z-10 w-full text-center mb-6">
        <p className="text-amber-200/70 text-xs sm:text-sm font-semibold tracking-[0.3em] uppercase">Welcome to</p>
        {/* Show the school's logo in place of its name. Fall back to the name
            (or platform icon) when a school has not uploaded a logo. */}
        {brandLogo ? (
          <img
            src={brandLogo}
            alt={brandName}
            className="mx-auto mt-4 block max-h-24 w-auto rounded-2xl bg-white object-contain p-2 shadow-lg shadow-orange-500/25"
          />
        ) : (
          <h1 className="text-3xl sm:text-5xl font-extrabold mt-2 bg-gradient-to-r from-amber-200 via-orange-300 to-rose-300 bg-clip-text text-transparent">
            {brandName}
          </h1>
        )}
      </header>

      {/* ── Login form — bigger, centered right under the heading ────────── */}
      <main className="relative z-10 w-full flex justify-center">
        <form onSubmit={handle} className="w-full max-w-md rounded-2xl p-8 sm:p-10 space-y-5 border border-[#e8dcc2] bg-gradient-to-br from-[#fffdf6] via-[#fdf6e6] to-[#f7ecd6] shadow-[0_30px_80px_-20px_rgba(0,0,0,.65)]">
          <div className="text-center mb-1">
            <h2 className="text-xl font-bold text-[#2d2418]">Sign in</h2>
            <p className="text-[#8a7b60] text-xs mt-1">Enter your credentials to continue</p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-700 text-xs">{error}</div>}
          <div className="relative"><User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89878]" /><input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full pl-10 pr-4 py-3.5 bg-white/80 border border-[#e3d6ba] rounded-xl text-[#2d2418] text-sm placeholder-[#a89878] focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all" /></div>
          <div className="relative"><Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89878]" /><input type={showPass ? "text" : "password"} placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="w-full pl-10 pr-11 py-3.5 bg-white/80 border border-[#e3d6ba] rounded-xl text-[#2d2418] text-sm placeholder-[#a89878] focus:outline-none focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#a89878] hover:text-[#2d2418]">{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:via-orange-500 hover:to-rose-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/40 hover:shadow-orange-500/60 disabled:opacity-70">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowRight size={16} /><span>Login</span></>}
          </button>
          <p className="text-center text-[11px] text-[#a09070] pt-1">© 2026 {brandName} School Management</p>
        </form>
      </main>
    </div>
  );
}
