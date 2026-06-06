/**
 * AllTransactionsPage.jsx — ledger of all transactions + summary
 * GET /accounting/transactions, GET /accounting/summary, GET /accounting/accounts
 */
import { useState, useEffect, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Badge, Pagination } from "../../components/ui";
import { List } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const PAGE_SIZE = 15;

export default function AllTransactionsPage() {
  usePageTitle("All Transactions");
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [summary, setSummary] = useState({ income: 0, expense: 0, net: 0 });
  const [accounts, setAccounts] = useState([]);
  const [filter, setFilter] = useState({ type: "", accountId: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [s, a] = await Promise.all([apiClient.get("/accounting/summary"), apiClient.get("/accounting/accounts")]);
        if (s.data.success) setSummary(s.data.data);
        if (a.data.success) setAccounts(a.data.data || []);
      } catch (err) { console.error(err); }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (filter.type) params.set("type", filter.type);
      if (filter.accountId) params.set("accountId", filter.accountId);
      const res = await apiClient.get(`/accounting/transactions?${params}`);
      if (res.data.success) { setRows(res.data.data || []); setTotal(res.data.pagination?.total || 0); }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load transactions");
    } finally { setLoading(false); }
  }, [page, filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <PageHeader title="All Transactions" subtitle="Income & expense ledger" icon={<List size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Income</p><p className="text-2xl font-bold text-emerald-600">{fmt(summary.income)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Expense</p><p className="text-2xl font-bold text-red-600">{fmt(summary.expense)}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Net</p><p className={`text-2xl font-bold ${summary.net >= 0 ? "text-indigo-600" : "text-red-600"}`}>{fmt(summary.net)}</p></Card>
      </div>
      <Card className="mb-5">
        <div className="flex flex-wrap items-end gap-3">
          <Select label="Type" value={filter.type} onChange={e => { setFilter(f => ({ ...f, type: e.target.value })); setPage(1); }}
            options={[{ value: "", label: "All" }, { value: "INCOME", label: "Income" }, { value: "EXPENSE", label: "Expense" }]} className="w-40" />
          <Select label="Account" value={filter.accountId} onChange={e => { setFilter(f => ({ ...f, accountId: e.target.value })); setPage(1); }}
            options={[{ value: "", label: "All accounts" }, ...accounts.map(a => ({ value: a.id, label: a.name }))]} className="w-48" />
        </div>
      </Card>
      <Card noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Date", "Type", "Account", "Head", "Description", "Amount"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : rows.length === 0 ? <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">No transactions.</td></tr>
              : rows.map(t => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 text-slate-600">{t.date ? new Date(t.date).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="px-4 py-3"><Badge variant={t.type === "INCOME" ? "success" : "danger"}>{t.type}</Badge></td>
                  <td className="px-4 py-3 text-slate-700">{t.account?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{t.voucherHead?.name || "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{t.description || "—"}</td>
                  <td className={`px-4 py-3 font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-red-600"}`}>{t.type === "INCOME" ? "+" : "-"}{fmt(t.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>
    </div>
  );
}
