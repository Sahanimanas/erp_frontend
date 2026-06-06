/**
 * AuthLayout.jsx
 * Wraps public pages (login, forgot password, reset password).
 * If user is already authenticated → redirect to dashboard.
 */
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectToken } from "../redux/slices/authSlice";

export function AuthLayout() {
  const token = useSelector(selectToken);

  // Already logged in → skip auth pages
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0d1220] font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Ambient gradient blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
      </div>
      <Outlet />
    </div>
  );
}

/**
 * EmptyLayout
 * For pages that need zero chrome (print-only, full-screen kiosk, etc.)
 */
export function EmptyLayout() {
  return <Outlet />;
}

export default AuthLayout;
