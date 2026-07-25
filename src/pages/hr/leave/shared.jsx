/**
 * Shared building blocks for the five Employee Leave pages.
 *
 * Not a route — it lives under /pages so it chunk-splits with the leave pages
 * that import it.
 */
import { Badge, Avatar, DataTable, Button } from "../../../components/ui";

export const VALIDITY_OPTIONS = [
  { value: "MONTHLY", label: "Monthly" },
  { value: "YEARLY", label: "Yearly" },
  { value: "SESSION", label: "Session" },
  { value: "ON_OCCASION", label: "On Occassion" },
];
export const validityLabel = (v) => VALIDITY_OPTIONS.find((o) => o.value === v)?.label || v || "—";

export const STATUS_VARIANT = { PENDING: "warning", APPROVED: "success", REJECTED: "danger", CANCELLED: "default" };
export const STATUS_LABEL = { PENDING: "To Approve", APPROVED: "Approved", REJECTED: "Rejected", CANCELLED: "Cancelled" };

export const fmtDate = (v) =>
  v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (v) =>
  v
    ? `${new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} ${new Date(v).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    : "N/A";

export const empName = (e) =>
  (e?.user ? `${e.user.firstName || ""} ${e.user.lastName || ""}`.trim() : "") || e?.employeeCode || "—";

export const empOptions = (employees, placeholder = "Select...") => [
  { value: "", label: placeholder },
  ...employees.map((e) => ({ value: e.id, label: `${empName(e)}${e.employeeCode ? ` (${e.employeeCode})` : ""}` })),
];

/** Inclusive day span between two "YYYY-MM-DD" strings; 0 when invalid. */
export const dayCount = (from, to) => {
  if (!from || !to) return 0;
  const a = new Date(from), b = new Date(to);
  if (isNaN(a) || isNaN(b) || b < a) return 0;
  return Math.ceil((b - a) / 86400000) + 1;
};

// ─── Form controls the shared UI kit doesn't provide ────────────────────────

export function RadioGroup({ label, name, value, options, onChange }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-[11px] font-semibold text-slate-600">{label}</label>}
      <div className="flex flex-wrap items-center gap-4 pt-1.5">
        {options.map((o) => (
          <label key={o.value} className="inline-flex items-center gap-1.5 cursor-pointer">
            <input
              type="radio"
              name={name}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
            />
            <span className="text-[12.5px] text-slate-700">{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function Checkbox({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer pt-6">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
      />
      <span className="text-[12.5px] font-medium text-slate-700">{label}</span>
    </label>
  );
}

// ─── Employee identity card (Leave Assign / Add Leave) ──────────────────────

export function EmployeeInfoCard({ employee }) {
  if (!employee) return null;
  const rows = [
    ["Name", empName(employee)],
    ["Phone", employee.user?.phone || "N/A"],
    ["Email", employee.user?.email || "N/A"],
    ["Code", employee.employeeCode || "N/A"],
    ["Designation", employee.designation?.name || "N/A"],
    ["Department", employee.department?.name || "N/A"],
  ];
  return (
    <div className="p-5 flex flex-col sm:flex-row gap-6">
      <div className="shrink-0">
        {employee.photo ? (
          <img src={employee.photo} alt={empName(employee)}
            className="w-40 h-44 object-cover rounded-lg border border-slate-200 bg-white" />
        ) : (
          <div className="w-40 h-44 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center">
            <Avatar name={empName(employee)} size="lg" />
          </div>
        )}
      </div>
      <dl className="grid grid-cols-1 gap-y-2 content-start">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2 text-[13px]">
            <dt className="text-slate-500 w-28 shrink-0">{k} :</dt>
            <dd className="font-semibold text-slate-800 break-all">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Leave Assigned Details (entitlement vs applied) ────────────────────────

export function LeaveAssignedDetails({ rows, loading }) {
  const columns = [
    { key: "name", label: "Leave Name", render: (v) => <span className="font-semibold text-slate-700">{v}</span> },
    { key: "validity", label: "Leave Validity", render: (v) => validityLabel(v) },
    { key: "paid", label: "Type", render: (v) => <Badge variant={v ? "success" : "warning"}>{v ? "Paid" : "Unpaid"}</Badge> },
    { key: "assigned", label: "Assigned Leave", render: (v, r) => v ?? r.count ?? 0 },
    {
      key: "totalApplied", label: "Total Applied (Except Holidays)",
      render: (v) => <span className={v > 0 ? "font-semibold text-indigo-600" : "text-slate-500"}>{v ?? 0}</span>,
    },
    {
      key: "remaining", label: "Remaining",
      render: (v) => (v === null || v === undefined
        ? <span className="text-slate-400">No cap</span>
        : <span className={`font-semibold ${v === 0 ? "text-red-500" : "text-emerald-600"}`}>{v}</span>),
    },
  ];
  return <DataTable columns={columns} data={rows} loading={loading} emptyText="No leave types configured yet." />;
}

// ─── Leave transactions table (shared by Add Leave / Approve Leave) ─────────

/**
 * @param showEmployee  prepend an Employee Name column (Approve Leave view)
 * @param onAction      (leave, "approve" | "cancel") — omit for read-only tables
 */
export function LeaveTransactions({ rows, loading, showEmployee = false, onAction, busyId, emptyText = "No leave transactions." }) {
  const columns = [
    ...(showEmployee
      ? [{
          key: "employee", label: "Employee Name",
          sortValue: (l) => empName(l.employee),
          render: (_v, l) => (
            <div>
              <p className="font-semibold text-slate-800">{empName(l.employee)}</p>
              <p className="text-[11px] text-slate-400">{l.employee?.employeeCode || "—"}</p>
            </div>
          ),
        }]
      : []),
    { key: "leaveType", label: "Leave Name", sortValue: (l) => l.leaveType?.name || "", render: (_v, l) => l.leaveType?.name || "—" },
    { key: "validity", label: "Leave Validity", sortValue: (l) => l.leaveType?.validity || "", render: (_v, l) => validityLabel(l.leaveType?.validity) },
    { key: "paid", label: "Type", sortValue: (l) => (l.leaveType?.paid ? 1 : 0), render: (_v, l) => (l.leaveType?.paid ? "Paid" : "Unpaid") },
    { key: "createdAt", label: "Create Date", render: (v) => fmtDateTime(v) },
    { key: "startDate", label: "From Date", render: (v) => fmtDate(v) },
    { key: "endDate", label: "To Date", render: (v) => fmtDate(v) },
    { key: "days", label: "Total Days" },
    { key: "actualDays", label: "Actual (Exclude Holidays)", render: (v, l) => v ?? l.days ?? 0 },
    {
      key: "status", label: "Status",
      render: (v) => <Badge variant={STATUS_VARIANT[v] || "default"}>{STATUS_LABEL[v] || v}</Badge>,
    },
    { key: "actionDate", label: "Action Date", render: (v) => fmtDateTime(v) },
    ...(onAction
      ? [{
          key: "actions", label: "Action", sortable: false,
          render: (_v, l) => (l.status === "PENDING" ? (
            <div className="flex gap-1.5">
              <Button size="xs" variant="danger" loading={busyId === l.id} onClick={() => onAction(l, "cancel")}>Cancel</Button>
              <Button size="xs" loading={busyId === l.id} onClick={() => onAction(l, "approve")}>Approve</Button>
            </div>
          ) : <span className="text-slate-300">—</span>),
        }]
      : []),
  ];

  return <DataTable columns={columns} data={rows} loading={loading} emptyText={emptyText} />;
}

export const leaveExportColumns = (withEmployee = false) => [
  ...(withEmployee ? [{ label: "Employee Name", get: (l) => empName(l.employee) }] : []),
  { label: "Leave Name", get: (l) => l.leaveType?.name || "" },
  { label: "Leave Validity", get: (l) => validityLabel(l.leaveType?.validity) },
  { label: "Type", get: (l) => (l.leaveType?.paid ? "Paid" : "Unpaid") },
  { label: "Create Date", get: (l) => fmtDateTime(l.createdAt) },
  { label: "From Date", get: (l) => fmtDate(l.startDate) },
  { label: "To Date", get: (l) => fmtDate(l.endDate) },
  { label: "Total Days", get: (l) => l.days },
  { label: "Actual (Exclude Holidays)", get: (l) => l.actualDays ?? l.days ?? 0 },
  { label: "Status", get: (l) => STATUS_LABEL[l.status] || l.status },
  { label: "Action Date", get: (l) => fmtDateTime(l.actionDate) },
  { label: "Remarks", get: (l) => l.remarks || "" },
];
