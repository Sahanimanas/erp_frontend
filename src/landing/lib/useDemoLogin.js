/**
 * useDemoLogin — one-click sign-in to the seeded demo tenant.
 *
 * Carried over verbatim from the previous LandingPage so the marketing site
 * keeps its most valuable CTA: a visitor lands in the real dashboard with real
 * seeded data, no sign-up form in between. Mirrors LoginPage's success path so
 * demo sessions behave exactly like real ones.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/slices/authSlice";
import apiClient from "../../services/axios";

// Credentials for the public demo tenant (seeded via prisma/seed.ts).
const DEMO = { email: "admin@school.com", password: "test123" };

export function useDemoLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const startDemo = async () => {
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.post("/auth/login", DEMO);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        const tokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        localStorage.setItem(
          "erp_auth",
          JSON.stringify({ token: accessToken, refreshToken, tokenExpiry }),
        );

        dispatch(
          loginSuccess({
            token: accessToken,
            refreshToken,
            tokenExpiry,
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
              permissions: user.permissions ?? null,
              avatar: null,
            },
          }),
        );
        navigate(user.role === "SUPER_ADMIN" ? "/super-admin/dashboard" : "/dashboard");
      } else {
        setError(response.data.error || "Demo is unavailable right now.");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not start the demo. Please try School Login.");
    } finally {
      setLoading(false);
    }
  };

  return { startDemo, loading, error };
}

export default useDemoLogin;
