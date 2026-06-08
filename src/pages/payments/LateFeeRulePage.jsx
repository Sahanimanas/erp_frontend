/**
 * Payments → Class Fee Late Payment Rule (CRUD).
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge } from "../../components/ui";
import { AlarmClock, Save, Trash2, Pencil } from "lucide-react";
import {
  useGetLateFeeRulesQuery, useCreateLateFeeRuleMutation, useUpdateLateFeeRuleMutation, useDeleteLateFeeRuleMutation,
} from "../../redux/api/paymentsApi";
import { useGetFeeTypesQuery } from "../../redux/api/feeMgmtApi";
import { useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const BLANK = { name: "", session: "", applicableFeeType: "", lateFeeType: "Late Fine", lateFeeAmount: "", chargeAfterDueDays: 0, startFromCurrentMonth: true, enabled: true };

export default function LateFeeRulePage() {
  usePageTitle("Late Fee Rule");
  const { data: rules = [], isFetching } = useGetLateFeeRulesQuery();
  const { data: feeTypes = [] } = useGetFeeTypesQuery(undefined);
  const { data: years = [] } = useGetAcademicYearsQuery();
  const [createRule, { isLoading: creating }] = useCreateLateFeeRuleMutation();
  const [updateRule, { isLoading: updating }] = useUpdateLateFeeRuleMutation();
  const [deleteRule] = useDeleteLateFeeRuleMutation();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(BLANK);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Rule name is required"); return; }
    try {
      if (editingId) await updateRule({ id: editingId, ...form }).unwrap();
      else await createRule(form).unwrap();
      toast.success("Saved");
      setForm(BLANK); setEditingId(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };
  const edit = (r) => {
    setEditingId(r.id);
    setForm({ name: r.name, session: r.session || "", applicableFeeType: r.applicableFeeType || "", lateFeeType: r.lateFeeType || "Late Fine", lateFeeAmount: Number(r.lateFeeAmount), chargeAfterDueDays: r.chargeAfterDueDays, startFromCurrentMonth: r.startFromCurrentMonth, enabled: r.enabled });
  };
  const remove = async (r) => {
    try { await deleteRule(r.id).unwrap(); toast.success("Deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const columns = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "session", label: "Session", render: (v) => v || "—" },
    { key: "lateFeeAmount", label: "Late Fee", render: (v) => `₹${Number(v || 0).toLocaleString("en-IN")}` },
    { key: "chargeAfterDueDays", label: "After Due Days" },
    { key: "applicableFeeType", label: "Applicable Fee", render: (v) => v || "—" },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "success" : "default"}>{v ? "Yes" : "No"}</Badge> },
    { key: "actions", label: "", sortable: false, render: (_v, r) => (
        <div className="flex gap-1 justify-end">
          <button onClick={() => edit(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={13} /></button>
          <button onClick={() => remove(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
        </div>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Class Fee Late Payment Rule" subtitle="Charge a fine for fees paid after the due date" icon={<AlarmClock size={18} />} />

      <Card title={editingId ? "Edit Late Payment Rule" : "Add Class Fee Late Payment Rule"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Name *" value={form.name} onChange={set("name")} />
          <Select label="Session" value={form.session} onChange={set("session")}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.name, label: y.name }))]} />
          <Select label="Applicable Fee Type" value={form.applicableFeeType} onChange={set("applicableFeeType")}
            options={[{ value: "", label: "All / Select" }, ...feeTypes.map((t) => ({ value: t.name, label: t.name }))]} />
          <Input label="Late Fee Type" value={form.lateFeeType} onChange={set("lateFeeType")} />
          <Input label="Late Fee Amount *" type="number" value={form.lateFeeAmount} onChange={set("lateFeeAmount")} />
          <Input label="Charge After Due Day" type="number" value={form.chargeAfterDueDays} onChange={set("chargeAfterDueDays")} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.startFromCurrentMonth} onChange={(e) => setForm((f) => ({ ...f, startFromCurrentMonth: e.target.checked }))} className="accent-indigo-600" />
            Start From Current Month Only
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} className="accent-indigo-600" />
            Enabled
          </label>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          {editingId && <Button variant="secondary" onClick={() => { setForm(BLANK); setEditingId(null); }}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={creating || updating} onClick={submit}>{editingId ? "Update Rule" : "Submit"}</Button>
        </div>
      </Card>

      <Card noPadding title="All Class Fee Late Payment Rule List">
        <DataTable columns={columns} data={rules} loading={isFetching} emptyText="No late payment rules yet." />
      </Card>
    </div>
  );
}
