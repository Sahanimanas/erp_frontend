/**
 * Fee Management → Class Fee Structure (read-only view of a class's fees).
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge, EmptyState, Skeleton } from "../../components/ui";
import { FileText, Download } from "lucide-react";
import { useGetClassStructureQuery } from "../../redux/api/feeMgmtApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { exportRows } from "../../utils/exportExcel";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function ClassFeeStructurePage() {
  usePageTitle("Class Fee Structure");
  const [session, setSession] = useState("");
  const [feePlan, setFeePlan] = useState("REGULAR");
  const [classId, setClassId] = useState("");

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: rows = [], isFetching } = useGetClassStructureQuery({ classId, includeTransport: true }, { skip: !classId });

  const className = classes.find((c) => c.id === classId)?.name;
  const enabled = rows.filter((r) => r.enabled);
  const total = enabled.reduce((s, r) => s + Number(r.amount || 0), 0);

  return (
    <div className="space-y-4">
      <PageHeader title="Class Fee Structure" subtitle="View the configured fee structure" icon={<FileText size={18} />} />
      <Card title="Search Class Fee">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan" value={feePlan} onChange={(e) => setFeePlan(e.target.value)}
            options={["REGULAR", "PROMOTION", "FREE_ADMISSION"].map((p) => ({ value: p, label: p }))} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>

      <Card noPadding title={className ? `${className} Class Fee Structure` : "Class Fee Structure"}
        action={<Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!enabled.length}
          onClick={() => exportRows(`fee-structure-${className || classId}.csv`, enabled, [
            { label: "Fee Type", get: (r) => r.name }, { label: "Frequency", get: (r) => r.frequency },
            { label: "Income Head", get: (r) => r.incomeHead }, { label: "Amount", get: (r) => r.amount },
          ])}>Export</Button>}>

        {!classId ? (
          <EmptyState icon="📄" title="Pick a class" description="Select a class to view its fee structure." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : enabled.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Fees Structure Not Available.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Fee Type", "Frequency", "Income Head", "Amount"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {enabled.map((r) => (
                    <tr key={r.feeTypeId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                      <td className="px-4 py-2.5"><Badge variant="info">{r.frequency}</Badge></td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.incomeHead || "—"}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800">{money(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-100">
                    <td className="px-4 py-3 font-bold text-slate-700" colSpan={3}>Total</td>
                    <td className="px-4 py-3 font-bold text-indigo-600">{money(total)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
