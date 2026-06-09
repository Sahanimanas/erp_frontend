/**
 * Employee → Employee ID Print
 * Choose a template + orientation, then print staff ID cards from real data.
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Avatar, EmptyState, Skeleton } from "../../components/ui";
import { CreditCard as IdCard, Printer } from "lucide-react";
import apiClient from "../../services/axios";

const TEMPLATES = [
  { id: 1, name: "Indian Red", bar: "from-red-600 to-rose-600", accent: "text-red-600" },
  { id: 2, name: "Royal Blue", bar: "from-blue-600 to-indigo-600", accent: "text-blue-600" },
  { id: 3, name: "Emerald", bar: "from-emerald-600 to-teal-600", accent: "text-emerald-600" },
  { id: 4, name: "Amber", bar: "from-amber-500 to-orange-600", accent: "text-amber-600" },
  { id: 5, name: "Violet", bar: "from-violet-600 to-fuchsia-600", accent: "text-violet-600" },
  { id: 6, name: "Slate", bar: "from-slate-700 to-slate-900", accent: "text-slate-700" },
];

export default function EmployeeIdPrintPage() {
  usePageTitle("Employee ID Print");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState("vertical");
  const [template, setTemplate] = useState(1);
  const [deptId, setDeptId] = useState("");
  const [departments, setDepartments] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emp, dep] = await Promise.all([
        apiClient.get("/employees?limit=500"),
        apiClient.get("/employees/departments"),
      ]);
      if (emp.data.success) setEmployees(emp.data.data || []);
      if (dep.data.success) setDepartments(dep.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];
  const rows = deptId ? employees.filter((e) => e.departmentId === deptId) : employees;

  return (
    <div className="space-y-4">
      <style>{`@media print { .no-print { display:none !important; } body { background:#fff; } }`}</style>
      <div className="no-print">
        <PageHeader title="Employee Id Print" subtitle="Generate printable staff ID cards" icon={<IdCard size={18} />}>
          <Button icon={<Printer size={14} />} disabled={!rows.length} onClick={() => window.print()}>Print</Button>
        </PageHeader>
        <Card title="Template Type">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Department" value={deptId} onChange={(e) => setDeptId(e.target.value)}
                options={[{ value: "", label: "All Employees" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
              <Select label="Orientation" value={orientation} onChange={(e) => setOrientation(e.target.value)}
                options={[{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }]} />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`rounded-xl border-2 p-2 transition-all ${template === t.id ? "border-indigo-500" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`h-8 rounded-md bg-gradient-to-r ${t.bar} mb-1`} />
                  <p className="text-[10px] font-semibold text-slate-600">Template {t.id}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon="🪪" title="No employees" description="Add employees to print ID cards." />
      ) : (
        <div className={`grid gap-3 ${orientation === "vertical" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
          {rows.map((e) => <EmpCard key={e.id} emp={e} tpl={tpl} horizontal={orientation === "horizontal"} />)}
        </div>
      )}
    </div>
  );
}

function EmpCard({ emp, tpl, horizontal }) {
  const name = emp.user ? `${emp.user.firstName} ${emp.user.lastName}` : (emp.employeeCode || "—");
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${horizontal ? "flex" : ""}`}>
      <div className={`bg-gradient-to-r ${tpl.bar} text-white px-3 py-2 ${horizontal ? "flex flex-col justify-center items-center w-1/3" : "text-center"}`}>
        <p className="text-[11px] font-bold leading-tight">GlobalSchoolMitra School</p>
        <p className="text-[8px] opacity-80">STAFF IDENTITY CARD</p>
      </div>
      <div className={`p-3 ${horizontal ? "flex-1" : ""}`}>
        <div className={`flex ${horizontal ? "items-center gap-3" : "flex-col items-center"} gap-2`}>
          <Avatar name={name} src={emp.photo} size="lg" />
          <div className={horizontal ? "" : "text-center"}>
            <p className="text-[13px] font-bold text-slate-800">{name}</p>
            <p className={`text-[10px] font-semibold ${tpl.accent}`}>{emp.designation?.name || emp.user?.role || "Staff"}</p>
          </div>
        </div>
        <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
          <Row label="Code" value={emp.employeeCode || "—"} />
          <Row label="Dept" value={emp.department?.name || "—"} />
          <Row label="Phone" value={emp.user?.phone || "—"} />
        </div>
      </div>
    </div>
  );
}
function Row({ label, value }) {
  return <div className="flex justify-between gap-2"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-700">{value}</span></div>;
}
