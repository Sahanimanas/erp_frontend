/**
 * LoginDeactivatePage.jsx
 * Module : hr
 * Page   : Deactivate / Activate employee login access (wired to /employees).
 *   - GET  /employees?role&status&search&limit  → real staff list
 *   - PATCH /employees/:id/deactivate            → disable login
 *   - PATCH /employees/:id/activate              → re-enable login
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, SearchInput, Avatar, Badge } from "../../components/ui";
import apiClient from "../../services/axios";

// Staff roles from the backend UserRole enum (STUDENT/PARENT/SUPER_ADMIN excluded).
const ROLE_OPTIONS = [
  { value: "", label: "All Roles" },
  { value: "SCHOOL_ADMIN", label: "Admin" },
  { value: "PRINCIPAL", label: "Principal" },
  { value: "TEACHER", label: "Teacher" },
  { value: "ACCOUNTANT", label: "Accountant" },
];
const ROLE_LABEL = Object.fromEntries(ROLE_OPTIONS.filter((r) => r.value).map((r) => [r.value, r.label]));
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

export default function LoginDeactivatePage() {
  usePageTitle("Deactivate Account");

  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "500" });
      if (role) params.set("role", role);
      if (status) params.set("status", status);
      if (search.trim()) params.set("search", search.trim());
      const res = await apiClient.get(`/employees?${params}`);
      if (res.data.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [role, status, search]);

  // Initial load + whenever role/status change (search applies via Filter button).
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [role, status]);

  const toggleAccess = async (row) => {
    const isActive = row.user?.isActive;
    const action = isActive ? "deactivate" : "activate";
    if (!window.confirm(`${isActive ? "Deactivate" : "Activate"} login for ${name(row)}?`)) return;
    setBusyId(row.id);
    try {
      await apiClient.patch(`/employees/${row.id}/${action}`);
      toast.success(`Login ${isActive ? "deactivated" : "activated"}`);
      // Optimistically flip the row so the table updates without a full refetch.
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, user: { ...r.user, isActive: !isActive } } : r)));
    } catch (e) {
      toast.error(e.response?.data?.error || `Failed to ${action}`);
    } finally {
      setBusyId(null);
    }
  };

  const name = (e) => (e.user ? `${e.user.firstName || ""} ${e.user.lastName || ""}`.trim() : e.employeeCode) || "—";

  const display = rows.map((e) => ({
    id: e.id,
    name: name(e),
    photo: e.photo,
    designation: e.designation?.name || "—",
    department: e.department?.name || "—",
    email: e.user?.email || "—",
    phone: e.user?.phone || "—",
    role: ROLE_LABEL[e.user?.role] || e.user?.role || "—",
    isActive: e.user?.isActive,
    original: e,
  }));

  const columns = [
    { key: "photo", label: "Photo", sortable: false, render: (v, r) => <Avatar name={r.name} src={v || undefined} size="sm" /> },
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Mobile No" },
    { key: "role", label: "Role" },
    {
      key: "isActive",
      label: "Status",
      render: (v) => <Badge variant={v ? "success" : "danger"}>{v ? "Active" : "Inactive"}</Badge>,
    },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (_, r) => (
        <Button
          size="xs"
          variant={r.isActive ? "danger" : "success"}
          loading={busyId === r.id}
          onClick={() => toggleAccess(r.original)}
        >
          {r.isActive ? "Deactivate" : "Activate"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Deactivate Account" subtitle="Manage employee login access" icon="🔒" />

      {/* Filter */}
      <Card>
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Ground</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)} options={ROLE_OPTIONS} />
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS} />
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or email..." />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={load}>🔍 Filter</Button>
            {(role || status || search) && (
              <Button variant="ghost" onClick={() => { setRole(""); setStatus(""); setSearch(""); }}>Clear</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card title="Employee List">
        <DataTable columns={columns} data={display} loading={loading} emptyText="No employees found." />
        <div className="px-4 py-3 border-t border-slate-100 text-[11px] text-slate-500">
          {loading ? "Loading…" : `Showing ${display.length} ${display.length === 1 ? "employee" : "employees"}`}
        </div>
      </Card>
    </div>
  );
}
