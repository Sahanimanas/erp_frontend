/**
 * ProtectedRoute.jsx
 * Guards all dashboard routes.
 *
 * Token PRESENCE is the gate — not access-token freshness. A short-lived access
 * token (15 min) that has expired is NOT treated as logged-out here, because a
 * long-lived refresh token exists and the axios interceptor transparently
 * refreshes on the first 401. If that refresh fails, the interceptor clears
 * storage and hard-redirects to /login. Redirecting on access-token expiry here
 * caused an infinite /login ↔ /dashboard loop with AuthLayout (which redirects
 * logged-in users away from /login).
 */
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/slices/authSlice";

export default function ProtectedRoute({ children }) {
  const { token } = useSelector(selectAuth);
  const location = useLocation();

  // No token at all → login (preserve intended destination for post-login redirect)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
