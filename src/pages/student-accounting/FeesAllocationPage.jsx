/**
 * FeesAllocationPage.jsx — allocate a fee group to a section
 * GET /sections, GET /fees/groups, GET /fees/structures?sectionId, POST /fees/structures
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, Badge } from "../../components/ui";
import { GitBranch } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FeesAllocationPage() {
  usePageTitle("Fees Allocation");
  const [sections, setSections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ sectionId: "", groupId: "", dueDate: "", fine: "" });
  const [fees, setFees] = useState([]);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [s, g] = await Promise.all([apiClient.get("/sections"), apiClient.get("/fees/groups")]);
        if (s.data.success) setSections(s.data.data || []);
        if (g.data.success) setGroups(g.data.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const loadFees = useCallback(async (sectionId) => {
    if (!sectionId) { setFees([]); return; }
    setLoadingList(true);
    try {
      const res = await apiClient.get(`/fees/structures?sectionId=${sectionId}`);
      if (res.data.success) setFees(res.data.data || []);
    } catch (err) { console.error(err); }
    finally { setLoadingList(false); }
  }, []);

  useEffect(() => { loadFees(form.sectionId); }, [form.sectionId, loadFees]);

  const allocate = async (e) => {
    e.preventDefault();
    setError(""); setDone("");
    if (!form.sectionId || !form.groupId || !form.dueDate) { setError("Section, group and due date are required"); return; }
    setSaving(true);
    try {
      await apiClient.post("/fees/structures", {
        sectionId: form.sectionId, groupId: form.groupId, dueDate: form.dueDate, fine: Number(form.fine || 0),
      });
      setDone("Fee allocated to section.");
      setForm(f => ({ ...f, groupId: "", dueDate: "", fine: "" }));
      loadFees(form.sectionId);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to allocate fee");
    } finally { setSaving(false); }
  };

  const sectionOptions = [{ value: "", label: "Select section" }, ...sections.map(s => ({ value: s.id, label: `${s.class?.name || "Class"} - ${s.name}` }))];
  const groupOptions = [{ value: "", label: "Select group" }, ...groups.map(g => ({ value: g.id, label: g.name }))];
  const groupName = (id) => groups.find(g => g.id === id)?.name || "—";

  return (
    <div>
      <PageHeader title="Fees Allocation" subtitle="Assign fee groups to sections" icon={<GitBranch size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      {done && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 mb-4 rounded-lg text-sm">{done}</div>}
      <Card className="mb-5" title="Allocate Fee">
        <form onSubmit={allocate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Section *" value={form.sectionId} onChange={e => setForm(f => ({ ...f, sectionId: e.target.value }))} options={sectionOptions} />
          <Select label="Fee Group *" value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))} options={groupOptions} />
          <Input label="Due Date *" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          <Input label="Fine (₹)" type="number" value={form.fine} onChange={e => setForm(f => ({ ...f, fine: e.target.value }))} placeholder="0" />
          <div className="md:col-span-4"><Button type="submit" disabled={saving}>{saving ? "Allocating…" : "Allocate"}</Button></div>
        </form>
      </Card>
      <Card title="Allocations for selected section" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Fee Group", "Due Date", "Fine"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {!form.sectionId ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Select a section to view allocations.</td></tr>
              : loadingList ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : fees.length === 0 ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No fees allocated to this section yet.</td></tr>
              : fees.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-medium text-slate-700">{f.group?.name || groupName(f.groupId)}</td>
                  <td className="px-4 py-3 text-slate-600">{f.dueDate ? new Date(f.dueDate).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><Badge variant="warning">{fmt(f.fine)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
