/**
 * _feeShared.jsx — shared Fee Management UI (the Fee Type manager used by both
 * the Class Fee Type and Transport Fee Type screens).
 */
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Card, DataTable, Button, Modal, Input, Select, Badge, PageHeader,
} from "../../components/ui";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  useGetFeeTypesQuery, useCreateFeeTypeMutation, useUpdateFeeTypeMutation,
  useDeleteFeeTypeMutation, useGetIncomeHeadsQuery,
} from "../../redux/api/feeMgmtApi";

export const FREQUENCIES = ["Monthly", "Session", "One-time"];

// 12 academic months Jun→May for the current cycle (matches the reference UI).
export function academicMonths() {
  const now = new Date();
  const startYear = now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const out = [];
  for (let i = 5; i < 17; i++) {
    const m = i % 12;
    const y = startYear + (i >= 12 ? 1 : 0);
    out.push(`${names[m]}-${y}`);
  }
  return out;
}

const fmtDate = (v) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const BLANK = { name: "", frequency: "Monthly", incomeHead: "", months: [], enabled: true };

export function FeeTypeManager({ title, subtitle, icon, isTransport }) {
  const { data: rows = [], isFetching } = useGetFeeTypesQuery(isTransport);
  const { data: incomeHeads = [] } = useGetIncomeHeadsQuery();
  const [createFeeType, { isLoading: creating }] = useCreateFeeTypeMutation();
  const [updateFeeType, { isLoading: updating }] = useUpdateFeeTypeMutation();
  const [deleteFeeType] = useDeleteFeeTypeMutation();

  const [editing, setEditing] = useState(null); // "new" | id | null
  const [form, setForm] = useState(BLANK);
  const months = academicMonths();

  const openNew = () => { setForm({ ...BLANK }); setEditing("new"); };
  const openEdit = (r) => {
    setForm({ name: r.name, frequency: r.frequency, incomeHead: r.incomeHead || "", months: r.months || [], enabled: r.enabled });
    setEditing(r.id);
  };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleMonth = (m) => setForm((f) => ({ ...f, months: f.months.includes(m) ? f.months.filter((x) => x !== m) : [...f.months, m] }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const body = { ...form, isTransport: !!isTransport, months: form.frequency === "Monthly" ? form.months : [] };
    try {
      if (editing === "new") await createFeeType(body).unwrap();
      else await updateFeeType({ id: editing, ...body }).unwrap();
      toast.success("Saved");
      setEditing(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  const remove = async (r) => {
    try { await deleteFeeType(r.id).unwrap(); toast.success("Deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "createdAt", label: "Create Date", render: (v) => fmtDate(v) },
    { key: "frequency", label: "Frequency", render: (v) => <Badge variant="info">{v}</Badge> },
    { key: "months", label: "Month / Year", sortable: false, render: (v, r) => r.frequency === "Monthly" ? (v?.join(", ") || "—") : (r.frequency === "Session" ? "N/A" : "Only Once") },
    { key: "incomeHead", label: "Income Head", render: (v) => v || "—" },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "success" : "default"}>{v ? "Yes" : "No"}</Badge> },
    { key: "actions", label: "Edit", sortable: false, render: (_v, r) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={13} /></button>
          <button onClick={() => remove(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title={title} subtitle={subtitle} icon={icon}>
        <Button icon={<Plus size={15} />} onClick={openNew}>Add New Fee Type</Button>
      </PageHeader>

      <Card noPadding title={`${isTransport ? "Transport" : "Class"} Fee Type List`}>
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No fee types yet." />
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "Add Fee Type" : "Edit Fee Type"} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name *" value={form.name} onChange={set("name")} placeholder="TUITION FEE" />
            <Select label="Frequency" value={form.frequency} onChange={set("frequency")} options={FREQUENCIES.map((f) => ({ value: f, label: f }))} />
            <Select label="Income Head" value={form.incomeHead} onChange={set("incomeHead")}
              options={[{ value: "", label: "Select…" }, ...incomeHeads.map((h) => ({ value: h, label: h }))]} />
          </div>
          {form.frequency === "Monthly" && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-2">Applicable Months</label>
              <div className="flex flex-wrap gap-1.5">
                {months.map((m) => (
                  <button key={m} type="button" onClick={() => toggleMonth(m)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${form.months.includes(m) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200"}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} className="accent-indigo-600" />
            Enabled
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button loading={creating || updating} onClick={submit}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
