/**
 * Payments → Class Fee Late Payment Rule (CRUD).
 * Charge a fine when a fee is paid after its due day. "Applicable Fee Type For
 * Late Fine" is a multi-select stored comma-joined in `applicableFeeType`.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable, Badge } from "../../components/ui";
import { AlarmClock, Save, Trash2, Pencil, AlertTriangle } from "lucide-react";
import {
  useGetLateFeeRulesQuery, useCreateLateFeeRuleMutation, useUpdateLateFeeRuleMutation, useDeleteLateFeeRuleMutation,
} from "../../redux/api/paymentsApi";
import { useGetFeeTypesQuery } from "../../redux/api/feeMgmtApi";
import { useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const BLANK = { name: "", session: "", applicable: [], lateFeeType: "", lateFeeAmount: "", chargeAfterDueDays: 0, startFromCurrentMonth: true, enabled: true };

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
  const toggleFee = (name) => setForm((f) => ({ ...f, applicable: f.applicable.includes(name) ? f.applicable.filter((x) => x !== name) : [...f.applicable, name] }));

  const submit = async () => {
    if (!form.name.trim()) { toast.error("Rule name is required"); return; }
    if (!form.applicable.length) { toast.error("Select at least one applicable fee type"); return; }
    const body = {
      name: form.name, session: form.session,
      applicableFeeType: form.applicable.join(","),
      lateFeeType: form.lateFeeType || form.applicable[0],
      lateFeeAmount: Number(form.lateFeeAmount) || 0,
      chargeAfterDueDays: Number(form.chargeAfterDueDays) || 0,
      startFromCurrentMonth: form.startFromCurrentMonth,
      enabled: form.enabled,
    };
    try {
      if (editingId) await updateRule({ id: editingId, ...body }).unwrap();
      else await createRule(body).unwrap();
      toast.success("Saved");
      setForm(BLANK); setEditingId(null);
    } catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };
  const edit = (r) => {
    setEditingId(r.id);
    setForm({
      name: r.name, session: r.session || "",
      applicable: (r.applicableFeeType || "").split(",").map((s) => s.trim()).filter(Boolean),
      lateFeeType: r.lateFeeType || "", lateFeeAmount: Number(r.lateFeeAmount),
      chargeAfterDueDays: r.chargeAfterDueDays, startFromCurrentMonth: r.startFromCurrentMonth, enabled: r.enabled,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = async (r) => {
    if (!window.confirm(`Delete rule "${r.name}"?`)) return;
    try { await deleteRule(r.id).unwrap(); toast.success("Deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };

  const rows = rules.map((r, i) => ({ ...r, ruleNo: i + 1 }));
  const columns = [
    { key: "ruleNo", label: "Rule Id", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "session", label: "Session", render: (v) => v || "—" },
    { key: "lateFeeAmount", label: "Late Fee Amount", render: (v) => money(v) },
    { key: "chargeAfterDueDays", label: "Apply after due in days" },
    { key: "applicableFeeType", label: "Applicable Fee Types", render: (v) => <span className="text-[11px]">{v || "—"}</span> },
    { key: "lateFeeType", label: "Late Fee Type", render: (v) => v || "—" },
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

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
        <AlertTriangle size={16} /> Please enter the Class Fee Late Payment Rule carefully.
      </div>

      <Card title={editingId ? "Edit Late Payment Rule" : "Add Class Fee Late Payment Rule"}>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Name *" value={form.name} onChange={set("name")} placeholder="Enter Name" />
            <Select label="Session *" value={form.session} onChange={set("session")}
              options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.name, label: y.name }))]} />
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Applicable Fee Type For Late Fine *</label>
              <div className="flex flex-wrap gap-1.5">
                {feeTypes.length === 0 && <span className="text-[11px] text-slate-400">No fee types yet</span>}
                {feeTypes.map((t) => (
                  <button key={t.id} type="button" onClick={() => toggleFee(t.name)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${form.applicable.includes(t.name) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Late Fine Fee Type *" value={form.lateFeeType} onChange={set("lateFeeType")}
              options={[{ value: "", label: "Select…" }, ...feeTypes.map((t) => ({ value: t.name, label: t.name }))]} />
            <Input label="Late Fee Amount *" type="number" min="0" value={form.lateFeeAmount} onChange={set("lateFeeAmount")} placeholder="0" />
            <Input label="Late Fee Charge After Below Due Day *" type="number" min="0" value={form.chargeAfterDueDays} onChange={set("chargeAfterDueDays")} placeholder="0" />
          </div>
          <div className="flex flex-wrap gap-8">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.startFromCurrentMonth} onChange={(e) => setForm((f) => ({ ...f, startFromCurrentMonth: e.target.checked }))} className="accent-emerald-600 w-4 h-4" />
              Start From Current Month Only
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} className="accent-emerald-600 w-4 h-4" />
              Enabled
            </label>
          </div>
        </div>
        <div className="px-5 pb-5 flex justify-end gap-2">
          {editingId && <Button variant="secondary" onClick={() => { setForm(BLANK); setEditingId(null); }}>Cancel</Button>}
          <Button icon={<Save size={14} />} loading={creating || updating} onClick={submit}>{editingId ? "Update Rule" : "Submit"}</Button>
        </div>
      </Card>

      <Card noPadding title="All Class Fee Late Payment Rule List">
        <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No late payment rules yet." />
      </Card>
    </div>
  );
}
