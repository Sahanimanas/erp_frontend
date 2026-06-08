/**
 * services/axios.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Configured Axios instance used for any non-RTK-Query calls
 * (file uploads, PDF downloads, form multipart, etc.).
 *
 * Interceptors:
 *   REQUEST  → inject Bearer token from localStorage
 *   RESPONSE → on 401 → call refresh endpoint → retry once → else logout
 */
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";
const LS_KEY   = "erp_auth";

function getTokens() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) ?? {};
  } catch {
    return {};
  }
}

function saveToken({ token, tokenExpiry, refreshToken }) {
  try {
    const current = getTokens();
    localStorage.setItem(LS_KEY, JSON.stringify({
      ...current,
      ...(token !== undefined && { token }),
      ...(tokenExpiry !== undefined && { tokenExpiry }),
      ...(refreshToken !== undefined && { refreshToken }),
    }));
  } catch { /* ignore */ }
}

// ─── Create instance ──────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: { "Content-Type": "application/json" },
});

// ─── Request interceptor ──────────────────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const { token } = getTokens();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────
let isRefreshing = false;
let pendingQueue = [];

function processPendingQueue(error, token = null) {
  pendingQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Don't try to refresh for auth endpoints or non-401 errors
    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/refresh');
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue subsequent 401s while refresh is in flight
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return apiClient(original);
      });
    }

    original._retry  = true;
    isRefreshing     = true;

    try {
      const { refreshToken } = getTokens();
      if (!refreshToken) throw new Error("No refresh token");

      const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });

      // Backend shape: { success, data: { accessToken, refreshToken } }
      const newToken = data?.data?.accessToken;
      const newRefresh = data?.data?.refreshToken;
      if (!newToken) throw new Error("Invalid refresh response");

      const tokenExpiry = Date.now() + 15 * 60 * 1000; // access token lives 15 min
      saveToken({ token: newToken, tokenExpiry, refreshToken: newRefresh });

      apiClient.defaults.headers.common.Authorization = `Bearer ${newToken}`;
      processPendingQueue(null, newToken);

      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);

    } catch (refreshError) {
      processPendingQueue(refreshError);
      localStorage.removeItem(LS_KEY);
      window.location.href = "/login?expired=true";
      return Promise.reject(refreshError);

    } finally {
      isRefreshing = false;
    }
  }
);

export default apiClient;
