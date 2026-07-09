/**
 * PayrollPage.jsx — salary register from GET /employees (baseSalary)
 * A standard split: HRA 20%, DA 10% of basic; PF 12% deduction (illustrative,
 * computed client-side from baseSalary until a dedicated payroll module exists).
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, ExportButton } from "../../components/ui";
import { DollarSign } from "lucide-react";
import apiClient from "../../services/axios";

const fmt = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export default function PayrollPage() {
  usePageTitle("Payroll");
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
        setError(err.response?.data?.error || err.message || "Failed to load payroll");
      } finally { setLoading(false); }
    })();
  }, []);

  const compute = (base) => {
    const basic = Number(base || 0);
    const hra = basic * 0.2;
    const da = basic * 0.1;
    const gross = basic + hra + da;
    const pf = basic * 0.12;
    const net = gross - pf;
    return { basic, hra, da, gross, pf, net };
  };

  const name = (e) => e.user ? `${e.user.firstName} ${e.user.lastName}` : (e.employeeCode || "—");
  const totalNet = employees.reduce((s, e) => s + compute(e.baseSalary).net, 0);

  const exportColumns = [
    { label: "Employee", get: (e) => name(e) },
    { label: "Basic", get: (e) => Math.round(compute(e.baseSalary).basic) },
    { label: "HRA", get: (e) => Math.round(compute(e.baseSalary).hra) },
    { label: "DA", get: (e) => Math.round(compute(e.baseSalary).da) },
    { label: "Gross", get: (e) => Math.round(compute(e.baseSalary).gross) },
    { label: "PF", get: (e) => Math.round(compute(e.baseSalary).pf) },
    { label: "Net", get: (e) => Math.round(compute(e.baseSalary).net) },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Payroll" subtitle="Salary register" icon={<DollarSign size={18} />} />
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      <Card>
        <div className="p-5">
          <p className="text-xs text-slate-400 font-semibold mb-1">Total Net Payable (monthly)</p>
          <p className="text-3xl font-bold text-indigo-600">{fmt(totalNet)}</p>
        </div>
      </Card>
      <Card title="Salary Breakdown" noPadding action={<ExportButton filename="payroll.csv" rows={employees} columns={exportColumns} />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50 border-b border-slate-100">
              {["Employee", "Basic", "HRA", "DA", "Gross", "PF", "Net"].map(h => <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">Loading…</td></tr>
              : employees.length === 0 ? <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No employees yet.</td></tr>
              : employees.map(e => {
                const c = compute(e.baseSalary);
                return (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3"><div className="flex items-center gap-2.5"><Avatar name={name(e)} size="sm" /><span className="font-medium text-slate-700">{name(e)}</span></div></td>
                    <td className="px-4 py-3 text-slate-600">{fmt(c.basic)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(c.hra)}</td>
                    <td className="px-4 py-3 text-slate-600">{fmt(c.da)}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{fmt(c.gross)}</td>
                    <td className="px-4 py-3 text-red-500">-{fmt(c.pf)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-bold">{fmt(c.net)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
