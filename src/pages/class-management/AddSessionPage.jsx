/**
 * Class Management → Add Session
 * Create academic sessions (a.k.a. academic years) — the SAME sessions used by
 * Add Student, Fees, Exams and the Timetable. Only one may be the Active Session.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, DataTable } from "../../components/ui";
import { CalendarDays, Save, Trash2, CheckCircle2 } from "lucide-react";
import {
  useCmGetSessionsQuery, useCmSaveSessionMutation, useCmSetActiveSessionMutation, useCmDeleteSessionMutation,
} from "../../redux/api/classMgmtApi";

const EMPTY = { name: "", sessionCode: "", timetableSession: "", startDate: "", endDate: "", description: "", enabled: true, isActive: false };
const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—");

export default function AddSessionPage() {
  usePageTitle("Add Session");
  const [form, setForm] = useState({ ...EMPTY });
  const { data: sessions = [], isFetching } = useCmGetSessionsQuery();
  const [save, { isLoading: saving }] = useCmSaveSessionMutation();
  const [setActive] = useCmSetActiveSessionMutation();
  const [del] = useCmDeleteSessionMutation();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    if (!form.startDate || !form.endDate) return toast.error("Start and end date are required");
    try { await save(form).unwrap(); toast.success(form.id ? "Session updated" : "Session added"); setForm({ ...EMPTY }); }
    catch (e) { toast.error(e?.data?.error || "Failed to save session"); }
  };
  const remove = async (r) => {
    if (!confirm(`Delete session "${r.name}"?`)) return;
    try { await del(r.id).unwrap(); toast.success("Deleted"); } catch (e) { toast.error(e?.data?.error || "Failed to delete"); }
  };
  const makeActive = async (r) => { try { await setActive(r.id).unwrap(); toast.success(`"${r.name}" is now active`); } catch (e) { toast.error(e?.data?.error || "Failed"); } };

  const COLUMNS = [
    { key: "name", label: "Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "sessionCode", label: "Session Code", render: (v) => v || "N/A" },
    { key: "startDate", label: "Start Date", render: fmt },
    { key: "endDate", label: "End Date", render: fmt },
    { key: "isActive", label: "Active Session", sortable: false, render: (v, r) => v
      ? <span className="inline-flex items-center gap-1 text-emerald-600 text-[12px] font-semibold"><CheckCircle2 size={13} /> Yes</span>
      : <button onClick={() => makeActive(r)} className="text-[11px] text-indigo-500 hover:underline">Set active</button> },
    { key: "enabled", label: "Enabled", render: (v) => (v ? "Yes" : "No") },
    { key: "id", label: "", sortable: false, render: (_v, r) => (
      <div className="flex gap-1">
        <button title="Edit" onClick={() => setForm({ id: r.id, name: r.name, sessionCode: r.sessionCode || "", timetableSession: r.timetableSession || "", startDate: r.startDate?.slice(0, 10) || "", endDate: r.endDate?.slice(0, 10) || "", description: r.description || "", enabled: r.enabled, isActive: r.isActive })}
          className="px-2 py-1 text-[11px] rounded bg-amber-50 text-amber-600">Edit</button>
        <button title="Delete" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Add Session" subtitle="Please enter session details carefully — select only one active session" icon={<CalendarDays size={18} />} />
      <Card title={form.id ? "Edit Session" : "Add Session"}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Name *" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="2026-2027" />
          <Input label="Session Code" value={form.sessionCode} onChange={(e) => set("sessionCode", e.target.value)} placeholder="Enter batch code" />
          <Select label="Timetable Session" value={form.timetableSession} onChange={(e) => set("timetableSession", e.target.value)}
            options={[{ value: "", label: "Select..." }, { value: "DEFAULT", label: "DEFAULT" }, { value: "ONLINE", label: "ONLINE" }]} />
          <Input label="Start Date *" type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
          <Input label="End Date *" type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
          <Input label="Description" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Enter description" />
        </div>
        <div className="px-5 pb-5 flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="w-4 h-4 accent-emerald-600" /> Enabled</label>
          <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none"><input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="w-4 h-4 accent-indigo-600" /> Active Session</label>
          <div className="ml-auto flex gap-2">
            {form.id && <Button variant="secondary" size="sm" onClick={() => setForm({ ...EMPTY })}>Cancel</Button>}
            <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Submit</Button>
          </div>
        </div>
      </Card>
      <Card noPadding title="All Session List">
        <DataTable columns={COLUMNS} data={sessions} loading={isFetching} emptyText="No sessions yet." />
      </Card>
    </div>
  );
}
