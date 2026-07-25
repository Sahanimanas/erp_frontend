/**
 * Employee → Department Details (drill-down from the Department list)
 *
 * Shows one department's summary plus the full roster of employees assigned to
 * it. Reached by clicking a department name / employee-count on DepartmentPage.
 * Data comes from GET /employees/departments/:id.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, DataTable, Badge, Avatar } from "../../components/ui";
import { Building, ArrowLeft, Download, Search, Users } from "lucide-react";
import apiClient from "../../services/axios";
import { exportRows } from "../../utils/exportExcel";
import { Loader } from "../../components/loaders/PageLoader";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const nameOf = (e) => `${e.user?.firstName || ""} ${e.user?.lastName || ""}`.trim() || "—";

export default function DepartmentDetailPage() {
  usePageTitle("Department Details");
  const { id } = useParams();
  const navigate = useNavigate();
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.get(`/employees/departments/${id}`);
      if (res.data.success) setDept(res.data.data);
      else setError("Department not found");
    } catch (e) {
      setError(e.response?.data?.error || "Failed to load department");
    } finally {
      setLoading(false);
    }
  }, [id]);
  useEffect(() => { load(); }, [load]);

  const employees = dept?.employees || [];

  // Client-side search across the fields shown in the table.
  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return employees;
    return employees.filter((e) =>
      [nameOf(e), e.employeeCode, e.user?.email, e.user?.phone, e.designation?.name]
        .some((v) => String(v || "").toLowerCase().includes(term)),
    );
  }, [employees, q]);

  const activeCount = employees.filter((e) => e.user?.isActive).length;

  const columns = [
    {
      key: "name",
      label: "Employee",
      sortValue: (r) => nameOf(r),
      render: (_v, r) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={nameOf(r)} src={r.photo} size="sm" />
          <span className="font-semibold text-slate-800">{nameOf(r)}</span>
        </div>
      ),
    },
    { key: "employeeCode", label: "Employee Code", render: (v) => <span className="text-slate-600">{v || "—"}</span> },
    { key: "designation", label: "Designation", sortValue: (r) => r.designation?.name || "", render: (_v, r) => r.designation?.name || "—" },
    { key: "email", label: "Email", sortValue: (r) => r.user?.email || "", render: (_v, r) => <span className="text-slate-600">{r.user?.email || "—"}</span> },
    { key: "phone", label: "Phone", sortValue: (r) => r.user?.phone || "", render: (_v, r) => r.user?.phone || "—" },
    { key: "dateOfJoining", label: "Joining Date", render: (v) => fmtDate(v) },
    {
      key: "status",
      label: "Status",
      sortValue: (r) => (r.user?.isActive ? 1 : 0),
      render: (_v, r) => <Badge variant={r.user?.isActive ? "success" : "danger"}>{r.user?.isActive ? "Active" : "Inactive"}</Badge>,
    },
  ];

  if (loading) return <Loader label="Loading department…" />;

  if (error || !dept) {
    return (
      <div className="space-y-5">
        <PageHeader title="Department Details" subtitle="Staff roster" icon={<Building size={18} />} />
        <Card>
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-red-600">{error || "Department not found"}</p>
            <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate("/employee/departments")}>
              Back to Departments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title={dept.name} subtitle="Department details & employee list" icon={<Building size={18} />}>
        <Button variant="secondary" size="sm" icon={<ArrowLeft size={14} />} onClick={() => navigate("/employee/departments")}>
          Back
        </Button>
      </PageHeader>

      {/* ── Department summary ─────────────────────────────────────────── */}
      <Card>
        <div className="p-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ["Department", dept.name],
            ["Total Employees", employees.length],
            ["Active", activeCount],
            ["Created On", fmtDate(dept.createdAt)],
          ].map(([label, value]) => (
            <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
              <p className="text-sm font-bold text-slate-800 mt-0.5 break-words">{value ?? "—"}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Employee roster ────────────────────────────────────────────── */}
      <Card
        noPadding
        title="Employees in this Department"
        subtitle={`${filtered.length} of ${employees.length} shown`}
        action={
          <>
            <div className="w-56">
              <Input
                icon={<Search size={13} />}
                placeholder="Search name, code, email…"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="py-1.5 text-[12px]"
              />
            </div>
            <Button
              size="sm"
              variant="secondary"
              icon={<Download size={13} />}
              disabled={!filtered.length}
              onClick={() =>
                exportRows(`${dept.name}-employees.csv`, filtered, [
                  { label: "Name", get: (r) => nameOf(r) },
                  { label: "Employee Code", get: (r) => r.employeeCode || "" },
                  { label: "Designation", get: (r) => r.designation?.name || "" },
                  { label: "Email", get: (r) => r.user?.email || "" },
                  { label: "Phone", get: (r) => r.user?.phone || "" },
                  { label: "Joining Date", get: (r) => fmtDate(r.dateOfJoining) },
                  { label: "Status", get: (r) => (r.user?.isActive ? "Active" : "Inactive") },
                ])
              }
            >
              Export
            </Button>
          </>
        }
      >
        <DataTable
          columns={columns}
          data={filtered}
          emptyText={
            employees.length
              ? "No employees match your search."
              : "No employees assigned to this department yet."
          }
        />
      </Card>

      {!employees.length && (
        <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <Users size={12} />
          Assign staff to this department from{" "}
          <Link to="/employee/list" className="text-indigo-600 font-semibold hover:underline">Employee Search</Link>.
        </p>
      )}
    </div>
  );
}
