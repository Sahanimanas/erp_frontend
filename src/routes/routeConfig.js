/**
 * routeConfig.js
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for every route in the application.
 *
 * Each entry drives THREE things automatically:
 *   1. React Router  <Route> definitions  (AppRoutes.jsx)
 *   2. Sidebar navigation items          (Sidebar.jsx)
 *   3. Role-based access guards          (RoleRoute.jsx)
 *
 * FIELDS
 * ──────
 *   key       – unique string id (used by sidebar expand state)
 *   label     – display text
 *   path      – URL path (full, not relative)
 *   icon      – Lucide icon name string (resolved at render time)
 *   roles     – array of allowed roles; empty = public / everyone logged in
 *   lazy      – () => import(...) factory for React.lazy
 *   children  – nested routes (rendered as sub-menu in sidebar)
 *   index     – true → renders as the <Route index> for a parent
 *   hidden    – true → has a route but not shown in sidebar
 */

// ─── Lazy page factories ───────────────────────────────────────────────────
const pageModules = import.meta.glob("../pages/**/*.jsx");

/**
 * Safe lazy loader — logs a warning and returns a stub instead of throwing,
 * so a missing page file never crashes the router module at load time.
 */
const lazy = (path) => {
  const modulePath = `../pages/${path}.jsx`;
  const importer = pageModules[modulePath];
  if (!importer) {
    if (import.meta.env.DEV) {
      console.warn(`[routeConfig] Page not found: ${modulePath}`);
    }
    // Return a promise that resolves to a stub component
    return () => Promise.resolve({ default: () => null });
  }
  return importer;
};

export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  SCHOOL_ADMIN: "SCHOOL_ADMIN",
  PRINCIPAL: "PRINCIPAL",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT",
  ACCOUNTANT: "ACCOUNTANT",
};

const ALL_STAFF = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.TEACHER];
const ADMIN_ONLY = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL];
const ALL_ROLES = Object.values(ROLES);

/**
 * Roles that bypass designation-privilege filtering and always see every
 * section their `roles` allow (they administer the school).
 */
export const PRIVILEGE_EXEMPT_ROLES = [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL];

/**
 * Maps a top-level sidebar section `key` → the Designation privilege module
 * (the names in DesignationPage's PRIVILEGES checklist) that grants access to
 * it. Sections not listed here are utility/always-available and never gated.
 *
 * For a user with a designation, a mapped section shows only when its privilege
 * is in their permission list; users with no designation are not restricted.
 */
export const MODULE_PRIVILEGE = {
  dashboard:      "Home",
  student360:     "Student",
  "erp-billing":  "Finance",
  support:        "Communication",
  students:       "Student",
  employee:       "Employee",
  // Leave and Salary were split out of the Employee section into their own
  // sidebar modules; they stay behind the "Employee" privilege so no existing
  // designation silently gains or loses access to them.
  leave:          "Employee",
  salary:         "Employee",
  admission:      "Admission",
  "fee-management": "Fees Management",
  "student-acct": "Finance",
  "office-acct":  "Finance",
  payments:       "Payment",
  attendance:     "Attendance",
  "face-attend":  "Photo Attendance",
  "qr-attend":    "Attendance",
  exams:          "Exam Management",
  "online-exam":  "Exam Management",
  "ai-exam":      "Exam Management",
  subjects:       "Subject Management",
  timetable:      "Time Table Management",
  reports:        "Reports",
  transport:      "Transport Management",
  "bulk-comm":    "Communication",
  "live-rooms":   "Course Management",
  homework:       "Course Management",
};

/**
 * Whether a user with `permissions` (their designation's privilege list, or
 * null/undefined when they have no designation) may see the section `key`.
 * Privilege-exempt roles and unmapped sections are always allowed.
 */
export function canAccessSection(key, permissions, role) {
  if (PRIVILEGE_EXEMPT_ROLES.includes(role)) return true;
  if (!Array.isArray(permissions)) return true;        // no designation → unrestricted
  const required = MODULE_PRIVILEGE[key];
  if (!required) return true;                           // utility section, not gated
  return permissions.includes(required);
}

