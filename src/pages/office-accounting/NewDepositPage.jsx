/**
 * NewDepositPage.jsx — record an INCOME transaction
 * GET /accounting/accounts, GET /accounting/voucher-heads?type=INCOME
 * GET /accounting/transactions?type=INCOME, POST /accounting/transactions
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea } from "../../components/ui";
import { ArrowDownCircle } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const today = () => new Date().toISOString().slice(0, 10);

export default function NewDepositPage() {
  usePageTitle("New Deposit");
  const [accounts, setAccounts] = useState([]);
  const [heads, setHeads] = useState([]);
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ accountId: "", voucherHeadId: "", amount: "", date: today(), description: "" });
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [saving, setSaving] = useState(false);

  const loadRefs = useCallback(async () => {
    try {
      const [a, h, t] = await Promise.all([
        apiClient.get("/accounting/accounts"),
        apiClient.get("/accounting/voucher-heads?type=INCOME"),
        apiClient.get("/accounting/transactions?type=INCOME&limit=10"),
      ]);
      if (a.data.success) setAccounts(a.data.data || []);
      if (h.data.success) setHeads(h.data.data || []);
      if (t.data.success) setRows(t.data.data || []);
    } catch (err) { console.error(err); }
  }, []);

  useEffect(() => { loadRefs(); }, [loadRefs]);

  const save = async (e) => {
    e.preventDefault();
    setError(""); setDone("");
    if (!form.accountId || !form.amount) { setError("Account and amount are required"); return; }
    setSaving(true);
    try {
      await apiClient.post("/accounting/transactions", {
        accountId: form.accountId, voucherHeadId: form.voucherHeadId || undefined,
        type: "INCOME", amount: Number(form.amount), date: form.date, description: form.description,
      });
      setDone("Deposit recorded.");
      setForm(f => ({ ...f, amount: "", description: "" }));
      loadRefs();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to record deposit");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <PageHeader title="New Deposit" subtitle="Record income" icon={<ArrowDownCircle size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      {done && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 mb-4 rounded-lg text-sm">{done}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Add Deposit">
          <form onSubmit={save} className="space-y-4">
            <Select label="Account *" value={form.accountId} onChange={e => setForm(f => ({ ...f, accountId: e.target.value }))}
              options={[{ value: "", label: "Select account" }, ...accounts.map(a => ({ value: a.id, label: a.name }))]} />
            <Select label="Voucher Head" value={form.voucherHeadId} onChange={e => setForm(f => ({ ...f, voucherHeadId: e.target.value }))}
              options={[{ value: "", label: "None" }, ...heads.map(h => ({ value: h.id, label: h.name }))]} />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Amount (₹) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" />
              <Input label="Date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Optional note" />
            <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Record Deposit"}</Button>
          </form>
        </Card>
        <Card title="Recent Deposits" noPadding>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Date", "Account", "Head", "Amount"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length === 0 ? <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No deposits yet.</td></tr>
                : rows.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 text-slate-600">{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="px-4 py-3 text-slate-700">{t.account?.name || "—"}</td>
                    <td className="px-4 py-3 text-slate-600">{t.voucherHead?.name || "—"}</td>
                    <td className="px-4 py-3 font-medium text-emerald-600">{fmt(t.amount)}</td>
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
