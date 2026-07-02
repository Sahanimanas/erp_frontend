/**
 * Fee Management → Class Fee Structure
 * Read-only, per-class fee breakdown. Each enabled fee type is expanded by its
 * collection schedule (one row per month for Monthly/Quarterly, "Only Once" for
 * Session/One-time), with a grand Total Fee Amount and a PDF download.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { FileText, FileDown } from "lucide-react";
import { useGetClassStructureQuery } from "../../redux/api/feeMgmtApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { printTable } from "../../utils/printPdf";

const MONTHLY_LIKE = ["Monthly", "Quarterly"];
const rs = (n) => `Rs. ${Number(n || 0)}`;

// Expand each enabled fee type into one display row per collection occurrence.
function buildRows(enabled) {
  const out = [];
  for (const r of enabled) {
    const months = MONTHLY_LIKE.includes(r.frequency) && r.months?.length ? r.months : null;
    if (months) {
      months.forEach((m, i) => out.push({
        key: `${r.feeTypeId}-${m}`,
        name: i === 0 ? r.name : "",
        feeType: i === 0 ? r.frequency : "",
        paymentName: m,
        amount: Number(r.amount || 0),
        firstOfGroup: i === 0,
      }));
    } else {
      out.push({
        key: r.feeTypeId, name: r.name, feeType: r.frequency,
        paymentName: "Only Once", amount: Number(r.amount || 0), firstOfGroup: true,
      });
    }
  }
  return out;
}

export default function ClassFeeStructurePage() {
  usePageTitle("Class Fee Structure");
  const [session, setSession] = useState("");
  const [feePlan, setFeePlan] = useState("REGULAR");
  const [classId, setClassId] = useState("");

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: rows = [], isFetching } = useGetClassStructureQuery({ classId, includeTransport: true, academicYearId: session }, { skip: !classId || !session });

  const className = classes.find((c) => c.id === classId)?.name;
  const sessionName = years.find((y) => y.id === session)?.name || "";
  const enabled = rows.filter((r) => r.enabled);
  const display = buildRows(enabled);
  const total = display.reduce((s, r) => s + r.amount, 0);

  const downloadPdf = () => {
    printTable({
      title: `${className || "Class"} Fee Structure`,
      subtitle: [sessionName && `Session ${sessionName}`, `Fee Plan ${feePlan}`].filter(Boolean).join("  ·  "),
      columns: ["Name", "Fee Type", "Payment Name", "Fee Amount", "Total Payment"],
      rows: display.map((r) => [r.name, r.feeType, r.paymentName, rs(r.amount), `X 1 = ${rs(r.amount)}`]),
      footer: `Total Fee Amount: Rs. ${total}`,
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Class Fee Structure" subtitle="View the configured fee structure" icon={<FileText size={18} />} />

      <Card title="Search Class Fee">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan *" value={feePlan} onChange={(e) => setFeePlan(e.target.value)}
            options={["REGULAR", "PROMOTION", "FREE_ADMISSION"].map((p) => ({ value: p, label: p }))} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>

      <Card noPadding title={className ? `${className} Class Fee Structure` : "Class Fee Structure"}
        action={<Button size="sm" icon={<FileDown size={13} />} disabled={!display.length} onClick={downloadPdf}>Download as PDF</Button>}>

        {!session || !classId ? (
          <EmptyState icon="📄" title="Pick session & class" description="Select a session and class to view its fee structure." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : display.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400">Fee structure not available. Set amounts under Manage Class Fee.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Name", "Fee Type", "Payment Name", "Fee Amount", "Total Payment"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {display.map((r) => (
                    <tr key={r.key} className={`hover:bg-slate-50/70 ${r.firstOfGroup ? "border-t border-slate-100" : ""}`}>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.feeType}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.paymentName}</td>
                      <td className="px-4 py-2.5 text-slate-700 text-[12px]">{rs(r.amount)}</td>
                      <td className="px-4 py-2.5 text-slate-700 text-[12px]">X 1 = {rs(r.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 text-right">
              <span className="text-[15px] font-extrabold text-slate-800">Total Fee Amount: Rs. {total}</span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
