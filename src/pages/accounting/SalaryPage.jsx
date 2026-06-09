/**
 * SalaryPage.jsx — staff salary overview from GET /employees (baseSalary)
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, ExportButton } from "../../components/ui";
import { DollarSign } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function SalaryPage() {
  usePageTitle("Salary");
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/employees?limit=500");
        if (res.data.success) setEmployees(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load salaries");
      } finally { setLoading(false); }
    })();
  }, []);

  const totalMonthly = employees.reduce((s, e) => s + Number(e.baseSalary || 0), 0);
  const name = (e) => e.user ? `${e.user.firstName} ${e.user.lastName}` : (e.employeeCode || "—");

  return (
    <div>
      <PageHeader title="Salary" subtitle="Staff salary overview" icon={<DollarSign size={18} />}>
        <ExportButton filename="salary.csv" rows={employees} columns={[
          { label: "Employee", get: (e) => name(e) },
          { label: "Code", get: (e) => e.employeeCode || "—" },
          { label: "Base Salary", get: (e) => Number(e.baseSalary || 0) },
        ]} />
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Staff</p><p className="text-2xl font-bold text-slate-800">{employees.length}</p></Card>
        <Card><p className="text-xs text-slate-400 font-semibold mb-1">Monthly Salary Outlay</p><p className="text-2xl font-bold text-indigo-600">{fmt(totalMonthly)}</p></Card>
      </div>
      <Card title="Staff Salaries" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Employee", "Code", "Base Salary"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : employees.length === 0 ? <tr><td colSpan={3} className="px-4 py-10 text-center text-slate-400">No employees yet.</td></tr>
              : employees.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={name(e)} size="sm" /><span className="font-medium text-slate-700">{name(e)}</span></div></td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{e.employeeCode || "—"}</td>
                  <td className="px-4 py-3 font-medium text-slate-700">{e.baseSalary ? fmt(e.baseSalary) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
