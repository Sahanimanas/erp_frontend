/**
 * Payments → Student Fee Payment
 * Search a student → see their fee ledger (expected/paid/due per fee type) →
 * collect a payment → get a receipt. Per-student ledger is exportable.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, SearchInput, Badge, Modal, EmptyState, Skeleton } from "../../components/ui";
import { CreditCard, Download, Search, Receipt } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetLedgerQuery, useCollectPaymentMutation } from "../../redux/api/paymentsApi";
import { exportRows } from "../../utils/exportExcel";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function StudentFeePaymentPage() {
  usePageTitle("Student Fee Payment");
  const [mode, setMode] = useState("code"); // code | class
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [pay, setPay] = useState({}); // feeTypeId -> amount
  const [payMode, setPayMode] = useState("CASH");
  const [receipt, setReceipt] = useState(null);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery(
    { ...(mode === "code" ? { search } : { classId }), limit: 50 },
    { skip: mode === "code" ? !search : !classId }
  );
  const { data: ledger, isFetching } = useGetLedgerQuery(studentId, { skip: !studentId });
  const [collect, { isLoading: collecting }] = useCollectPaymentMutation();

  const students = studentList?.data ?? [];

  const setAmount = (id, v) => setPay((p) => ({ ...p, [id]: v }));
  const payAllDue = () => { const next = {}; (ledger?.items || []).forEach((i) => { if (i.due > 0) next[i.feeTypeId] = i.due; }); setPay(next); };

  const total = Object.values(pay).reduce((s, v) => s + (Number(v) || 0), 0);

  const submit = async () => {
    const lines = (ledger?.items || [])
      .filter((i) => Number(pay[i.feeTypeId]) > 0)
      .map((i) => ({ feeTypeId: i.feeTypeId, name: i.name, amount: Number(pay[i.feeTypeId]) }));
    if (!lines.length) { toast.error("Enter an amount to collect"); return; }
    try {
      const res = await collect({ studentId, mode: payMode, lines }).unwrap();
      setReceipt({ ...res, total, student: ledger.student, lines });
      setPay({});
      toast.success(`Payment recorded — ${res.receiptNo}`);
    } catch (e) { toast.error(e?.data?.error || "Payment failed"); }
  };

  const exportLedger = () => {
    if (!ledger) return;
    const ok = exportRows(`ledger-${ledger.student.rollNumber || studentId}.csv`, ledger.items, [
      { label: "Fee Type", get: (r) => r.name },
      { label: "Frequency", get: (r) => r.frequency },
      { label: "Expected", get: (r) => r.expected },
      { label: "Discount", get: (r) => r.discount },
      { label: "Paid", get: (r) => r.paid },
      { label: "Due", get: (r) => r.due },
    ]);
    if (!ok) toast.error("Nothing to export");
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Student Fee Payment" subtitle="Collect class fees by student" icon={<CreditCard size={18} />} />

      <Card title="Search Class Fee Payment">
        <div className="p-5 space-y-4">
          <div className="flex gap-4">
            {[["code", "Student Code / Name"], ["class", "Class Filter"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" checked={mode === v} onChange={() => { setMode(v); setStudentId(""); }} className="accent-indigo-600" /> {l}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {mode === "code" ? (
              <div className="md:col-span-2"><SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Registration / name / phone…" /></div>
            ) : (
              <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
                options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            )}
            <Select label="Student" value={studentId} onChange={(e) => { setStudentId(e.target.value); setPay({}); }}
              options={[{ value: "", label: students.length ? "Select Student" : "Search first" },
                ...students.map((s) => ({ value: s.id, label: `${s.rollNumber} · ${s.user?.firstName} ${s.user?.lastName}` }))]} />
          </div>
        </div>
      </Card>

      {studentId && (
        <Card noPadding title={ledger ? `${ledger.student.name} — ${ledger.student.className}-${ledger.student.sectionName}` : "Fee Ledger"}
          action={<Button size="sm" variant="secondary" icon={<Download size={13} />} onClick={exportLedger} disabled={!ledger?.items?.length}>Export</Button>}>
          {isFetching ? (
            <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !ledger?.items?.length ? (
            <EmptyState icon="💳" title="No fees configured" description="Set up this class's fee structure under Fee Management → Manage Class Fee." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Fee Type", "Frequency", "Expected", "Paid", "Due", "Pay Now"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ledger.items.map((i) => (
                      <tr key={i.feeTypeId} className="hover:bg-slate-50/70">
                        <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{i.name}</td>
                        <td className="px-4 py-2.5"><Badge variant="info">{i.frequency}</Badge></td>
                        <td className="px-4 py-2.5 text-slate-600">{money(i.expected)}</td>
                        <td className="px-4 py-2.5 text-emerald-600">{money(i.paid)}</td>
                        <td className="px-4 py-2.5 font-semibold text-red-500">{money(i.due)}</td>
                        <td className="px-4 py-2.5">
                          <input type="number" min="0" max={i.due} value={pay[i.feeTypeId] ?? ""} onChange={(e) => setAmount(i.feeTypeId, e.target.value)}
                            disabled={i.due <= 0} placeholder="0"
                            className="w-28 px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 disabled:bg-slate-50" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50">
                <div className="flex items-center gap-4 text-[13px]">
                  <span className="text-slate-500">Total Due: <b className="text-red-500">{money(ledger.totals.due)}</b></span>
                  <span className="text-slate-500">Collecting: <b className="text-indigo-600">{money(total)}</b></span>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={payMode} onChange={(e) => setPayMode(e.target.value)}
                    options={["CASH", "ONLINE", "CHEQUE", "BANK"].map((m) => ({ value: m, label: m }))} className="w-32" />
                  <Button variant="secondary" size="sm" onClick={payAllDue}>Pay All Due</Button>
                  <Button icon={<Receipt size={14} />} loading={collecting} disabled={total <= 0} onClick={submit}>Collect</Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}

      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment Receipt" size="md">
        {receipt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-800">{receipt.student.name}</p>
                <p className="text-[11px] text-slate-400">{receipt.student.className}-{receipt.student.sectionName}</p>
              </div>
              <Badge variant="success" dot>{receipt.receiptNo}</Badge>
            </div>
            <div className="border-t border-slate-100 pt-2 space-y-1">
              {receipt.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-[12.5px]"><span className="text-slate-600">{l.name}</span><span className="font-semibold">{money(l.amount)}</span></div>
              ))}
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px] font-bold">
              <span>Total Paid</span><span className="text-emerald-600">{money(receipt.total)}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => window.print()}>Print</Button>
              <Button onClick={() => setReceipt(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
