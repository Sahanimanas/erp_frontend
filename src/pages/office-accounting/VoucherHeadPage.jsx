/**
 * VoucherHeadPage.jsx — income/expense categories
 * GET /accounting/voucher-heads, POST /accounting/voucher-heads
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Badge, ExportButton } from "../../components/ui";
import { FileText } from "lucide-react";
import apiClient from "../../services/axios";

const EXPORT_COLS = [
  { label: "Name", get: (h) => h.name },
  { label: "Type", get: (h) => h.type },
  { label: "Description", get: (h) => h.description || "" },
];

export default function VoucherHeadPage() {
  usePageTitle("Voucher Head");
  const [heads, setHeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", type: "INCOME", description: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get("/accounting/voucher-heads");
      if (res.data.success) setHeads(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load voucher heads");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name || !form.type) { setError("Name and type are required"); return; }
    setSaving(true); setError("");
    try {
      await apiClient.post("/accounting/voucher-heads", form);
      setForm({ name: "", type: "INCOME", description: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create voucher head");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="Voucher Head" subtitle="Income & expense categories" icon={<FileText size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card title="Add Voucher Head">
          <form onSubmit={save} className="space-y-4">
            <Input label="Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Library Income" />
            <Select label="Type *" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              options={[{ value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expense" }]} />
            <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional" />
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Add Head"}</Button>
          </form>
        </Card>
        <Card title="Voucher Heads" className="lg:col-span-2" noPadding>
          <div className="px-4 pt-4 flex justify-end">
            <ExportButton filename="voucher-heads.csv" rows={heads} columns={EXPORT_COLS} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["#", "Name", "Type", "Description"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
                : heads.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No voucher heads yet.</td></tr>
                : heads.map((h, i) => (
                  <tr key={h.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-500">{i + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{h.name}</td>
                    <td className="px-4 py-3"><Badge variant={h.type === "INCOME" ? "success" : "danger"}>{h.type}</Badge></td>
                    <td className="px-4 py-3 text-slate-500">{h.description || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
