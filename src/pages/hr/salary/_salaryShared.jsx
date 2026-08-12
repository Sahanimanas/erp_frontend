/**
 * Shared bits for the Employee Salary Management screens.
 * Month/mode vocabularies live here so the three pages can never disagree.
 */

export const MONTHS = [
  { value: 1,  label: "January",   short: "Jan" },
  { value: 2,  label: "February",  short: "Feb" },
  { value: 3,  label: "March",     short: "Mar" },
  { value: 4,  label: "April",     short: "Apr" },
  { value: 5,  label: "May",       short: "May" },
  { value: 6,  label: "June",      short: "Jun" },
  { value: 7,  label: "July",      short: "Jul" },
  { value: 8,  label: "August",    short: "Aug" },
  { value: 9,  label: "September", short: "Sep" },
  { value: 10, label: "October",   short: "Oct" },
  { value: 11, label: "November",  short: "Nov" },
  { value: 12, label: "December",  short: "Dec" },
];

/** Must mirror PAYMENT_MODES in backend/src/modules/payroll/types.ts. */
export const PAYMENT_MODES = [
  { value: "CASH",          label: "Cash" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "CHEQUE",        label: "Cheque" },
  { value: "UPI",           label: "UPI" },
  { value: "ONLINE",        label: "Online" },
];

export const modeLabel = (v) => PAYMENT_MODES.find((m) => m.value === v)?.label ?? v ?? "—";
export const monthLabel = (m) => MONTHS.find((x) => x.value === m)?.label ?? m;

/** Year dropdown: two years back through one year ahead of today. */
export function yearOptions() {
  const now = new Date().getFullYear();
  const years = [];
  for (let y = now + 1; y >= now - 3; y--) years.push({ value: String(y), label: String(y) });
  return years;
}

/** ₹ with thousands separators, no decimals — every amount here is whole rupees. */
export const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
