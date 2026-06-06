/**
 * RoleRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wraps a page component and verifies the logged-in user's role against the
 * `allowedRoles` prop derived from routeConfig.
 *
 * Usage (generated automatically by AppRoutes.jsx):
 *   <RoleRoute allowedRoles={["admin","super-admin"]}>
 *     <SomePage />
 *   </RoleRoute>
 */
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/slices/authSlice";

export default function RoleRoute({ allowedRoles = [], children }) {
  const { user } = useSelector(selectAuth);

  // Empty allowedRoles = accessible by every authenticated user
  if (!allowedRoles || allowedRoles.length === 0) return children;

  // Role check
  if (user && allowedRoles.includes(user.role)) return children;

  // Forbidden → show 403 page (or redirect to dashboard)
  return <Navigate to="/403" replace />;
}
