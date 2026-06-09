/**
 * Employee → Designation (wired to /employees/designations)
 * Add a designation with a module-privileges checklist, list + delete.
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge, ExportButton } from "../../components/ui";
import { BadgeCheck, Save, Trash2, Pencil } from "lucide-react";
import apiClient from "../../services/axios";

// Privilege modules (mirror the reference "Privileges Details" checklist).
const PRIVILEGES = [
  "Home", "Employee", "Course Management", "Time Table", "Student", "Exam Management",
  "Attendance", "Employee Leave", "Exam & Holiday", "Configuration", "Communication",
  "Exam Result Management", "Fees Management", "Transport Management", "Payment", "Reports",
  "Finance", "Photo Attendance", "Employee Salary", "Admission",
];

export default function DesignationPage() {
  usePageTitle("Designation");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", type: "Others", permissions: [] });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/employees/designations");
      if (res.data.success) setRows(res.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const togglePriv = (p) => setForm((f) => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter((x) => x !== p) : [...f.permissions, p] }));
  const reset = () => { setForm({ name: "", type: "Others", permissions: [] }); setEditingId(null); };

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Designation name is required"); return; }
    // "Admin" grants all privileges.
    const permissions = form.type === "Admin" ? PRIVILEGES : form.permissions;
    setSaving(true);
    try {
      if (editingId) await apiClient.patch(`/employees/designations/${editingId}`, { name: form.name, permissions });
      else await apiClient.post("/employees/designations", { name: form.name, permissions });
      toast.success("Saved");
      reset(); load();
    } catch (e) { toast.error(e.response?.data?.error || "Failed to save"); }
    finally { setSaving(false); }
  };

  const edit = (r) => { setEditingId(r.id); setForm({ name: r.name, type: (r.permissions?.length >= PRIVILEGES.length ? "Admin" : "Others"), permissions: r.permissions || [] }); };
  const remove = async (r) => {
    try { await apiClient.delete(`/employees/designations/${r.id}`); toast.success("Deleted"); load(); }
    catch (e) { toast.error(e.response?.data?.error || "Failed to delete"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "level", label: "Level" },
    { key: "permissions", label: "Privileges", sortable: false, render: (v) => <Badge variant="indigo">{v?.length ?? 0} modules</Badge> },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => edit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={13} /></button>
          <button onClick={() => remove(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ) },
  ];

  const exportColumns = [
    { label: "Name", get: (r) => r.name },
    { label: "Level", get: (r) => r.level },
    { label: "Privileges", get: (r) => (r.permissions || []).join("; ") },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Employee Designation" subtitle="Designations & their access privileges" icon={<BadgeCheck size={18} />} />
      <Card title={editingId ? "Edit Designation" : "Add Designation"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Name *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="PGT Teacher" />
          <Select label="Type" value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={[{ value: "Others", label: "Others (pick privileges)" }, { value: "Admin", label: "Admin (all privileges)" }]} />
        </div>
        {form.type === "Others" && (
          <div className="px-5 pb-2">
            <p className="text-[11px] font-semibold text-slate-600 mb-2">Privileges Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {PRIVILEGES.map((p) => (
                <label key={p} className="flex items-center gap-2 text-[12px] text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePriv(p)} className="accent-indigo-600" />
                  {p}
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="px-5 py-4 flex justify-end gap-2">
          {editingId && <Button variant="secondary" onClick={reset}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={saving} onClick={submit}>{editingId ? "Update" : "Submit"}</Button>
        </div>
      </Card>
      <Card noPadding title="All Designations" action={<ExportButton filename="designations.csv" rows={rows} columns={exportColumns} />}>
        <DataTable columns={columns} data={rows} loading={loading} emptyText="No designations yet." />
      </Card>
    </div>
  );
}
