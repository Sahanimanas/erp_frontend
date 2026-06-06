/**
 * constants/index.js — App-wide constants
 */

// ─── Roles ────────────────────────────────────────────────────────────────
export const USER_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  PRINCIPAL:   "PRINCIPAL",
  TEACHER:     "TEACHER",
  STUDENT:     "STUDENT",
  PARENT:      "PARENT",
  ACCOUNTANT:  "ACCOUNTANT",
};

export const ROLE_LABELS = {
  "SUPER_ADMIN": "Super Admin",
  "SCHOOL_ADMIN": "School Admin",
  "PRINCIPAL": "Principal",
  "TEACHER":   "Teacher",
  "STUDENT":   "Student",
  "PARENT":    "Parent",
  "ACCOUNTANT": "Accountant",
};

export const ROLE_BADGE_VARIANT = {
  "SUPER_ADMIN": "purple",
  "SCHOOL_ADMIN": "info",
  "PRINCIPAL": "indigo",
  "TEACHER":   "success",
  "STUDENT":   "default",
  "PARENT":    "warning",
  "ACCOUNTANT": "warning",
};

// ─── Classes ──────────────────────────────────────────────────────────────
export const CLASS_LIST = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `Class ${i + 1}`,
}));

export const SECTION_LIST = ["A", "B", "C", "D", "E"].map((s) => ({
  value: s,
  label: `Section ${s}`,
}));

// ─── Attendance statuses ──────────────────────────────────────────────────
export const ATTENDANCE_STATUS = {
  PRESENT: "present",
  ABSENT:  "absent",
  LEAVE:   "leave",
  LATE:    "late",
};

export const ATTENDANCE_COLORS = {
  present: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "#10b981" },
  absent:  { bg: "bg-red-100",     text: "text-red-700",     dot: "#ef4444" },
  leave:   { bg: "bg-amber-100",   text: "text-amber-700",   dot: "#f59e0b" },
  late:    { bg: "bg-orange-100",  text: "text-orange-700",  dot: "#f97316" },
};

// ─── Fee status ───────────────────────────────────────────────────────────
export const FEE_STATUS = {
  PAID:    "paid",
  PENDING: "pending",
  PARTIAL: "partial",
  OVERDUE: "overdue",
};

export const FEE_STATUS_BADGE = {
  paid:    "success",
  pending: "danger",
  partial: "warning",
  overdue: "danger",
};

// ─── Months ───────────────────────────────────────────────────────────────
export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const SHORT_MONTHS = MONTHS.map((m) => m.slice(0, 3));

// ─── Gender ───────────────────────────────────────────────────────────────
export const GENDER_OPTIONS = [
  { value: "male",   label: "Male" },
  { value: "female", label: "Female" },
  { value: "other",  label: "Other" },
];

// ─── Blood groups ─────────────────────────────────────────────────────────
export const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];

// ─── Page sizes ───────────────────────────────────────────────────────────
export const PAGE_SIZES = [10, 25, 50, 100];

// ─── Grade thresholds ─────────────────────────────────────────────────────
export const GRADES = [
  { min: 91, max: 100, grade: "A+", gpa: 10.0 },
  { min: 81, max: 90,  grade: "A",  gpa: 9.0  },
  { min: 71, max: 80,  grade: "B+", gpa: 8.0  },
  { min: 61, max: 70,  grade: "B",  gpa: 7.0  },
  { min: 51, max: 60,  grade: "C+", gpa: 6.0  },
  { min: 41, max: 50,  grade: "C",  gpa: 5.0  },
  { min: 33, max: 40,  grade: "D",  gpa: 4.0  },
  { min: 0,  max: 32,  grade: "F",  gpa: 0.0  },
];

export function getGrade(marks) {
  return GRADES.find((g) => marks >= g.min && marks <= g.max) ?? GRADES[GRADES.length - 1];
}

// ─── API endpoints (for manual Axios calls) ───────────────────────────────
export const API = {
  AUTH:        "/auth",
  STUDENTS:    "/students",
  TEACHERS:    "/teachers",
  PARENTS:     "/parents",
  ATTENDANCE:  "/attendance",
  FEES:        "/fees",
  EXAMS:       "/exams",
  LIBRARY:     "/library",
  TRANSPORT:   "/transport",
  HOSTEL:      "/hostel",
  HR:          "/hr",
  ACCOUNTING:  "/accounting",
  REPORTS:     "/reports",
  SETTINGS:    "/settings",
  DASHBOARD:   "/dashboard",
  UPLOAD:      "/upload",
  COMMUNICATION:"/communication",
};
