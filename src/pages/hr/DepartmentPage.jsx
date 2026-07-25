/**
 * Employee → Department (wired to /employees/departments)
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Textarea, DataTable, Badge } from "../../components/ui";
import { Building, Save, Trash2, Download, Eye } from "lucide-react";
import apiClient from "../../services/axios";
import { exportRows } from "../../utils/exportExcel";

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function DepartmentPage() {
  usePageTitle("Department");
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", address: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/employees/departments");
      if (res.data.success) setRows(res.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Department name is required"); return; }
    setSaving(true);
    try {
      await apiClient.post("/employees/departments", { name: form.name, description: form.description });
      toast.success("Department added");
      setForm({ name: "", address: "", description: "" });
      load();
    } catch (e) { toast.error(e.response?.data?.error || "Failed to add department"); }
    finally { setSaving(false); }
  };

  const remove = async (r) => {
    try { await apiClient.delete(`/employees/departments/${r.id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.error || "Failed to delete"); }
  };

  // Name and employee-count both drill into the department's detail page, which
  // lists the staff assigned to it.
  const openDetail = (r) => navigate(`/employee/departments/${r.id}`);

  const columns = [
    { key: "name", label: "Name", render: (v, r) => (
        <button onClick={() => openDetail(r)} className="font-semibold text-indigo-600 hover:underline text-left">{v}</button>
      ) },
    { key: "employees", label: "Employees", sortable: false, render: (v, r) => (
        <button onClick={() => openDetail(r)} title="View employees"><Badge variant="info">{v?.length ?? 0}</Badge></button>
      ) },
    { key: "createdAt", label: "Create Date", render: (v) => fmtDate(v) },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => openDetail(r)} title="View details" className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500"><Eye size={13} /></button>
          <button onClick={() => remove(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Department Details" subtitle="Manage staff departments" icon={<Building size={18} />} />
      <Card title="Add Department">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="md:col-span-2" />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button icon={<Save size={14} />} loading={saving} onClick={submit}>Submit</Button>
        </div>
      </Card>
      <Card noPadding title="All Department List"
        action={<Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length}
          onClick={() => exportRows("departments.csv", rows, [{ label: "Name", get: (r) => r.name }, { label: "Employees", get: (r) => r.employees?.length ?? 0 }, { label: "Created", get: (r) => fmtDate(r.createdAt) }])}>Export</Button>}>
        <DataTable columns={columns} data={rows} loading={loading} emptyText="No departments yet." />
      </Card>
    </div>
  );
}
