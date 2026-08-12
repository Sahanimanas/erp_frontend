/**
 * Employee → Salary Structure  (wired to /payroll/department-salaries)
 *
 * Department-wise monthly salary. Every employee in a department inherits its
 * basic pay unless they have their own base salary on the employee record.
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Wallet, Save, Trash2, Pencil, Building2 } from "lucide-react";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge, SummaryCards, ExportButton } from "../../../components/ui";
import apiClient from "../../../services/axios";
import { money } from "./_salaryShared";

const EMPTY = { departmentId: "", basicSalary: "", allowances: "", deductions: "", remarks: "" };

export default function SalaryStructurePage() {
  usePageTitle("Salary Structure");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/payroll/department-salaries");
      if (res.data.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load salary structure");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const reset = () => { setForm(EMPTY); setEditing(false); };

  // Live preview of what the department's employees will earn per month.
  const preview = useMemo(() => {
    const net = Number(form.basicSalary || 0) + Number(form.allowances || 0) - Number(form.deductions || 0);
    return Math.max(0, net);
  }, [form.basicSalary, form.allowances, form.deductions]);

  const submit = async () => {
    if (!form.departmentId) { toast.error("Select a department"); return; }
    if (form.basicSalary === "" || Number(form.basicSalary) <= 0) { toast.error("Enter a basic salary"); return; }
    setSaving(true);
    try {
      await apiClient.post("/payroll/department-salaries", {
        departmentId: form.departmentId,
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0),
        remarks: form.remarks,
      });
      toast.success("Department salary saved");
      reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const edit = (r) => {
    setEditing(true);
    setForm({
      departmentId: r.departmentId,
      basicSalary: String(r.basicSalary || ""),
      allowances: String(r.allowances || ""),
      deductions: String(r.deductions || ""),
      remarks: r.remarks || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (r) => {
    if (!window.confirm(`Remove the salary structure for ${r.departmentName}? Its employees will fall back to "not set".`)) return;
    try {
      await apiClient.delete(`/payroll/department-salaries/${r.departmentId}`);
      toast.success("Removed");
      if (form.departmentId === r.departmentId) reset();
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to remove");
    }
  };

  const departmentOptions = [
    { value: "", label: "Select department" },
    ...rows.map((r) => ({ value: r.departmentId, label: r.departmentName })),
  ];

  const columns = [
    { key: "departmentName", label: "Department", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "employeeCount", label: "Employees", render: (v) => <Badge variant="indigo">{v}</Badge> },
    { key: "basicSalary", label: "Basic", render: (v, r) => (r.configured ? money(v) : "—") },
    { key: "allowances", label: "Allowances", render: (v, r) => (r.configured ? money(v) : "—") },
    { key: "deductions", label: "Deductions", render: (v, r) => (r.configured ? money(v) : "—") },
    {
      key: "monthlySalary", label: "Monthly Salary",
      render: (v, r) => (r.configured
        ? <span className="font-semibold text-emerald-600">{money(v)}</span>
        : <Badge variant="warning">Not set</Badge>),
    },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, r) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => edit(r)} title="Edit" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={13} /></button>
          {r.configured && (
            <button onClick={() => remove(r)} title="Remove" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
          )}
        </div>
      ),
    },
  ];

  const exportColumns = [
    { label: "Department", get: (r) => r.departmentName },
    { label: "Employees", get: (r) => r.employeeCount },
    { label: "Basic", get: (r) => (r.configured ? r.basicSalary : "") },
    { label: "Allowances", get: (r) => (r.configured ? r.allowances : "") },
    { label: "Deductions", get: (r) => (r.configured ? r.deductions : "") },
    { label: "Monthly Salary", get: (r) => (r.configured ? r.monthlySalary : "") },
  ];

  const configured = rows.filter((r) => r.configured);
  const cards = [
    { label: "Departments", value: rows.length },
    { label: "Salary Configured", value: configured.length },
    { label: "Not Set", value: rows.length - configured.length },
    {
      label: "Monthly Cost (by structure)",
      value: money(configured.reduce((s, r) => s + r.monthlySalary * r.employeeCount, 0)),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Salary Structure"
        subtitle="Set the monthly salary for each department"
        icon={<Wallet size={18} />}
      />

      <SummaryCards cards={cards} />

      <Card title={editing ? "Edit Department Salary" : "Set Department Salary"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select label="Department *" value={form.departmentId} onChange={set("departmentId")} options={departmentOptions} />
          <Input label="Basic Salary *" type="number" min="0" value={form.basicSalary} onChange={set("basicSalary")} placeholder="25000" />
          <Input label="Allowances" type="number" min="0" value={form.allowances} onChange={set("allowances")} placeholder="0" />
          <Input label="Deductions" type="number" min="0" value={form.deductions} onChange={set("deductions")} placeholder="0" />
          <div className="md:col-span-2 lg:col-span-3">
            <Input label="Remarks" value={form.remarks} onChange={set("remarks")} placeholder="Optional note" />
          </div>
          <div className="flex items-end">
            <div className="w-full rounded-lg bg-emerald-50 px-3 py-2">
              <p className="text-[11px] font-semibold text-emerald-700">Monthly Salary</p>
              <p className="text-[16px] font-bold text-emerald-700">{money(preview)}</p>
            </div>
          </div>
        </div>
        <div className="px-5 pb-4 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-[11px] text-slate-400">
            Basic + Allowances − Deductions. An employee with their own base salary keeps it; the rest of the department uses this.
          </p>
          <div className="flex gap-2">
            {editing && <Button variant="secondary" onClick={reset}>Cancel</Button>}
            <Button icon={<Save size={14} />} loading={saving} onClick={submit}>{editing ? "Update" : "Save"}</Button>
          </div>
        </div>
      </Card>

      <Card
        noPadding
        title="Department Salaries"
        action={<ExportButton filename="department-salaries.csv" rows={rows} columns={exportColumns} />}
      >
        <DataTable
          columns={columns}
          data={rows}
          loading={loading}
          emptyText="No departments yet — add one under Employee → Department."
        />
        {!loading && rows.length === 0 && (
          <div className="px-5 py-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
            <Building2 size={13} /> Departments are managed at Employee → Department.
          </div>
        )}
      </Card>
    </div>
  );
}
