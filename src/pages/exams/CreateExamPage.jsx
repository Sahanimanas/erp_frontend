/**
 * CreateExamPage.jsx — create + list exams
 * POST /exams { name, type, startDate, endDate }, GET /exams
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Modal, Input, Select, Badge } from "../../components/ui";
import { FileText, Plus } from "lucide-react";
import apiClient from "../../services/axios";

const TYPES = ["UNIT_TEST", "MONTHLY", "CLASS_TEST", "HALF_YEARLY", "YEARLY"];

export default function CreateExamPage() {
  usePageTitle("Create Exam");
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "UNIT_TEST", startDate: "", endDate: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get("/exams?limit=100");
      if (res.data.success) setExams(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load exams");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type || !form.startDate || !form.endDate) { setError("All fields are required"); return; }
    setSaving(true); setError("");
    try {
      await apiClient.post("/exams", form);
      setOpen(false); setForm({ name: "", type: "UNIT_TEST", startDate: "", endDate: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create exam");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Create Exam" subtitle="Define examinations" icon={<FileText size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>New Exam</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card title="Exams" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Exam", "Type", "Start", "End"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : exams.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No exams yet. Create one to get started.</td></tr>
              : exams.map(ex => (
                <tr key={ex.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{ex.name}</td>
                  <td className="px-4 py-3"><Badge variant="default">{(ex.type || "").replace(/_/g, " ")}</Badge></td>
                  <td className="px-4 py-3 text-slate-600">{ex.startDate ? new Date(ex.startDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{ex.endDate ? new Date(ex.endDate).toLocaleDateString("en-IN") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Exam">
        <form onSubmit={save} className="space-y-4">
          <Input label="Exam Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Mid-Term 2026" />
          <Select label="Type *" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={TYPES.map(t => ({ value: t, label: t.replace(/_/g, " ") }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date *" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date *" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Creating…" : "Create Exam"}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
