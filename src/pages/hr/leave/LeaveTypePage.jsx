/**
 * Employee Leave → Leave Type
 *
 * Add/Update the leave-type master (name, paid/unpaid, validity period,
 * default leave count, enabled) and list every type defined for the school.
 *   GET/POST /employees/leave-types, PATCH/DELETE /employees/leave-types/:id
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Button, Input, DataTable, Badge, ExportButton } from "../../../components/ui";
import { CalendarCheck, Save, Trash2, Pencil, X } from "lucide-react";
import apiClient from "../../../services/axios";
import { RadioGroup, Checkbox, VALIDITY_OPTIONS, validityLabel, fmtDateTime } from "./shared";

const BLANK = { id: "", name: "", paid: true, validity: "MONTHLY", maxDays: "0", enabled: true };

export default function LeaveTypePage() {
  usePageTitle("Leave Type");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/employees/leave-types");
      if (res.data.success) setRows(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load leave types");
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Leave type name is required"); return; }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      paid: form.paid,
      validity: form.validity,
      maxDays: Number(form.maxDays) || 0,
      enabled: form.enabled,
    };
    try {
      if (form.id) {
        await apiClient.patch(`/employees/leave-types/${form.id}`, payload);
        toast.success("Leave type updated");
      } else {
        await apiClient.post("/employees/leave-types", payload);
        toast.success("Leave type added");
      }
      setForm(BLANK);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to save leave type");
    } finally { setSaving(false); }
  };

  const edit = (r) => {
    setForm({ id: r.id, name: r.name, paid: r.paid, validity: r.validity, maxDays: String(r.maxDays ?? 0), enabled: r.enabled });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete leave type "${r.name}"? Existing applications keep their records.`)) return;
    try {
      await apiClient.delete(`/employees/leave-types/${r.id}`);
      toast.success("Leave type deleted");
      if (form.id === r.id) setForm(BLANK);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to delete leave type");
    }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "createdAt", label: "Create Date", render: (v) => fmtDateTime(v) },
    { key: "validity", label: "Leave Validity", render: (v) => validityLabel(v) },
    { key: "paid", label: "Leave Type", render: (v) => <Badge variant={v ? "success" : "warning"}>{v ? "Paid" : "Unpaid"}</Badge> },
    { key: "maxDays", label: "Default Leave", render: (v) => (v > 0 ? v : <span className="text-slate-400">No cap</span>) },
    { key: "_count", label: "Applied", sortValue: (r) => r._count?.leaves ?? 0, render: (_v, r) => <Badge variant="info">{r._count?.leaves ?? 0}</Badge> },
    { key: "enabled", label: "Enabled", render: (v) => <span className={v ? "text-emerald-600 font-semibold" : "text-slate-400"}>{v ? "Yes" : "No"}</span> },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, r) => (
        <div className="flex items-center gap-1">
          <button onClick={() => edit(r)} title="Edit" className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-500"><Pencil size={13} /></button>
          <button onClick={() => remove(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Employee Leave Type" subtitle="Define the leave types staff can apply for" icon={<CalendarCheck size={18} />} />

      <Card title={form.id ? "Update Leave Type" : "Add/Update Leave Type"}
        action={form.id && <Button size="sm" variant="ghost" icon={<X size={13} />} onClick={() => setForm(BLANK)}>Cancel edit</Button>}>
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          <Input label="Name *" placeholder="Enter Name" value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />

          <RadioGroup label="Leave Validity *" name="validity" value={form.validity}
            options={VALIDITY_OPTIONS} onChange={(v) => setForm((f) => ({ ...f, validity: v }))} />

          <RadioGroup label="Leave Type *" name="paid" value={form.paid ? "paid" : "unpaid"}
            options={[{ value: "paid", label: "Paid" }, { value: "unpaid", label: "Unpaid" }]}
            onChange={(v) => setForm((f) => ({ ...f, paid: v === "paid" }))} />

          <Checkbox label="Enabled" checked={form.enabled} onChange={(v) => setForm((f) => ({ ...f, enabled: v }))} />

          <Input label="Default Leave Count" type="number" min="0" value={form.maxDays}
            onChange={(e) => setForm((f) => ({ ...f, maxDays: e.target.value }))} />
          <p className="text-[11px] text-slate-400 self-end pb-2">0 means the type has no cap.</p>
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button icon={<Save size={14} />} loading={saving} onClick={submit}>{form.id ? "Update" : "Submit"}</Button>
        </div>
      </Card>

      <Card noPadding title="All Leave Type List" subtitle={`${rows.length} leave type(s)`}
        action={<ExportButton filename="leave-types.csv" rows={rows} columns={[
          { label: "Name", get: (r) => r.name },
          { label: "Create Date", get: (r) => fmtDateTime(r.createdAt) },
          { label: "Leave Validity", get: (r) => validityLabel(r.validity) },
          { label: "Leave Type", get: (r) => (r.paid ? "Paid" : "Unpaid") },
          { label: "Default Leave", get: (r) => r.maxDays },
          { label: "Enabled", get: (r) => (r.enabled ? "Yes" : "No") },
        ]} />}>
        <DataTable columns={columns} data={rows} loading={loading} emptyText="No leave types yet." />
      </Card>
    </div>
  );
}