// ─── Route Config ──────────────────────────────────────────────────────────
export const routeConfig = [
  // ── Platform (SUPER ADMIN only) ───────────────────────────────────────────
  // Enterprise SaaS control plane: manage tenants, domains, plans, billing and
  // platform health. Visible only to SUPER_ADMIN, so it is hidden for every
  // school-scoped role and never exposes cross-tenant tooling.
  {
    key: "platform",
    label: "Platform",
    path: "/super-admin",
    icon: "ShieldCheck",
    roles: [ROLES.SUPER_ADMIN],
    children: [
      { key: "sa-dashboard", label: "Dashboard",      path: "/super-admin/dashboard",      icon: "LayoutDashboard", lazy: lazy("super-admin/DashboardPage"),     roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-schools",   label: "Schools",        path: "/super-admin/schools",        icon: "Building2",       lazy: lazy("super-admin/SchoolsListPage"),   roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-create",    label: "Create School",  path: "/super-admin/schools/create", icon: "Plus",            lazy: lazy("super-admin/CreateSchoolPage"),  roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-detail",    label: "School Details", path: "/super-admin/schools/:id",    icon: "Building2",       lazy: lazy("super-admin/SchoolDetailsPage"), roles: [ROLES.SUPER_ADMIN], hidden: true },
      { key: "sa-domains",   label: "Domains",        path: "/super-admin/domains",        icon: "Globe",           lazy: lazy("super-admin/DomainsPage"),       roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-plans",     label: "Plans",          path: "/super-admin/plans",          icon: "CreditCard",      lazy: lazy("super-admin/PlansPage"),         roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-qr",        label: "Payments & Service", path: "/super-admin/payments", icon: "IndianRupee",  lazy: lazy("platform-billing/PlatformQrAdminPage"), roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-support",   label: "Support Inbox",  path: "/super-admin/support",        icon: "LifeBuoy",        lazy: lazy("support/SupportInboxPage"),      roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-wa-usage",  label: "WhatsApp Usage", path: "/super-admin/whatsapp-usage",  icon: "MessageCircle",   lazy: lazy("platform-usage/WhatsappUsagePage"), roles: [ROLES.SUPER_ADMIN] },
      { key: "sa-audit",     label: "Audit Logs",     path: "/super-admin/audit",          icon: "ScrollText",      lazy: lazy("super-admin/AuditLogsPage"),     roles: [ROLES.SUPER_ADMIN] },
    ],
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    roles: ALL_ROLES,
    lazy: lazy("dashboard/DashboardPage"),
  },

  // ── Student Profile ───────────────────────────────────────────────────────
  // Search a student, then read their whole record — attendance, fees, results
  // and details — on one page. Sits directly under Dashboard because looking a
  // student up is the most common thing the office does. Shares the "Student"
  // privilege and ALL_STAFF roles with the Student Details section, so it
  // reaches exactly the people who can already search students.
  {
    key: "student360",
    label: "Student Profile",
    path: "/student-360",
    icon: "UserSearch",
    roles: ALL_STAFF,
    lazy: lazy("student-360/Student360Page"),
  },

  // ── ERP Subscription ──────────────────────────────────────────────────────
  // The school's side of platform billing: the vendor's payment QR, and the
  // payments the school reports against it. Finance roles only — a teacher has
  // no business with what the school owes its software vendor. Gated behind the
  // existing "Finance" privilege so no designation silently gains access.
  {
    key: "erp-billing",
    label: "ERP Subscription",
    path: "/erp-subscription",
    icon: "QrCode",
    roles: [ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT],
    lazy: lazy("platform-billing/CompanyQrPage"),
  },

  // ── Help & Support ────────────────────────────────────────────────────────
  // The school writes to the vendor here. Staff roles that actually run the
  // school — a teacher reporting an ERP fault would have no context to answer
  // follow-up questions, and support threads are per-school, not per-person.
  {
    key: "support",
    label: "Help & Support",
    path: "/support",
    icon: "LifeBuoy",
    roles: [ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT],
    lazy: lazy("support/SupportPage"),
  },

  // ── Task Management ───────────────────────────────────────────────────────
  {
    key: "tasks",
    hidden: true,
    label: "Task Management",
    path: "/tasks",
    icon: "ClipboardList",
    roles: ALL_STAFF,
    children: [
      { key: "tasks-all",    label: "All Tasks",    path: "/tasks/all",       icon: "List",         lazy: lazy("task-management/AllTasksPage"),    roles: ALL_STAFF },
      { key: "tasks-create", label: "Create Task",  path: "/tasks/create",    icon: "Plus",         lazy: lazy("task-management/CreateTaskPage"),  roles: ADMIN_ONLY },
      { key: "tasks-kanban", label: "Kanban Board", path: "/tasks/kanban",    icon: "Kanban",       lazy: lazy("task-management/KanbanBoardPage"), roles: ALL_STAFF },
      { key: "tasks-mine",   label: "My Tasks",     path: "/tasks/my-tasks",  icon: "CheckSquare",  lazy: lazy("task-management/MyTasksPage"),     roles: ALL_STAFF },
    ],
  },

  // ── House System ──────────────────────────────────────────────────────────
  {
    key: "house",
    hidden: true,
    label: "House System",
    path: "/house",
    icon: "Home",
    roles: ALL_STAFF,
    children: [
      { key: "house-dash",   label: "Dashboard",        path: "/house/dashboard",   icon: "BarChart2",   lazy: lazy("house-system/HouseDashboard"),        roles: ALL_STAFF },
      { key: "house-members",label: "Members",           path: "/house/members",     icon: "Users",       lazy: lazy("house-system/MembersPage"),           roles: ALL_STAFF },
      { key: "house-points", label: "Point Categories",  path: "/house/points",      icon: "Tag",         lazy: lazy("house-system/PointCategoriesPage"),   roles: ADMIN_ONLY },
      { key: "house-acts",   label: "Activities",        path: "/house/activities",  icon: "Activity",    lazy: lazy("house-system/ActivitiesPage"),         roles: ALL_STAFF },
    ],
  },

  // ── Inventory ─────────────────────────────────────────────────────────────
  {
    key: "inventory",
    hidden: true,
    label: "Inventory",
    path: "/inventory",
    icon: "Package",
    roles: ADMIN_ONLY,
    children: [
      { key: "inv-product",  label: "Product",        path: "/inventory/products",        icon: "Box",          lazy: lazy("inventory/ProductPage"),      roles: ADMIN_ONLY },
      { key: "inv-group",    label: "Product Group",  path: "/inventory/product-groups",  icon: "Layers",       lazy: lazy("inventory/ProductGroupPage"), roles: ADMIN_ONLY },
      { key: "inv-category", label: "Category",       path: "/inventory/category",        icon: "Tag",          lazy: lazy("inventory/CategoryPage"),     roles: ADMIN_ONLY },
      { key: "inv-store",    label: "Store",          path: "/inventory/store",           icon: "Store",        lazy: lazy("inventory/StorePage"),        roles: ADMIN_ONLY },
      { key: "inv-supplier", label: "Supplier",       path: "/inventory/supplier",        icon: "Truck",        lazy: lazy("inventory/SupplierPage"),     roles: ADMIN_ONLY },
      { key: "inv-purchase", label: "Purchase",       path: "/inventory/purchase",        icon: "ShoppingCart", lazy: lazy("inventory/PurchasePage"),     roles: ADMIN_ONLY },
      { key: "inv-sales",    label: "Sales",          path: "/inventory/sales",           icon: "TrendingUp",   lazy: lazy("inventory/SalesPage"),        roles: ADMIN_ONLY },
      { key: "inv-unit",     label: "Unit",           path: "/inventory/unit",            icon: "Ruler",        lazy: lazy("inventory/UnitPage"),         roles: ADMIN_ONLY },
      { key: "inv-issue",    label: "Issue",          path: "/inventory/issue",           icon: "Send",         lazy: lazy("inventory/IssuePage"),        roles: ADMIN_ONLY },
    ],
  },

  // ── License & Payments ────────────────────────────────────────────────────
  {
    key: "license",
    hidden: true,
    label: "License & Payments",
    path: "/license",
    icon: "CreditCard",
    roles: ADMIN_ONLY,
    lazy: lazy("settings/LicensePage"),
  },

  // ── Reception ─────────────────────────────────────────────────────────────
  {
    key: "reception",
    hidden: true,
    label: "Reception",
    path: "/reception",
    icon: "Building2",
    roles: ALL_STAFF,
    children: [
      { key: "reception-desk",      label: "Admission Enquiry", path: "/reception/desk",        icon: "Monitor",      lazy: lazy("admission/ReceptionDeskPage"),         roles: ALL_STAFF },
      { key: "reception-postal",    label: "Postal Record",     path: "/reception/visitors",    icon: "Mail",         lazy: lazy("admission/VisitorsPage"),              roles: ALL_STAFF },
      { key: "reception-calllog",   label: "Call Log",          path: "/reception/call-log",    icon: "Phone",        lazy: lazy("admission/ReceptionDeskPage"),         roles: ALL_STAFF },
      { key: "reception-visitorlog",label: "Visitor Log",       path: "/reception/visitor-log", icon: "UserCheck",    lazy: () => import("../pages/reception/VisitorLogPage"),  roles: ALL_STAFF },
      { key: "reception-complaint", label: "Complaint",         path: "/reception/complaint",   icon: "AlertCircle",  lazy: () => import("../pages/reception/ComplaintPage"),   roles: ALL_STAFF },
      { key: "reception-config",    label: "Config Reception",  path: "/reception/config",      icon: "Settings",     lazy: () => import("../pages/reception/ConfigReceptionPage"), roles: ADMIN_ONLY },
    ],
  },

  // ── Admission ─────────────────────────────────────────────────────────────
  {
    key: "admission",
    label: "Admission",
    path: "/admission",
    icon: "GraduationCap",
    roles: ADMIN_ONLY,
    children: [
      { key: "admission-new",        label: "Create Admission",   path: "/admission/new",            icon: "UserPlus",     lazy: lazy("admission/NewAdmissionPage"),        roles: ADMIN_ONLY },
      { key: "admission-list",       label: "Online Admission",   path: "/admission/list",           icon: "List",         lazy: lazy("admission/AdmissionListPage"),       roles: ADMIN_ONLY },
      { key: "admission-reg",        label: "Registration",       path: "/admission/registration",   icon: "ClipboardList",lazy: lazy("admission/RegistrationListPage"),    roles: ADMIN_ONLY },
      { key: "admission-import",     label: "Multiple Import",    path: "/admission/import",         icon: "Upload",       lazy: lazy("admission/MultipleImportPage"),      roles: ADMIN_ONLY },
      { key: "admission-enq",        label: "Enquiry",            path: "/admission/enquiry",        icon: "MessageSquare",lazy: lazy("admission/EnquiryPage"),            roles: ADMIN_ONLY },
    ],
  },

  // ── Student Details ───────────────────────────────────────────────────────
  {
    key: "students",
    label: "Student Details",
    path: "/students",
    icon: "Users",
    roles: ALL_STAFF,
    children: [
      { key: "students-add",      label: "Add Student",           path: "/students/add",       icon: "UserPlus",  lazy: lazy("students/AddStudentPage"),       roles: ADMIN_ONLY },
      { key: "students-search",   label: "Search Student",        path: "/students/search",    icon: "Search",    lazy: lazy("students/SearchStudentPage"),    roles: ALL_STAFF },
      { key: "students-list",     label: "Student List",          path: "/students/list",      icon: "List",      lazy: lazy("students/StudentListPage"),      roles: ALL_STAFF },
      { key: "students-upload",   label: "Upload Student",        path: "/students/upload",    icon: "Upload",    lazy: lazy("students/UploadStudentPage"),    roles: ADMIN_ONLY },
      { key: "students-promote",  label: "Promote Student",       path: "/students/promote",   icon: "ArrowUpCircle", lazy: lazy("students/PromoteStudentPage"), roles: ADMIN_ONLY },
      { key: "students-bulk",     label: "Student Bulk Update",   path: "/students/bulk-update",icon: "PencilLine",lazy: lazy("students/StudentBulkUpdatePage"),roles: ADMIN_ONLY },
      { key: "students-idprint",  label: "Student ID Print",      path: "/students/id-print",  icon: "IdCard",    lazy: lazy("students/StudentIdPrintPage"),   roles: ADMIN_ONLY },
      { key: "students-profile",  label: "Student Profile",       path: "/students/profile",   icon: "User",      lazy: lazy("students/StudentProfilePage"),   roles: ALL_STAFF, hidden: true },
      { key: "students-idcard",   label: "ID Card",               path: "/students/id-card",   icon: "IdCard",    lazy: lazy("students/IDCardPage"),           roles: ADMIN_ONLY, hidden: true },
      { key: "students-idedit",   label: "ID Card Editor",        path: "/students/id-editor", icon: "CreditCard",lazy: lazy("students/IdCardEditorPage"),     roles: ADMIN_ONLY },
    ],
  },

  // ── Parents ───────────────────────────────────────────────────────────────
  {
    key: "parents",
    label: "Parents",
    path: "/parents",
    icon: "UserCheck",
    roles: ALL_STAFF,
    children: [
      { key: "parents-list",       label: "Parents List",    path: "/parents/list",        icon: "Users",   lazy: lazy("parents/ParentListPage"),         roles: ALL_STAFF },
      { key: "parents-add",        label: "Add Parent",      path: "/parents/add",         icon: "UserPlus",lazy: lazy("parents/AddParentPage"),          roles: ADMIN_ONLY },
    ],
  },

  // ── Employee ──────────────────────────────────────────────────────────────
  {
    key: "employee",
    label: "Employee",
    path: "/employee",
    icon: "Briefcase",
    roles: ADMIN_ONLY,
    children: [
      { key: "emp-add",         label: "Add Employee",     path: "/employee/add",            icon: "UserPlus",     lazy: lazy("hr/AddEmployeePage"),        roles: ADMIN_ONLY },
      { key: "emp-list",        label: "Employee Search",  path: "/employee/list",           icon: "Search",       lazy: lazy("hr/EmployeeListPage"),       roles: ADMIN_ONLY },
      { key: "emp-designation", label: "Designation",      path: "/employee/designation",    icon: "BadgeCheck",   lazy: lazy("hr/DesignationPage"),        roles: ADMIN_ONLY },
      { key: "emp-dept",        label: "Department",       path: "/employee/departments",    icon: "Building",     lazy: lazy("hr/DepartmentPage"),         roles: ADMIN_ONLY },
      { key: "emp-dept-detail", label: "Department Details", path: "/employee/departments/:id", icon: "Building", lazy: lazy("hr/DepartmentDetailPage"),   roles: ADMIN_ONLY, hidden: true },
      { key: "emp-upload",      label: "Upload Employee",  path: "/employee/upload",         icon: "Upload",       lazy: lazy("hr/UploadEmployeePage"),     roles: ADMIN_ONLY },
      { key: "emp-idprint",     label: "Employee ID Print",path: "/employee/id-print",       icon: "IdCard",       lazy: lazy("hr/EmployeeIdPrintPage"),    roles: ADMIN_ONLY },
      { key: "emp-ideditor",    label: "Employee ID Card Editor", path: "/employee/id-editor", icon: "Pencil",     lazy: lazy("hr/EmployeeIdCardEditorPage"), roles: ADMIN_ONLY },
      { key: "emp-deactivate",  label: "Login Deactivate", path: "/employee/deactivate",     icon: "Lock",         lazy: lazy("hr/LoginDeactivatePage"),    roles: ADMIN_ONLY },
    ],
  },

  // ── Leave Management ──────────────────────────────────────────────────────
  // Split out of the Employee section into its own sidebar module. Kept on the
  // same ADMIN_ONLY section roles and "Employee" privilege it inherited there,
  // so the move changes placement only — nobody gains or loses access. (The
  // sidebar filters submenu items by `hidden` but not by role, so widening the
  // section would show admin-only pages to staff and 403 them on click.)
  {
    key: "leave",
    label: "Leave Management",
    path: "/leave",
    icon: "CalendarDays",
    roles: ADMIN_ONLY,
    children: [
      { key: "leave-type",    label: "Leave Type",    path: "/leave/types",   icon: "CalendarCheck",  lazy: lazy("hr/leave/LeaveTypePage"),    roles: ADMIN_ONLY },
      { key: "leave-assign",  label: "Leave Assign",  path: "/leave/assign",  icon: "UserCog",        lazy: lazy("hr/leave/LeaveAssignPage"),  roles: ADMIN_ONLY },
      { key: "leave-add",     label: "Add Leave",     path: "/leave/add",     icon: "CalendarPlus",   lazy: lazy("hr/leave/AddLeavePage"),     roles: ADMIN_ONLY },
      { key: "leave-apply",   label: "Apply Leave",   path: "/leave/apply",   icon: "CalendarClock",  lazy: lazy("hr/leave/ApplyLeavePage"),   roles: ALL_STAFF },
      { key: "leave-approve", label: "Approve Leave", path: "/leave/approve", icon: "CalendarCheck2", lazy: lazy("hr/leave/ApproveLeavePage"), roles: ADMIN_ONLY },
    ],
  },

  // ── Salary Management ─────────────────────────────────────────────────────
  {
    key: "salary",
    label: "Salary Management",
    path: "/salary",
    icon: "Wallet",
    roles: ADMIN_ONLY,
    children: [
      { key: "salary-structure", label: "Salary Structure", path: "/salary/structure", icon: "Building",    lazy: lazy("hr/salary/SalaryStructurePage"),  roles: ADMIN_ONLY },
      { key: "salary-pay",       label: "Pay Salary",       path: "/salary/pay",       icon: "IndianRupee", lazy: lazy("hr/salary/SalaryManagementPage"), roles: ADMIN_ONLY },
      { key: "salary-payments",  label: "Salary Payments",  path: "/salary/payments",  icon: "Receipt",     lazy: lazy("hr/salary/SalaryPaymentsPage"),   roles: ADMIN_ONLY },
    ],
  },

  // ── Certificate ───────────────────────────────────────────────────────────
  {
    key: "certificate",
    label: "Certificate",
    path: "/certificate",
    icon: "Award",
    roles: ADMIN_ONLY,
    children: [
      { key: "cert-template",  label: "Certificate Template", path: "/certificate/templates",         icon: "FileText", lazy: lazy("certificates/CertificateTemplatePage"),  roles: ADMIN_ONLY },
      { key: "cert-student",   label: "Generate Student",     path: "/certificate/generate-student",  icon: "GraduationCap", lazy: lazy("certificates/GenerateStudentCertPage"), roles: ADMIN_ONLY },
      { key: "cert-employee",  label: "Generate Employee",    path: "/certificate/generate-employee", icon: "Briefcase", lazy: lazy("certificates/GenerateEmployeeCertPage"), roles: ADMIN_ONLY },
    ],
  },

  // ── Card Management ───────────────────────────────────────────────────────
  {
    key: "cards",
    hidden: true,
    label: "Card Management",
    path: "/cards",
    icon: "CreditCard",
    roles: ADMIN_ONLY,
    children: [
      { key: "cards-id-template",    label: "Id Card Template",     path: "/cards/id-template",     icon: "IdCard",   lazy: () => import("../pages/card-management/IdCardTemplatePage"),    roles: ADMIN_ONLY },
      { key: "cards-admit-template", label: "Admit Card Template",  path: "/cards/admit-template",  icon: "FileText", lazy: () => import("../pages/card-management/AdmitCardTemplatePage"),  roles: ADMIN_ONLY },
      { key: "cards-admit-generate", label: "Generate Admit Card",  path: "/cards/admit-generate",  icon: "Printer",  lazy: () => import("../pages/card-management/GenerateAdmitCardPage"),  roles: ADMIN_ONLY },
    ],
  },

  // ── Academic ──────────────────────────────────────────────────────────────
  {
    key: "academic",
    hidden: true,
    label: "Academic",
    path: "/academic",
    icon: "BookOpen",
    roles: ALL_STAFF,
    children: [
      { key: "academic-classes",   label: "Classes",    path: "/academic/classes",   icon: "School",     lazy: lazy("teachers/ClassesPage"),   roles: ADMIN_ONLY },
      { key: "academic-subjects",  label: "Subjects",   path: "/academic/subjects",  icon: "BookMarked", lazy: lazy("teachers/SubjectsPage"),  roles: ADMIN_ONLY },
      { key: "academic-timetable", label: "Timetable",  path: "/academic/timetable", icon: "Clock",      lazy: lazy("teachers/TimetablePage"), roles: ALL_STAFF },
      { key: "academic-syllabus",  label: "Syllabus",   path: "/academic/syllabus",  icon: "FileText",   lazy: lazy("teachers/SyllabusPage"),  roles: ALL_STAFF },
    ],
  },

  // ── Live Class Rooms ──────────────────────────────────────────────────────
  // Hidden from the sidebar (still routable by direct URL).
  {
    key: "live-rooms",
    hidden: true,
    label: "Live Class Rooms",
    path: "/live",
    icon: "Monitor",
    roles: ALL_STAFF,
    children: [
      { key: "live-create", label: "Create Room",  path: "/live/create", icon: "Plus",  lazy: lazy("teachers/CreateLiveRoomPage"), roles: ALL_STAFF },
      { key: "live-list",   label: "Room List",    path: "/live/list",   icon: "List",  lazy: lazy("teachers/LiveRoomListPage"),   roles: ALL_STAFF },
    ],
  },

  // ── Homework ──────────────────────────────────────────────────────────────
  // Hidden from the sidebar (still routable by direct URL).
  {
    key: "homework",
    hidden: true,
    label: "Homework",
    path: "/homework",
    icon: "PenTool",
    roles: ALL_STAFF,
    children: [
      { key: "hw-list",  label: "Homework List",  path: "/homework/list",  icon: "List",  lazy: lazy("teachers/HomeworkListPage"),  roles: ALL_STAFF },
      { key: "hw-add",   label: "Add Homework",   path: "/homework/add",   icon: "Plus",  lazy: lazy("teachers/AddHomeworkPage"),   roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
    ],
  },

  // Subject Management merged into Class Management below (Subjects + Assign
  // Subjects to Class now live under the Class Management section).

  // ── Class Management ────────────────────────────────────────────────────
  // Sessions / Classes / Subjects here are the SAME records used by Settings →
  // Classes & Sections and every class/section dropdown (one merged dataset).
  {
    key: "class-management",
    label: "Class Management",
    path: "/class-management",
    icon: "GraduationCap",
    roles: ADMIN_ONLY,
    children: [
      { key: "cm-session",      label: "Add Session",             path: "/class-management/session",       icon: "CalendarDays",  lazy: lazy("class-management/AddSessionPage"),             roles: ADMIN_ONLY },
      { key: "cm-class",        label: "Add Class",               path: "/class-management/class",         icon: "School",        lazy: lazy("class-management/AddClassPage"),               roles: ADMIN_ONLY },
      { key: "cm-class-detail", label: "Add Class Details",       path: "/class-management/class-details", icon: "Layers",        lazy: lazy("class-management/AddClassDetailsPage"),         roles: ADMIN_ONLY },
      { key: "cm-subject",      label: "Add Subject",             path: "/class-management/subject",        icon: "BookOpen",      lazy: lazy("class-management/AddSubjectPage"),             roles: ADMIN_ONLY },
      { key: "subj-list",       label: "Subjects",                path: "/class-management/subjects",         icon: "BookMarked",    lazy: lazy("subjects/SubjectListPage"),                     roles: ADMIN_ONLY },
      { key: "subj-assign",     label: "Assign Subjects to Class",path: "/class-management/assign-subjects",  icon: "Layers",        lazy: lazy("subjects/ClassSubjectMapPage"),                 roles: ADMIN_ONLY },
      { key: "cm-non-subject",  label: "Add Non-Subject",         path: "/class-management/non-subject",    icon: "Music",         lazy: lazy("class-management/AddNonSubjectPage"),           roles: ADMIN_ONLY },
      { key: "cm-syllabus",     label: "Add Syllabus",            path: "/class-management/syllabus",       icon: "FileText",      lazy: lazy("class-management/AddSyllabusPage"),            roles: ADMIN_ONLY },
      { key: "cm-manage-syll",  label: "Manage Syllabus",         path: "/class-management/manage-syllabus",icon: "Files",         lazy: lazy("class-management/ManageSyllabusPage"),          roles: ADMIN_ONLY },
      { key: "cm-emp-map",      label: "Employee Subject Mapping",path: "/class-management/employee-mapping",icon: "Users",        lazy: lazy("class-management/EmployeeSubjectMappingPage"),  roles: ADMIN_ONLY },
    ],
  },

  // ── Time Table ──────────────────────────────────────────────────────────
  // All pages read ONE shared timetable record, so building on Add Time Table
  // flows straight through to View, Assign, Employee and Session views.
  {
    key: "timetable",
    label: "Time Table",
    path: "/timetable",
    icon: "CalendarRange",
    roles: ALL_STAFF,
    children: [
      { key: "tt-manage",      label: "Add Time Table",           path: "/timetable/manage",       icon: "CalendarRange", lazy: lazy("timetable/ManageTimetablePage"),     roles: ADMIN_ONLY },
      { key: "tt-view",        label: "View Time Table",          path: "/timetable/view",         icon: "CalendarDays",  lazy: lazy("timetable/ViewTimetablePage"),       roles: ALL_STAFF },
      { key: "tt-assign",      label: "Time Table Assign",        path: "/timetable/assign",       icon: "UserCheck",     lazy: lazy("timetable/AssignTimetablePage"),     roles: ADMIN_ONLY },
      { key: "tt-view-assign", label: "View Time Table Assign",   path: "/timetable/view-assign",  icon: "ClipboardList", lazy: lazy("timetable/ViewAssignTimetablePage"), roles: ALL_STAFF },
      { key: "tt-employee",    label: "View Employee Time Table", path: "/timetable/employee",     icon: "UserSquare",    lazy: lazy("timetable/EmployeeTimetablePage"),   roles: ALL_STAFF },
      { key: "tt-session",     label: "View Session Time Table",  path: "/timetable/session",      icon: "CalendarClock", lazy: lazy("timetable/SessionTimetablePage"),    roles: ALL_STAFF },
      { key: "tt-periods",     label: "Periods",                  path: "/timetable/periods",      icon: "Clock",         lazy: lazy("timetable/PeriodsPage"),             roles: ADMIN_ONLY },
    ],
  },

  // ── Exam Management ───────────────────────────────────────────────────────
  {
    key: "exams",
    label: "Exam Management",
    path: "/exam-management",
    icon: "FileText",
    roles: ALL_STAFF,
    children: [
      { key: "exam-grading",       label: "Setup Exam Grading",      path: "/exam-management/setup-grading",      icon: "Award",         lazy: lazy("exam-management/SetupExamGradingPage"),     roles: ADMIN_ONLY },
      { key: "exam-manage",        label: "Manage Exam",             path: "/exam-management/manage-exam",         icon: "ClipboardList", lazy: lazy("exam-management/ManageExamPage"),           roles: ADMIN_ONLY },
      { key: "exam-manage-sched",  label: "Manage Exam Schedule",    path: "/exam-management/manage-schedule",     icon: "CalendarClock", lazy: lazy("exam-management/ManageExamSchedulePage"),   roles: ADMIN_ONLY },
      { key: "exam-view-sched",    label: "View Exam Schedule",      path: "/exam-management/view-schedule",       icon: "CalendarDays",  lazy: lazy("exam-management/ViewExamSchedulePage"),     roles: ALL_STAFF },
      { key: "exam-publish-sched", label: "Publish Exam Schedule",   path: "/exam-management/publish-schedule",    icon: "Send",          lazy: lazy("exam-management/PublishExamSchedulePage"),  roles: ADMIN_ONLY },
      { key: "exam-hall-ticket",   label: "Exam Hall Ticket",        path: "/exam-management/hall-ticket",         icon: "Ticket",        lazy: lazy("exam-management/ExamHallTicketPage"),       roles: ALL_STAFF },
      { key: "exam-attend-card",   label: "Exam Attendance Card",    path: "/exam-management/attendance-card",     icon: "ClipboardCheck",        lazy: lazy("exam-management/ExamAttendanceCardPage"),   roles: ALL_STAFF },
      { key: "exam-student-attend",label: "Student Exam Attendance", path: "/exam-management/student-attendance",  icon: "UserCheck",     lazy: lazy("exam-management/StudentExamAttendancePage"),roles: ALL_STAFF },
      { key: "exam-view-attend",   label: "View Exam Attendance",    path: "/exam-management/view-attendance",     icon: "Eye",           lazy: lazy("exam-management/ViewExamAttendancePage"),   roles: ALL_STAFF },
      { key: "exam-hall-plan",     label: "Exam Hall Plan",          path: "/exam-management/hall-plan",           icon: "LayoutGrid",    lazy: lazy("exam-management/ExamHallPlanPage"),         roles: ADMIN_ONLY },
      { key: "exam-hall-detail",   label: "Exam Hall Detail",        path: "/exam-management/hall-detail",         icon: "Building2",     lazy: lazy("exam-management/ExamHallDetailPage"),       roles: ALL_STAFF },
      { key: "exam-sitting-plan",  label: "Exam Sitting Plan",       path: "/exam-management/sitting-plan",        icon: "Armchair",      lazy: lazy("exam-management/ExamSittingPlanPage"),      roles: ALL_STAFF },
    ],
  },

  // ── Result Management ─────────────────────────────────────────────────────
  // Exam subject results read/write the SAME StudentMark table as Exam
  // Management, so marks entered here update exam results everywhere (in sync).
  {
    key: "result-management",
    label: "Result Management",
    path: "/result-management",
    icon: "Flag",
    roles: ALL_STAFF,
    children: [
      { key: "rm-manage",       label: "Manage Exam Result",     path: "/result-management/manage-exam",      icon: "ClipboardEdit",   lazy: lazy("result-management/ExamResultEntryPage"),     roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
      { key: "rm-add",          label: "Add Exam Result",        path: "/result-management/add-exam",         icon: "FilePlus",        lazy: lazy("result-management/AddExamResultPage"),       roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
      { key: "rm-manage-all",   label: "Manage All Exam Result", path: "/result-management/manage-all",       icon: "Table2",          lazy: lazy("result-management/AllExamResultPage"),       roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
      { key: "rm-view-all",     label: "View All Exam Result",   path: "/result-management/view-all",         icon: "Eye",             lazy: lazy("result-management/ViewAllExamResultPage"),   roles: ALL_STAFF },
      { key: "rm-manage-non",   label: "Manage NonSubject Result",path: "/result-management/manage-nonsubject",icon: "Music",          lazy: lazy("result-management/NonSubjectResultPage"),    roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
      { key: "rm-view-non",     label: "View NonSubject Result", path: "/result-management/view-nonsubject",   icon: "Eye",             lazy: lazy("result-management/ViewNonSubjectResultPage"),roles: ALL_STAFF },
      { key: "rm-publish-exam", label: "Publish Exam Result",    path: "/result-management/publish-exam",      icon: "Megaphone",       lazy: lazy("result-management/PublishExamResultPage"),   roles: ADMIN_ONLY },
      { key: "rm-remarks",      label: "Report Card Remarks",    path: "/result-management/remarks",           icon: "MessageSquareText",lazy: lazy("result-management/ReportCardRemarksPage"),  roles: [ROLES.TEACHER, ...ADMIN_ONLY] },
      { key: "rm-gen-card",     label: "Generate Report Card",   path: "/result-management/generate-card",     icon: "FileBadge",       lazy: lazy("result-management/GenerateReportCardPage"),  roles: ADMIN_ONLY },
      { key: "rm-view-card",    label: "View Report Card",       path: "/result-management/view-card",         icon: "FileText",        lazy: lazy("result-management/ViewReportCardPage"),      roles: ALL_STAFF },
      { key: "rm-publish-card", label: "Publish Report Card",    path: "/result-management/publish-card",      icon: "Send",            lazy: lazy("result-management/PublishReportCardPage"),   roles: ADMIN_ONLY },
    ],
  },

  // ── Online Exam ───────────────────────────────────────────────────────────
  {
    key: "online-exam",
    hidden: true,
    label: "Online Exam",
    path: "/online-exam",
    icon: "Globe",
    roles: ALL_STAFF,
    children: [
      { key: "oe-list",   label: "Online Exams",   path: "/online-exam/list",   icon: "List",  lazy: lazy("online-exam/OnlineExamListPage"),   roles: ALL_STAFF },
      { key: "oe-create", label: "Create Exam",    path: "/online-exam/create", icon: "Plus",  lazy: lazy("online-exam/CreateOnlineExamPage"), roles: ADMIN_ONLY },
    ],
  },

  // ── AI Exam ───────────────────────────────────────────────────────────────
  {
    key: "ai-exam",
    hidden: true,
    label: "AI Exam",
    path: "/ai-exam",
    icon: "Cpu",
    roles: ALL_STAFF,
    children: [
      { key: "ai-gen",  label: "AI Generate",  path: "/ai-exam/generate", icon: "Zap",   lazy: lazy("ai-exam/AIGeneratePage"),  roles: ADMIN_ONLY },
      { key: "ai-list", label: "AI Exams",     path: "/ai-exam/list",     icon: "List",  lazy: lazy("ai-exam/AIExamListPage"),  roles: ALL_STAFF },
    ],
  },

  // ── Attendance ────────────────────────────────────────────────────────────
  {
    key: "attendance",
    label: "Attendance",
    path: "/attendance",
    icon: "UserCheck",
    roles: ALL_STAFF,
    children: [
      { key: "attend-employee",     label: "Employee Attendance",        path: "/attendance/employee",          icon: "UserCheck",    lazy: lazy("attendance/EmployeeAttendancePage"),          roles: ADMIN_ONLY },
      { key: "attend-emp-view",     label: "View Employee Attendance",   path: "/attendance/employee/view",     icon: "Search",       lazy: lazy("attendance/ViewEmployeeAttendancePage"),      roles: ADMIN_ONLY },
      { key: "attend-emp-view-all", label: "View All Employee Attendance",path: "/attendance/employee/view-all", icon: "Users",        lazy: lazy("attendance/ViewAllEmployeeAttendancePage"),   roles: ADMIN_ONLY },
      { key: "attend-student",      label: "Student Attendance",         path: "/attendance/student",           icon: "Users",        lazy: lazy("attendance/StudentAttendancePage"),           roles: ALL_STAFF },
      { key: "attend-manual",       label: "Manual Attendance",          path: "/attendance/manual",            icon: "ClipboardCheck",lazy: lazy("attendance/ManualAttendancePage"),           roles: ALL_STAFF },
      { key: "attend-student-dl",   label: "Download Student Attendance",path: "/attendance/student/download",  icon: "Download",     lazy: lazy("attendance/DownloadStudentAttendancePage"),   roles: ALL_STAFF },
      { key: "attend-student-all",  label: "All Student Daily Attendance",path: "/attendance/student/daily",    icon: "CalendarCheck",lazy: lazy("attendance/AllStudentDailyAttendancePage"),   roles: ALL_STAFF },
      { key: "attend-smartcard",    label: "Smart Card Attendance",      path: "/attendance/smart-card",        icon: "CreditCard",   lazy: lazy("attendance/SmartCardAttendancePage"),         roles: ADMIN_ONLY },
      { key: "attend-biometric",    label: "Biometric Devices",          path: "/attendance/biometric",         icon: "Fingerprint",  lazy: lazy("attendance/BiometricAttendancePage"),         roles: ADMIN_ONLY },
      { key: "attend-monthly",      label: "Attendance Monthly Report",  path: "/attendance/report",            icon: "Calendar",     lazy: lazy("attendance/MonthlyReportPage"),               roles: ALL_STAFF },
      { key: "attend-teacher",      label: "Teacher Attendance",         path: "/attendance/teacher",           icon: "Briefcase",    lazy: lazy("attendance/TeacherAttendancePage"),           roles: ADMIN_ONLY, hidden: true },
    ],
  },

  // ── Face Attendance ───────────────────────────────────────────────────────
  {
    key: "face-attend",
    hidden: true,
    label: "Face Attendance",
    path: "/face-attendance",
    icon: "Camera",
    roles: ADMIN_ONLY,
    children: [
      { key: "face-config",  label: "Configure",  path: "/face-attendance/config",  icon: "Settings",  lazy: lazy("attendance/FaceConfigPage"),  roles: ADMIN_ONLY },
      { key: "face-logs",    label: "Logs",       path: "/face-attendance/logs",    icon: "List",      lazy: lazy("attendance/FaceLogsPage"),    roles: ADMIN_ONLY },
    ],
  },

  // ── QR Attendance ─────────────────────────────────────────────────────────
  {
    key: "qr-attend",
    hidden: true,
    label: "QR Code Attendance",
    path: "/qr-attendance",
    icon: "QrCode",
    roles: ALL_STAFF,
    children: [
      { key: "qr-scan",  label: "Scan QR",  path: "/qr-attendance/scan",  icon: "Camera",  lazy: lazy("attendance/QRScanPage"),  roles: ALL_STAFF },
    ],
  },

  // ── Library ───────────────────────────────────────────────────────────────
  {
    key: "library",
    label: "Library",
    path: "/library",
    icon: "Library",
    roles: ALL_STAFF,
    children: [
      { key: "lib-books",   label: "Books",        path: "/library/books",   icon: "Book",     lazy: lazy("library/BooksPage"),   roles: ALL_STAFF },
      { key: "lib-issue",   label: "Issue Books",  path: "/library/issue",   icon: "ArrowUp",  lazy: lazy("library/IssuePage"),   roles: ALL_STAFF },
      { key: "lib-return",  label: "Return Books", path: "/library/return",  icon: "ArrowDown",lazy: lazy("library/ReturnPage"),  roles: ALL_STAFF },
    ],
  },

  // ── Events ────────────────────────────────────────────────────────────────
  {
    key: "events",
    hidden: true,
    label: "Events",
    path: "/events",
    icon: "CalendarDays",
    roles: ALL_STAFF,
    children: [
      { key: "events-list", label: "Event List",  path: "/events/list", icon: "List",  lazy: lazy("communication/EventListPage"), roles: ALL_STAFF },
      { key: "events-add",  label: "Add Event",   path: "/events/add",  icon: "Plus",  lazy: lazy("communication/AddEventPage"),  roles: ADMIN_ONLY },
    ],
  },

  // ── WhatsApp ──────────────────────────────────────────────────────────────
  // Link the school's own number once (Baileys / WhatsApp Web) and send text
  // or media to recipients from that same number.
  {
    key: "whatsapp",
    label: "WhatsApp",
    path: "/whatsapp",
    icon: "MessageCircle",
    roles: ADMIN_ONLY,
    children: [
      { key: "whatsapp-send",  label: "Send & Connect", path: "/whatsapp/send",  icon: "Send",      lazy: lazy("communication/WhatsAppPage"),      roles: ADMIN_ONLY },
      { key: "whatsapp-stats", label: "Message Counts", path: "/whatsapp/stats", icon: "BarChart3", lazy: lazy("communication/WhatsAppStatsPage"), roles: ADMIN_ONLY },
    ],
  },

  // ── Bulk SMS & Email ──────────────────────────────────────────────────────
  {
    key: "bulk-comm",
    hidden: true,
    label: "Bulk SMS & Email",
    path: "/communication",
    icon: "MessageSquare",
    roles: ADMIN_ONLY,
    children: [
      { key: "comm-sms",      label: "Send SMS",   path: "/communication/sms",       icon: "Phone",   lazy: lazy("communication/SendSMSPage"),    roles: ADMIN_ONLY },
      { key: "comm-email",    label: "Send Email", path: "/communication/email",     icon: "Mail",    lazy: lazy("communication/SendEmailPage"),   roles: ADMIN_ONLY },
      { key: "comm-templates",label: "Templates",  path: "/communication/templates", icon: "FileText",lazy: lazy("communication/TemplatesPage"),   roles: ADMIN_ONLY },
    ],
  },

  // ── Fee Management ──────────────────────────────────────────────────────────
  {
    key: "fee-management",
    label: "Fee Management",
    path: "/fee-management",
    icon: "Receipt",
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT],
    children: [
      { key: "fm-class-type",     label: "Class Fee Type",      path: "/fee-management/class-fee-type",     icon: "Receipt",   lazy: lazy("fee-management/ClassFeeTypePage"),      roles: ADMIN_ONLY },
      { key: "fm-manage",         label: "Manage Class Fee",    path: "/fee-management/manage-class-fee",   icon: "Wallet",    lazy: lazy("fee-management/ManageClassFeePage"),    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "fm-structure",      label: "Class Fee Structure", path: "/fee-management/class-fee-structure",icon: "FileText",  lazy: lazy("fee-management/ClassFeeStructurePage"), roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      // Transport routes + their monthly fee moved to Transport → Manage
      // Transport Route (one place to manage a route). Kept routable so old
      // links/bookmarks don't 404.
      { key: "fm-route-fee",      label: "Transport Fee Manage",path: "/fee-management/transport-route-fee",icon: "Bus",       lazy: lazy("fee-management/TransportRouteFeePage"), roles: ADMIN_ONLY, hidden: true },
      { key: "fm-summary",        label: "Class Fee Summary",   path: "/fee-management/class-fee-summary",  icon: "PieChart",  lazy: lazy("fee-management/ClassFeeSummaryPage"),   roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
    ],
  },

  // ── Payments ────────────────────────────────────────────────────────────────
  {
    key: "payments",
    label: "Payments",
    path: "/payments",
    icon: "CreditCard",
    roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT],
    children: [
      { key: "pay-student",   label: "Student Fee Payment", path: "/payments/student-fee",   icon: "CreditCard",   lazy: lazy("payments/StudentFeePaymentPage"), roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-fee-details", label: "Student Fee Details", path: "/payments/fee-details",  icon: "Wallet",       lazy: lazy("payments/StudentFeeDetailsPage"), roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-quick",     label: "Quick Collect",       path: "/payments/quick-collect", icon: "Wallet",       lazy: lazy("payments/QuickCollectPage"),      roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-monthly",   label: "Monthly Fee Payment", path: "/payments/monthly",       icon: "CalendarClock",lazy: lazy("payments/MonthlyFeePaymentPage"), roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-create",    label: "Add Fee Payment",     path: "/payments/create",        icon: "ReceiptText",  lazy: lazy("payments/CreateFeePaymentPage"),  roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-demand",    label: "Demand Receipt",      path: "/payments/demand-receipt",icon: "FileText",     lazy: lazy("payments/DemandReceiptPage"),     roles: [ROLES.SUPER_ADMIN, ROLES.SCHOOL_ADMIN, ROLES.PRINCIPAL, ROLES.ACCOUNTANT] },
      { key: "pay-discount",  label: "Bulk Discount",       path: "/payments/bulk-discount", icon: "Percent",      lazy: lazy("payments/BulkDiscountPage"),      roles: ADMIN_ONLY },
      { key: "pay-extra",     label: "Bulk Add Extra Fee",  path: "/payments/bulk-extra",    icon: "PlusCircle",   lazy: lazy("payments/BulkExtraFeePage"),      roles: ADMIN_ONLY },
      { key: "pay-late-rule", label: "Late Fee Fine Rule",  path: "/payments/late-fee-rule", icon: "AlarmClock",   lazy: lazy("payments/LateFeeRulePage"),       roles: ADMIN_ONLY },
    ],
  },

  // ── Student Accounting ────────────────────────────────────────────────────
  {
    key: "student-acct",
    label: "Student Accounting",
    path: "/fees",
    icon: "DollarSign",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
    children: [
      { key: "fees-offline",     label: "Offline Payments",  path: "/fees/offline",        icon: "CreditCard",   lazy: lazy("student-accounting/OfflinePaymentsPage"), roles: ADMIN_ONLY },
      { key: "fees-type",        label: "Fees Type",         path: "/fees/type",           icon: "Tag",          lazy: lazy("student-accounting/FeesTypePage"),        roles: ADMIN_ONLY },
      { key: "fees-group-sa",    label: "Fees Group",        path: "/fees/group",          icon: "Layers",       lazy: ()=>import("../pages/student-accounting/FeesGroupPage"),     roles: ADMIN_ONLY },
      { key: "fees-fine",        label: "Fine Setup",        path: "/fees/fine-setup",     icon: "AlertTriangle",lazy: lazy("student-accounting/FineSetupPage"),       roles: ADMIN_ONLY },
      { key: "fees-allocation-sa",label:"Fees Allocation",  path: "/fees/allocation",     icon: "GitBranch",    lazy: ()=>import("../pages/student-accounting/FeesAllocationPage"), roles: ADMIN_ONLY },
      { key: "fees-collect",     label: "Collect Fees",      path: "/fees/collect",        icon: "DollarSign",   lazy: lazy("student-accounting/CollectFeesPage"),     roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "fees-pay-inv",     label: "Fees Pay / Invoice",path: "/fees/pay-invoice",   icon: "FileText",     lazy: ()=>import("../pages/student-accounting/FeesPayInvoicePage"), roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "fees-due-inv",     label: "Due Fees Invoice",  path: "/fees/due-invoice",   icon: "AlertCircle",  lazy: lazy("student-accounting/DueFeesInvoicePage"),  roles: ADMIN_ONLY },
      { key: "fees-prev-dues-sa",label: "Previous Dues",     path: "/fees/previous-dues", icon: "Clock",        lazy: ()=>import("../pages/student-accounting/PreviousDuesPage"),  roles: ADMIN_ONLY },
      { key: "fees-reminder-sa", label: "Fees Reminder",     path: "/fees/reminder",      icon: "Bell",         lazy: ()=>import("../pages/student-accounting/FeesReminderPage"),  roles: ADMIN_ONLY },
    ],
  },

  // ── Office Accounting ─────────────────────────────────────────────────────
  {
    key: "office-acct",
    label: "Office Accounting",
    path: "/accounting",
    icon: "BarChart3",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
    children: [
      { key: "acct-account",  label: "Account",          path: "/accounting/account",      icon: "Briefcase",   lazy: ()=>import("../pages/office-accounting/AccountPage"),         roles: ADMIN_ONLY },
      { key: "acct-deposit",  label: "New Deposit",       path: "/accounting/deposit",      icon: "ArrowDownCircle",lazy:()=>import("../pages/office-accounting/NewDepositPage"),     roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "acct-exp-new",  label: "New Expense",       path: "/accounting/expense-new",  icon: "ArrowUpCircle",lazy:()=>import("../pages/office-accounting/NewExpensePage"),      roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "acct-txn",      label: "All Transactions",  path: "/accounting/transactions", icon: "List",         lazy:()=>import("../pages/office-accounting/AllTransactionsPage"), roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "acct-voucher",  label: "Voucher Head",      path: "/accounting/voucher-head", icon: "FileText",    lazy:()=>import("../pages/office-accounting/VoucherHeadPage"),     roles: ADMIN_ONLY },
    ],
  },

  // ── Reports ───────────────────────────────────────────────────────────────
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    icon: "Printer",
    roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT],
    children: [
      { key: "rep-students",    label: "Student Reports",     path: "/reports/students",    icon: "Users",      lazy: lazy("reports/StudentReportsPage"),     roles: ADMIN_ONLY },
      { key: "rep-fees",        label: "Fees Reports",        path: "/reports/fees",        icon: "DollarSign", lazy: lazy("reports/FeesReportsPage"),        roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "rep-attendance",  label: "Attendance Reports",  path: "/reports/attendance",  icon: "UserCheck",  lazy: lazy("reports/AttendanceReportsPage"),  roles: ADMIN_ONLY },
      { key: "rep-financial",   label: "Financial Reports",   path: "/reports/financial",   icon: "BarChart2",  lazy: lazy("reports/FinancialReportsPage"),   roles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.ACCOUNTANT] },
      { key: "rep-exam",        label: "Examination",         path: "/reports/examination", icon: "FileText",   lazy: lazy("reports/ExamReportsPage"),        roles: ALL_STAFF },
    ],
  },

  // ── Transport ─────────────────────────────────────────────────────────────
  // Routes here are the SAME TransportRoute records Fee Management edits: this
  // section owns the operational detail, Fee Management → Transport Fee Manage
  // owns the monthly fee. Child order follows the operational flow:
  // fleet → drivers → stops → routes → stops on a route → students on a route.
  {
    key: "transport",
    label: "Transport",
    path: "/transport",
    icon: "Truck",
    roles: ADMIN_ONLY,
    children: [
      { key: "transport-vehicles",  label: "Manage Vehicle Detail",   path: "/transport/vehicles",         icon: "Bus",         lazy: lazy("transport/ManageVehiclePage"),          roles: ADMIN_ONLY },
      { key: "transport-drivers",   label: "Manage Driver Detail",    path: "/transport/drivers",          icon: "UserCog",     lazy: lazy("transport/ManageDriverPage"),           roles: ADMIN_ONLY },
      { key: "transport-stoppages", label: "Manage Stoppage",         path: "/transport/stoppages",        icon: "MapPin",      lazy: lazy("transport/ManageStoppagePage"),         roles: ADMIN_ONLY },
      { key: "transport-routes",    label: "Manage Transport Route",  path: "/transport/routes",           icon: "Map",         lazy: lazy("transport/ManageTransportRoutePage"),   roles: ADMIN_ONLY },
      { key: "transport-rs",        label: "Assign Stoppage To Route",path: "/transport/assign-stoppage",  icon: "MapPinned",   lazy: lazy("transport/AssignStoppageToRoutePage"),  roles: ADMIN_ONLY },
      { key: "transport-assign",    label: "Assign Student To Route", path: "/transport/assign-student",   icon: "UsersRound",  lazy: lazy("transport/AssignStudentToRoutePage"),   roles: ADMIN_ONLY },
      { key: "transport-report",    label: "Student Transport Report",path: "/transport/student-report",   icon: "ClipboardList",lazy: lazy("transport/StudentTransportReportPage"),roles: ALL_STAFF },
    ],
  },

  // ── Hostel ────────────────────────────────────────────────────────────────
  {
    key: "hostel",
    hidden: true,
    label: "Hostel",
    path: "/hostel",
    icon: "BedDouble",
    roles: ADMIN_ONLY,
    children: [
      { key: "hostel-rooms",  label: "Rooms",       path: "/hostel/rooms",    icon: "Hotel",     lazy: lazy("hostel/RoomsPage"),    roles: ADMIN_ONLY },
      { key: "hostel-alloc",  label: "Allocation",  path: "/hostel/allocate", icon: "UserPlus",  lazy: lazy("hostel/AllocationPage"),roles: ADMIN_ONLY },
      { key: "hostel-fees",   label: "Hostel Fees", path: "/hostel/fees",     icon: "DollarSign",lazy: lazy("hostel/HostelFeesPage"),roles: ADMIN_ONLY },
    ],
  },

  // ── Alumni ────────────────────────────────────────────────────────────────
  {
    key: "alumni",
    hidden: true,
    label: "Alumni",
    path: "/alumni",
    icon: "GraduationCap",
    roles: ADMIN_ONLY,
    children: [
      { key: "alumni-list", label: "Alumni List",  path: "/alumni/list",  icon: "Users",    lazy: lazy("students/AlumniListPage"), roles: ADMIN_ONLY },
    ],
  },

  // ── Settings ──────────────────────────────────────────────────────────────
  // Hidden from the sidebar (still routable by direct URL).
    {
    key: "settings",
    hidden: true,
    label: "Settings",
    path: "/settings",
    icon: "Settings",
    roles: ADMIN_ONLY,
    children: [
      { key: "settings-general",      label: "Global Settings",       path: "/settings/general",           icon: "Settings",   lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-classes",      label: "Classes & Sections",    path: "/settings/classes",           icon: "School",     lazy: () => import("../pages/settings/ManageClassesPage"),               roles: ADMIN_ONLY },
      { key: "settings-sessions",     label: "Sessions",              path: "/settings/sessions",          icon: "CalendarRange", lazy: () => import("../pages/settings/ManageSessionsPage"),           roles: ADMIN_ONLY },
      { key: "settings-school",       label: "School Settings",       path: "/settings/school",            icon: "School",     lazy: lazy("settings/SchoolInfoPage"),                                   roles: ADMIN_ONLY, hidden: true },
      { key: "settings-roles",        label: "Role Permission",       path: "/settings/roles",             icon: "Shield",     lazy: lazy("settings/RolesPage"),                                        roles: [ROLES.SUPER_ADMIN], hidden: true },
      { key: "settings-translations", label: "Translations",          path: "/settings/translations",      icon: "Globe",      lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-cron",         label: "Cron Job",              path: "/settings/cron",              icon: "Clock",      lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-bell",         label: "Bell Timing",           path: "/settings/bell",              icon: "Bell",       lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-bell-assign",  label: "Bell Assign By D...",   path: "/settings/bell-assign",       icon: "Bell",       lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-sys-student",  label: "System Student ...",    path: "/settings/system-student",    icon: "User",       lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-custom-field", label: "Custom Field",          path: "/settings/custom-field",      icon: "Sliders",    lazy: () => import("../pages/settings/CustomFieldPage"),                 roles: ADMIN_ONLY, hidden: true },
      { key: "settings-db-backup",    label: "Database Backup",       path: "/settings/database-backup",   icon: "Database",   lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-branch-mig",   label: "Branch Migration",      path: "/settings/branch-migration",  icon: "GitBranch",  lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-mobile-dl",    label: "Mobile App Dow...",     path: "/settings/mobile-app-dl",     icon: "Smartphone", lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-sys-update",   label: "System Update",         path: "/settings/system-update",     icon: "RefreshCw",  lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
      { key: "settings-login-log",    label: "User Login Log",        path: "/settings/login-log",         icon: "FileText",   lazy: lazy("settings/GeneralSettingsPage"),                              roles: ADMIN_ONLY, hidden: true },
    ],
  },

  // ── Account ───────────────────────────────────────────────────────────────
  {
    key: "account",
    label: "Account",
    path: "/account",
    icon: "UserCog",
    roles: ALL_ROLES,
    children: [
      { key: "account-profile", label: "My Profile",      path: "/account/profile",  icon: "User",   lazy: lazy("auth/ProfilePage"),       roles: ALL_ROLES },
      { key: "account-pass",    label: "Change Password", path: "/account/password", icon: "Lock",   lazy: lazy("auth/ChangePasswordPage"),roles: ALL_ROLES },
    ],
  },
];

/**
 * The privileges a Designation can actually grant — the DISTINCT set of
 * privilege labels (values of MODULE_PRIVILEGE) that gate a section actually
 * VISIBLE in the sidebar, in first-seen order.
 *
 * Derived from routeConfig rather than straight from MODULE_PRIVILEGE so that
 * hiding a section removes its privilege from the Designation checklist
 * automatically — no dummy options for modules nobody can see — while the
 * section keeps its MODULE_PRIVILEGE entry, so `canAccessSection` still guards
 * its routes in RoleRoute. Defined after routeConfig because it reads it.
 */
export const DESIGNATION_PRIVILEGES = [
  ...new Set(
    routeConfig
      .filter((section) => !section.hidden && MODULE_PRIVILEGE[section.key])
      .map((section) => MODULE_PRIVILEGE[section.key])
  ),
];

// ─── Auth routes (outside dashboard layout) ───────────────────────────────
export const authRoutes = [
  { path: "/login",          lazy: lazy("auth/LoginPage"),          public: true },
  { path: "/forgot-password",lazy: lazy("auth/ForgotPasswordPage"), public: true },
  { path: "/reset-password", lazy: lazy("auth/ResetPasswordPage"),  public: true },
];

// ─── Helper: flatten all routes to a single array ─────────────────────────
export function flattenRoutes(config = routeConfig) {
  return config.reduce((acc, item) => {
    if (item.lazy) acc.push(item);
    if (item.children) acc.push(...flattenRoutes(item.children));
    return acc;
  }, []);
}

// ─── Additional routes for new CRUD pages ─────────────────────────────────
export const additionalRoutes = [
  // Student Accounting
  { key:"fees-group",      path:"/fees/group",          lazy:()=>import("../pages/student-accounting/FeesGroupPage") },
  { key:"fees-allocation", path:"/fees/allocation",     lazy:()=>import("../pages/student-accounting/FeesAllocationPage") },
  { key:"fees-pay",        path:"/fees/pay-invoice",    lazy:()=>import("../pages/student-accounting/FeesPayInvoicePage") },
  { key:"fees-prev-dues",  path:"/fees/previous-dues",  lazy:()=>import("../pages/student-accounting/PreviousDuesPage") },
  { key:"fees-reminder",   path:"/fees/reminder",       lazy:()=>import("../pages/student-accounting/FeesReminderPage") },
  // Office Accounting
  { key:"acct-account",    path:"/accounting/account",      lazy:()=>import("../pages/office-accounting/AccountPage") },
  { key:"acct-deposit",    path:"/accounting/deposit",      lazy:()=>import("../pages/office-accounting/NewDepositPage") },
  { key:"acct-expense",    path:"/accounting/expense-new",  lazy:()=>import("../pages/office-accounting/NewExpensePage") },
  { key:"acct-txn",        path:"/accounting/transactions", lazy:()=>import("../pages/office-accounting/AllTransactionsPage") },
  { key:"acct-voucher",    path:"/accounting/voucher-head", lazy:()=>import("../pages/office-accounting/VoucherHeadPage") },
];

// ─── New routes: Reception sub-pages, Card Management ─────────────────────
export const newRoutes = [
  // Reception
  { key:"reception-visitor-log", path:"/reception/visitor-log",     lazy:()=>import("../pages/reception/VisitorLogPage") },
  { key:"reception-complaint",   path:"/reception/complaint",        lazy:()=>import("../pages/reception/ComplaintPage") },
  { key:"reception-config",      path:"/reception/config",           lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  { key:"reception-config-ref",  path:"/reception/config/reference", lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  { key:"reception-config-res",  path:"/reception/config/response",  lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  { key:"reception-config-call", path:"/reception/config/calling-purpose",  lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  { key:"reception-config-visit",path:"/reception/config/visiting-purpose", lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  { key:"reception-config-comp", path:"/reception/config/complaint-type",   lazy:()=>import("../pages/reception/ConfigReceptionPage") },
  // Card Management
  { key:"cards-id-template",     path:"/cards/id-template",          lazy:()=>import("../pages/card-management/IdCardTemplatePage") },
  { key:"cards-admit-template",  path:"/cards/admit-template",       lazy:()=>import("../pages/card-management/AdmitCardTemplatePage") },
  { key:"cards-admit-generate",  path:"/cards/admit-generate",       lazy:()=>import("../pages/card-management/GenerateAdmitCardPage") },
];

// ─── New routes: Academic, Bulk SMS, Alumni, Library (from 20 images) ────────
export const moreRoutes = [
  // Academic → Classes (Assign Class Teacher)
  { key:"academic-assign-teacher", path:"/academic/assign-teacher", lazy:()=>import("../pages/teachers/ClassesPage") },
  // Academic → Subject → Class Assign
  { key:"academic-class-assign",   path:"/academic/class-assign",   lazy:()=>import("../pages/teachers/ClassesPage") },
  // Academic → Class Schedule
  { key:"academic-class-schedule", path:"/academic/class-schedule", lazy:()=>import("../pages/teachers/TimetablePage") },
  // Academic → Teacher Schedule
  { key:"academic-teacher-sched",  path:"/academic/teacher-schedule",lazy:()=>import("../pages/teachers/TimetablePage") },
  // Bulk SMS — SMS/Email Reports
  { key:"comm-reports",            path:"/communication/reports",    lazy:()=>import("../pages/communication/SendEmailPage") },
  // Bulk SMS — SMS Template
  { key:"comm-sms-tmpl",           path:"/communication/sms-template",lazy:()=>import("../pages/communication/TemplatesPage") },
  // Bulk SMS — Email Template
  { key:"comm-email-tmpl",         path:"/communication/email-template",lazy:()=>import("../pages/communication/TemplatesPage") },
  // Bulk SMS — Student Birthday
  { key:"comm-student-birthday",   path:"/communication/student-birthday",lazy:()=>import("../pages/communication/AddEventPage") },
  // Bulk SMS — Staff Birthday
  { key:"comm-staff-birthday",     path:"/communication/staff-birthday",  lazy:()=>import("../pages/birthday/StaffBirthdayPage") },
  // Alumni — Events with calendar
  { key:"alumni-events",           path:"/alumni/events",            lazy:()=>import("../pages/students/AlumniListPage") },
  // Library — Book Category
  { key:"lib-category",            path:"/library/category",         lazy:()=>import("../pages/library/IssuePage") },
  // Library — My Issued Book
  { key:"lib-my-issued",           path:"/library/my-issued",        lazy:()=>import("../pages/library/ReturnPage") },
  // Library — Book Issue/Return
  { key:"lib-issue-return",        path:"/library/issue-return",     lazy:()=>import("../pages/library/ReturnPage") },
];

// ─── New routes: Settings pages (Images 1-20) ──────────────────────────────────
export const settingsRoutes = [
  // Custom Field (Image 1)
  { key:"custom-field",         path:"/settings/custom-field",          lazy:()=>import("../pages/settings/CustomFieldPage") },
  // Global Settings sub-tabs (Images 2-6)
  { key:"settings-theme",       path:"/settings/general/theme",         lazy:()=>import("../pages/settings/GeneralSettingsPage") },
  { key:"settings-logo",        path:"/settings/general/logo",          lazy:()=>import("../pages/settings/GeneralSettingsPage") },
  { key:"settings-upload",      path:"/settings/general/upload",        lazy:()=>import("../pages/settings/GeneralSettingsPage") },
  // School Settings sub-pages (Images 7-20)
  { key:"school-student-panel", path:"/settings/school/student-panel",  lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-mobile-app",    path:"/settings/school/mobile-app",     lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-app-slider",    path:"/settings/school/app-slider",     lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-live-class",    path:"/settings/school/live-class",     lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-payment",       path:"/settings/school/payment",        lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-sms",           path:"/settings/school/sms",            lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-email",         path:"/settings/school/email",          lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-accounting",    path:"/settings/school/accounting",     lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-wa-chat",       path:"/settings/school/whatsapp-chat",  lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-wa-notif",      path:"/settings/school/whatsapp-notif", lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-wa-gateway",    path:"/settings/school/whatsapp-gateway",lazy:()=>import("../pages/settings/SchoolInfoPage") },
  { key:"school-attendance",    path:"/settings/school/attendance-type",lazy:()=>import("../pages/settings/SchoolInfoPage") },
];

// Settings already updated above
