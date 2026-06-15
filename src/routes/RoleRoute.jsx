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
import { selectAuth, selectUserPermissions } from "../redux/slices/authSlice";
import { canAccessSection } from "./routeConfig";

export default function RoleRoute({ allowedRoles = [], sectionKey, children }) {
  const { user } = useSelector(selectAuth);
  const permissions = useSelector(selectUserPermissions);

  // Role check (empty allowedRoles = any authenticated user).
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) return <Navigate to="/403" replace />;
  }

  // Designation-privilege check — blocks direct URL access to a section the
  // user's designation doesn't grant (admin roles & unmapped sections pass).
  if (sectionKey && !canAccessSection(sectionKey, permissions, user?.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
