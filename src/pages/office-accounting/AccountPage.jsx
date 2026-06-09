/**
 * AccountPage.jsx — cash/bank accounts
 * GET /accounting/accounts, POST /accounting/accounts
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Modal, Input, Select, Badge, ExportButton } from "../../components/ui";
import { Briefcase, Plus } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const EXPORT_COLS = [
  { label: "Account", get: (a) => a.name },
  { label: "Type", get: (a) => a.type },
  { label: "A/C Number", get: (a) => a.accountNumber || "" },
  { label: "Bank Name", get: (a) => a.bankName || "" },
  { label: "Opening", get: (a) => Number(a.openingBalance || 0) },
  { label: "Current Balance", get: (a) => Number(a.currentBalance || 0) },
];

export default function AccountPage() {
  usePageTitle("Accounts");
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", type: "CASH", accountNumber: "", bankName: "", openingBalance: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await apiClient.get("/accounting/accounts");
      if (res.data.success) setAccounts(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load accounts");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!form.name) { setError("Account name is required"); return; }
    setSaving(true); setError("");
    try {
      await apiClient.post("/accounting/accounts", { ...form, openingBalance: Number(form.openingBalance || 0) });
      setOpen(false); setForm({ name: "", type: "CASH", accountNumber: "", bankName: "", openingBalance: "" });
      load();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
    } finally { setSaving(false); }
  };

  const totalBalance = accounts.reduce((s, a) => s + Number(a.currentBalance || 0), 0);

  return (
    <div>
      <PageHeader title="Accounts" subtitle="Cash & bank accounts" icon={<Briefcase size={18} />}>
        <ExportButton filename="accounts.csv" rows={accounts} columns={EXPORT_COLS} />
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Create Account</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5"><p className="text-xs text-slate-400 font-semibold mb-1">Total Balance</p><p className="text-3xl font-bold text-indigo-600">{fmt(totalBalance)}</p></Card>
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Account", "Type", "A/C Number", "Opening", "Current Balance"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : accounts.length === 0 ? <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-400">No accounts yet.</td></tr>
              : accounts.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-800">{a.name}{a.bankName ? <span className="text-[11px] text-slate-400 block">{a.bankName}</span> : null}</td>
                  <td className="px-4 py-3"><Badge variant={a.type === "BANK" ? "default" : "success"}>{a.type}</Badge></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{a.accountNumber || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{fmt(a.openingBalance)}</td>
                  <td className="px-4 py-3 font-bold text-emerald-600">{fmt(a.currentBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Create Account">
        <form onSubmit={save} className="space-y-4">
          <Input label="Account Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Petty Cash" />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} options={[{ value: "CASH", label: "Cash" }, { value: "BANK", label: "Bank" }]} />
          {form.type === "BANK" && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bank Name" value={form.bankName} onChange={e => setForm(f => ({ ...f, bankName: e.target.value }))} placeholder="e.g. State Bank" />
              <Input label="Account Number" value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} placeholder="A/C no." />
            </div>
          )}
          <Input label="Opening Balance (₹)" type="number" value={form.openingBalance} onChange={e => setForm(f => ({ ...f, openingBalance: e.target.value }))} placeholder="0" />
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} className="flex-1">{saving ? "Saving…" : "Create"}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
