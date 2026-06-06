/**
 * utils/index.js — Shared utility functions
 */

// ─── Date ─────────────────────────────────────────────────────────────────
export const formatDate = (date, options = {}) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric", ...options,
  });
};

export const formatDateTime = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

export const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

// ─── Numbers ──────────────────────────────────────────────────────────────
export const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 })
    .format(amount ?? 0);

export const formatLakhs = (amount) => {
  if (!amount) return "₹0";
  if (amount >= 10_000_000) return `₹${(amount / 10_000_000).toFixed(1)}Cr`;
  if (amount >= 100_000)    return `₹${(amount / 100_000).toFixed(1)}L`;
  if (amount >= 1_000)      return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount}`;
};

export const percentage = (value, total) =>
  total === 0 ? 0 : parseFloat(((value / total) * 100).toFixed(1));

// ─── String ───────────────────────────────────────────────────────────────
export const capitalize = (s) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "";

export const initials = (name = "") =>
  name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

export const truncate = (str, max = 40) =>
  str && str.length > max ? `${str.slice(0, max)}…` : str;

// ─── Validation ───────────────────────────────────────────────────────────
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isValidPhone = (phone) => /^[6-9]\d{9}$/.test(phone);

// ─── File ─────────────────────────────────────────────────────────────────
export const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const formatFileSize = (bytes) => {
  if (bytes < 1024)          return `${bytes} B`;
  if (bytes < 1024 * 1024)   return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Array ────────────────────────────────────────────────────────────────
export const groupBy = (arr, key) =>
  arr.reduce((acc, item) => {
    const group = item[key];
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

export const sortBy = (arr, key, dir = "asc") =>
  [...arr].sort((a, b) => {
    if (a[key] < b[key]) return dir === "asc" ? -1 : 1;
    if (a[key] > b[key]) return dir === "asc" ? 1 : -1;
    return 0;
  });

// ─── Class names helper (minimal clsx) ───────────────────────────────────
export const cn = (...classes) => classes.filter(Boolean).join(" ");
