/**
 * FeesGroupPage.jsx — fee groups wired to the API
 * GET /fees/groups, GET /fees/types, POST /fees/groups
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Modal, Input, Textarea, Badge, SearchInput, ExportButton } from "../../components/ui";
import { Layers, Plus } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FeesGroupPage() {
  usePageTitle("Fees Group");
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [g, t] = await Promise.all([apiClient.get("/fees/groups"), apiClient.get("/fees/types")]);
      if (g.data.success) setGroups(g.data.data || []);
      if (t.data.success) setTypes(t.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load fee groups");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name) { setError("Group name is required"); return; }
    setSaving(true); setError("");
    try {
      await apiClient.post("/fees/groups", form);
      setOpen(false); setForm({ name: "", description: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create fee group");
    } finally { setSaving(false); }
  };

  const typesFor = (gid) => types.filter(t => t.groupId === gid);
  const filtered = groups.filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader title="Fees Group" subtitle="Group fee types together" icon={<Layers size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Add Group</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card action={<><ExportButton filename="fees-groups.csv" rows={filtered} columns={[
        { label: "Name", get: (g) => g.name },
        { label: "Description", get: (g) => g.description || "" },
        { label: "Fee Types", get: (g) => typesFor(g.id).map(t => `${t.name} (${Number(t.amount)})`).join("; ") },
        { label: "Total", get: (g) => typesFor(g.id).reduce((s, t) => s + Number(t.amount), 0) },
      ]} /><SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search groups…" /></>} noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["#", "Name", "Description", "Fee Types", "Total"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : filtered.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No fee groups yet.</td></tr>
              : filtered.map((g, i) => {
                const ts = typesFor(g.id);
                const total = ts.reduce((s, t) => s + Number(t.amount), 0);
                return (
                  <tr key={g.id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{g.name}</td>
                    <td className="px-4 py-3 text-slate-600">{g.description || "—"}</td>
                    <td className="px-4 py-3">{ts.length === 0 ? <span className="text-slate-400">—</span> : ts.map(t => <div key={t.id} className="text-xs text-slate-600">{t.name} · {fmt(t.amount)}</div>)}</td>
                    <td className="px-4 py-3"><Badge variant="success">{fmt(total)}</Badge></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Fees Group">
        <form onSubmit={save} className="space-y-4">
          <Input label="Group Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Term 1 Fees" />
          <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional description" />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving…" : "Save Group"}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
