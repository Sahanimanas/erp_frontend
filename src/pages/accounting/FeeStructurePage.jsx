/**
 * FeeStructurePage.jsx — fee groups & types
 * GET /fees/groups, GET /fees/types, POST /fees/types
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Modal, Input, Select, Badge, ExportButton } from "../../components/ui";
import { Layers, Plus } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function FeeStructurePage() {
  usePageTitle("Fee Structure");
  const [groups, setGroups] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ groupId: "", name: "", amount: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [g, t] = await Promise.all([
        apiClient.get("/fees/groups"),
        apiClient.get("/fees/types"),
      ]);
      if (g.data.success) setGroups(g.data.data || []);
      if (t.data.success) setTypes(t.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load fee structure");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.groupId || !form.name || !form.amount) { setError("Group, name and amount are required"); return; }
    setSaving(true); setError("");
    try {
      await apiClient.post("/fees/types", { groupId: form.groupId, name: form.name, amount: Number(form.amount) });
      setOpen(false); setForm({ groupId: "", name: "", amount: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add fee type");
    } finally { setSaving(false); }
  };

  const groupName = (id) => groups.find(g => g.id === id)?.name || "—";

  return (
    <div>
      <PageHeader title="Fee Structure" subtitle="Fee groups & types" icon={<Layers size={18} />}>
        <ExportButton filename="fee-types.csv" rows={types} columns={[
          { label: "Name", get: (t) => t.name },
          { label: "Group", get: (t) => groupName(t.groupId) },
          { label: "Amount", get: (t) => Number(t.amount || 0) },
        ]} />
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Add Fee Type</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Fee Groups">
          {loading ? <p className="text-slate-400 text-sm">Loading…</p>
          : groups.length === 0 ? <p className="text-slate-400 text-sm">No groups yet.</p>
          : <ul className="space-y-2">{groups.map(g => (
              <li key={g.id} className="flex items-center justify-between bg-slate-50 rounded-lg px-3 py-2">
                <span className="text-sm font-medium text-slate-700">{g.name}</span>
                <Badge variant="default">{types.filter(t => t.groupId === g.id).length} types</Badge>
              </li>))}
            </ul>}
        </Card>
        <Card title="Fee Types" className="lg:col-span-2" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Name", "Group", "Amount"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
                : types.length === 0 ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No fee types yet.</td></tr>
                : types.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-medium text-slate-700">{t.name}</td>
                    <td className="px-4 py-3 text-slate-600">{groupName(t.groupId)}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{fmt(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Fee Type">
        <form onSubmit={save} className="space-y-4">
          <Select label="Fee Group *" value={form.groupId} onChange={e => setForm(f => ({ ...f, groupId: e.target.value }))}
            options={[{ value: "", label: "Select group" }, ...groups.map(g => ({ value: g.id, label: g.name }))]} />
          <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Library Fee" />
          <Input label="Amount (₹) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="e.g. 1500" />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
