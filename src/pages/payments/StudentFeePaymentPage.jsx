/**
 * Payments → Student Fee Payment
 * Search a student → profile card → class fee structure → per-installment
 * payment details (pay / discount / extra / delete) → receipt list (revert).
 */
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, SearchInput, Badge, Modal, EmptyState, Skeleton, Avatar, Textarea } from "../../components/ui";
import { CreditCard, User, FileDown, Trash2, Pencil, Plus, Undo2 } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import {
  useGetLedgerQuery, useGetInstallmentsQuery, useGetPaymentHistoryQuery,
  useCollectPaymentMutation, useAdjustInstallmentMutation,
  useDeleteInstallmentPaymentMutation, useRevertReceiptMutation,
} from "../../redux/api/paymentsApi";
import { printRecord } from "../../utils/printPdf";

const MONTHLY_LIKE = ["Monthly", "Quarterly"];
const FINANCE_ACCOUNTS = ["Cash", "SBI Bank", "Paytm/PayPhone", "Primary Account", "All UPI", "Cheque"];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—");
const rowKey = (r) => `${r.feeTypeId}|${r.month ?? ""}`;

export default function StudentFeePaymentPage() {
  usePageTitle("Student Fee Payment");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState("code");
  const [search, setSearch] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState(params.get("id") || "");
  const [selected, setSelected] = useState({}); // rowKey -> true
  const [payOpen, setPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({ account: "Cash", bankName: "", txnNo: "", details: "", remarks: "", date: "" });
  const [receipt, setReceipt] = useState(null);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery(
    { ...(mode === "code" ? { search } : { classId }), limit: 50 },
    { skip: mode === "code" ? !search : !classId }
  );
  const { data: ledger } = useGetLedgerQuery(studentId, { skip: !studentId });
  const { data: inst, isFetching } = useGetInstallmentsQuery(studentId, { skip: !studentId });
  const { data: history = [] } = useGetPaymentHistoryQuery(studentId, { skip: !studentId });
  const [collect, { isLoading: collecting }] = useCollectPaymentMutation();
  const [adjust] = useAdjustInstallmentMutation();
  const [deletePayment] = useDeleteInstallmentPaymentMutation();
  const [revert] = useRevertReceiptMutation();

  const students = studentList?.data ?? [];
  const st = inst?.student || ledger?.student;
  const rows = inst?.rows ?? [];

  // ── selection + pay ──────────────────────────────────────────────────────
  const toggle = (r) => setSelected((s) => ({ ...s, [rowKey(r)]: !s[rowKey(r)] }));
  const dueRows = rows.filter((r) => r.due > 0);
  const selectedRows = rows.filter((r) => selected[rowKey(r)] && r.due > 0);
  const payTotal = selectedRows.reduce((s, r) => s + r.due, 0);
  const allDueSelected = dueRows.length > 0 && dueRows.every((r) => selected[rowKey(r)]);
  const toggleAll = () => {
    if (allDueSelected) { setSelected({}); return; }
    const next = {};
    dueRows.forEach((r) => { next[rowKey(r)] = true; });
    setSelected(next);
  };

  const openPay = () => {
    if (!selectedRows.length) { toast.error("Select at least one due row (Action column)"); return; }
    setPayForm((f) => ({ ...f, account: "Cash", bankName: "", txnNo: "", details: "", remarks: "" }));
    setPayOpen(true);
  };

  const addPayment = async () => {
    const lines = selectedRows.map((r) => ({ feeTypeId: r.feeTypeId, name: r.name, month: r.month, amount: r.due }));
    try {
      const res = await collect({
        studentId, mode: payForm.account,
        note: [payForm.txnNo && `Txn ${payForm.txnNo}`, payForm.bankName, payForm.details, payForm.remarks].filter(Boolean).join(" · "),
        lines,
      }).unwrap();
      setReceipt({ ...res, total: payTotal, student: st, lines, account: payForm.account });
      setSelected({});
      setPayOpen(false);
      toast.success(`Payment recorded — ${res.receiptNo}`);
    } catch (e) { toast.error(e?.data?.error || "Payment failed"); }
  };

  // ── row actions ──────────────────────────────────────────────────────────
  const onDiscount = async (r) => {
    // The most that can be discounted is whatever is still owed before the
    // discount, i.e. current remaining due + the discount already applied.
    const maxDiscount = r.due + r.discount;
    const v = window.prompt(
      `Discount for ${r.name} (${r.monthLabel})\nMax allowed: ${maxDiscount} (enter 0 to remove)`,
      String(r.discount || 0)
    );
    if (v == null) return;
    const amount = Number(v);
    if (Number.isNaN(amount) || amount < 0) { toast.error("Enter a valid discount amount"); return; }
    if (amount > maxDiscount) { toast.error(`Discount cannot exceed ${money(maxDiscount)}`); return; }
    try { await adjust({ studentId, feeTypeId: r.feeTypeId, month: r.month, kind: "DISCOUNT", amount }).unwrap(); toast.success("Discount updated"); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };
  const onExtra = async (r) => {
    const v = window.prompt(`Extra charge for ${r.name} (${r.monthLabel})`, "0");
    if (v == null) return;
    const amount = Number(v);
    if (!(amount > 0)) return;
    try { await adjust({ studentId, feeTypeId: r.feeTypeId, month: r.month, kind: "EXTRA", amount }).unwrap(); toast.success("Extra fee added"); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };
  const onDelete = async (r) => {
    if (!window.confirm(`Delete the payment for ${r.name} (${r.monthLabel})?`)) return;
    try { await deletePayment({ studentId, feeTypeId: r.feeTypeId, month: r.month }).unwrap(); toast.success("Payment deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };
  const onRevert = async (receiptNo) => {
    if (!window.confirm(`Revert receipt ${receiptNo}? This removes its payments.`)) return;
    try { await revert({ receiptNo, studentId }).unwrap(); toast.success("Receipt reverted"); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };

  const printReceipt = (rc) => {
    if (!rc) return;
    printRecord({
      title: "Fee Receipt",
      subtitle: [rc.student?.name, rc.receiptNo, `${rc.student?.className || ""}-${rc.student?.sectionName || ""}`].filter(Boolean).join("  ·  "),
      sections: [
        { heading: "Student", rows: [["Name", rc.student?.name], ["Roll No", rc.student?.rollNumber], ["Reg Id", rc.student?.registrationNo], ["Father", rc.student?.fatherName]] },
        { heading: "Payment", rows: [...rc.lines.map((l) => [`${l.name}${l.month ? ` (${l.month})` : ""}`, money(l.amount)]), ["TOTAL PAID", money(rc.total)], ["Account", rc.account || "Cash"]] },
      ],
    });
  };

  // ── class fee structure (one row per fee type) ────────────────────────────
  const structure = (ledger?.items || []).map((i) => {
    const count = MONTHLY_LIKE.includes(i.frequency) && i.months?.length ? i.months.length : 1;
    return { ...i, count, payment: MONTHLY_LIKE.includes(i.frequency) && i.months?.length ? i.months.join(", ") : "Only Once", totalPay: i.perMonth * count };
  });
  const grandTotal = structure.reduce((s, r) => s + r.totalPay, 0);

  // ── receipts (grouped) ─────────────────────────────────────────────────────
  const receipts = (() => {
    const map = new Map();
    history.filter((h) => h.kind === "PAID" && h.receiptNo).forEach((h) => {
      const r = map.get(h.receiptNo) || { receiptNo: h.receiptNo, total: 0, paidDate: h.paidDate, mode: h.mode, note: h.note };
      r.total += Number(h.amount || 0);
      map.set(h.receiptNo, r);
    });
    return [...map.values()].sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate));
  })();

  return (
    <div className="space-y-4">
      <PageHeader title="Student Class Fee Payment" subtitle="Collect class fees by student" icon={<CreditCard size={18} />} />

      <Card title="Search Class Fee Payment">
        <div className="p-5 space-y-4">
          <div className="flex gap-4">
            {[["code", "Student Code"], ["class", "Class Filter"]].map(([v, l]) => (
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
            <Select label="Student" value={studentId} onChange={(e) => { setStudentId(e.target.value); setSelected({}); }}
              options={[{ value: "", label: students.length ? "Select Student" : "Search first" },
                ...students.map((s) => ({ value: s.id, label: `${s.rollNumber} · ${s.user?.firstName} ${s.user?.lastName}` }))]} />
          </div>
        </div>
      </Card>

      {/* Profile card */}
      {studentId && st && (
        <Card>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-28 h-32 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {st.photo ? <img src={st.photo} alt={st.name} className="w-full h-full object-cover" /> : <Avatar name={st.name} size="lg" />}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 text-[13px]">
              {[["Name", st.name], ["Father Name", st.fatherName], ["Phone", st.phone], ["Email", st.email],
                ["Reg Id", st.registrationNo], ["Roll No", st.rollNumber], ["Class", `${st.className || "—"}-${st.sectionName || ""}`], ["Remarks", st.remarks]].map(([l, v]) => (
                <div key={l} className="flex gap-2 border-b border-slate-50 py-1">
                  <span className="text-slate-400 font-medium min-w-[92px]">{l} :</span>
                  <span className="text-slate-800 font-semibold">{v || "N/A"}</span>
                </div>
              ))}
            </div>
            <Button variant="secondary" size="sm" icon={<User size={14} />} onClick={() => navigate(`/students/profile?id=${studentId}`)}>View Profile</Button>
          </div>
        </Card>
      )}

      {/* Class fee structure */}
      {studentId && structure.length > 0 && (
        <Card noPadding title={`${st?.className || "Class"} Class Fee Structure`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Name", "Fee Type", "Payment Name", "Fee Amount", "Total Payment"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {structure.map((r) => (
                  <tr key={r.feeTypeId} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.frequency}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] max-w-[320px]">{r.payment}</td>
                    <td className="px-4 py-2.5 text-slate-700 text-[12px]">{money(r.perMonth)}</td>
                    <td className="px-4 py-2.5 text-slate-700 text-[12px]">X {r.count} = {money(r.totalPay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 text-right text-[14px] font-extrabold text-slate-800">Total Fee Amount: {money(grandTotal)}</div>
        </Card>
      )}

      {/* Class fee payment details (installments) */}
      {studentId && (
        <Card noPadding title={st ? `${st.name} — Class Fee Payment Details` : "Class Fee Payment Details"}
          action={<Button size="sm" icon={<CreditCard size={14} />} disabled={!selectedRows.length} onClick={openPay}>Cash/Offline Payment</Button>}>
          {isFetching ? (
            <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !rows.length ? (
            <EmptyState icon="💳" title="No fees configured" description="Set up this class's fee structure under Fee Management → Manage Class Fee." />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[1100px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Fee Type", "Frequency", "Month Year", "Due Date", "Status", "Total Amount", "Total Paid", "Discount", "Due Amount"].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                      <th className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">
                        <label className="flex items-center gap-1.5 cursor-pointer" title="Select all due rows">
                          <input type="checkbox" disabled={!dueRows.length} checked={allDueSelected} onChange={toggleAll} className="accent-indigo-600 w-4 h-4 disabled:opacity-30" />
                          Action
                        </label>
                      </th>
                      {["Delete", "Extra"].map((h) => (
                        <th key={h} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.map((r) => (
                      <tr key={rowKey(r)} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2.5 font-semibold text-slate-800 text-[12px] whitespace-nowrap">{r.name}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-[12px]">{r.frequency}</td>
                        <td className="px-3 py-2.5 text-slate-600 text-[12px] whitespace-nowrap">{r.monthLabel}</td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px] whitespace-nowrap">{fmtDate(r.dueDate)}</td>
                        <td className="px-3 py-2.5"><Badge variant={r.status === "Success" ? "success" : "warning"}>{r.status}</Badge></td>
                        <td className="px-3 py-2.5 text-slate-700 text-[12px]">{money(r.totalAmount)}</td>
                        <td className="px-3 py-2.5 text-emerald-600 text-[12px]">{money(r.paid)}</td>
                        <td className="px-3 py-2.5 text-[12px]">
                          <span className="text-amber-600">{money(r.discount)}</span>
                          {(r.due > 0 || r.discount > 0) && <button onClick={() => onDiscount(r)} title={r.discount > 0 ? "Edit discount" : "Add discount"} className="ml-1 p-0.5 text-slate-400 hover:text-indigo-600"><Pencil size={12} /></button>}
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-red-500 text-[12px]">{money(r.due)}</td>
                        <td className="px-3 py-2.5">
                          <input type="checkbox" disabled={r.due <= 0} checked={!!selected[rowKey(r)]} onChange={() => toggle(r)} className="accent-indigo-600 w-4 h-4 disabled:opacity-30" />
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => onDelete(r)} disabled={r.paid <= 0} title="Delete payment" className="p-1 rounded text-red-400 hover:bg-red-50 disabled:opacity-30"><Trash2 size={13} /></button>
                        </td>
                        <td className="px-3 py-2.5">
                          <button onClick={() => onExtra(r)} title="Add extra fee" className="p-1 rounded text-indigo-500 hover:bg-indigo-50"><Plus size={13} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[14px] font-extrabold text-slate-800">Total Due: {money(inst?.totals?.due)}</span>
                <span className="text-[12px] text-slate-500">{selectedRows.length ? `Selected: ${money(payTotal)}` : "Tick rows in Action, then Cash/Offline Payment"}</span>
              </div>
            </>
          )}
        </Card>
      )}

      {/* Paid receipt list */}
      {studentId && receipts.length > 0 && (
        <Card noPadding title="Paid Receipt List">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[760px]">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Receipt Id", "Total Paid", "Payment Date", "Payment Type", "Status", "Remarks", "Receipt", "Revert"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {receipts.map((r) => (
                  <tr key={r.receiptNo} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600">{r.receiptNo}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-600">{money(r.total)}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px] whitespace-nowrap">{fmtDateTime(r.paidDate)}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.mode || "—"}</td>
                    <td className="px-4 py-2.5"><Badge variant="success">Success</Badge></td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] max-w-[200px] truncate">{r.note || "—"}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => printReceipt({ receiptNo: r.receiptNo, total: r.total, student: st, account: r.mode, lines: [{ name: "Fee payment", amount: r.total }] })}
                        className="text-indigo-600 text-[12px] hover:underline">Download</button>
                    </td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => onRevert(r.receiptNo)} title="Revert payment" className="p-1 rounded text-red-500 hover:bg-red-50"><Undo2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cash / Offline Payment modal */}
      <Modal open={payOpen} onClose={() => setPayOpen(false)} title="Cash/Offline Payment Details" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Select Finance Account" value={payForm.account} onChange={(e) => setPayForm((f) => ({ ...f, account: e.target.value }))}
              options={FINANCE_ACCOUNTS.map((a) => ({ value: a, label: a }))} />
            <Input label="Paying Now Amount *" value={money(payTotal)} readOnly />
            <Input label="Transaction No" value={payForm.txnNo} onChange={(e) => setPayForm((f) => ({ ...f, txnNo: e.target.value }))} />
            <Input label="Bank Name" value={payForm.bankName} onChange={(e) => setPayForm((f) => ({ ...f, bankName: e.target.value }))} />
            <Input label="Payment Details" value={payForm.details} onChange={(e) => setPayForm((f) => ({ ...f, details: e.target.value }))} />
            <Input label="Payment Date" type="date" value={payForm.date} onChange={(e) => setPayForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <Textarea label="Remarks" value={payForm.remarks} onChange={(e) => setPayForm((f) => ({ ...f, remarks: e.target.value }))} />
          <div className="flex items-center justify-between text-[13px] border-t border-slate-100 pt-3">
            <span className="text-slate-600">Total: <b>{money(payTotal)}</b></span>
            <span className="text-emerald-600">Paying: <b>{money(payTotal)}</b></span>
            <span className="text-red-500">Remaining Due: <b>{money(0)}</b></span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setPayOpen(false)}>Close</Button>
            <Button loading={collecting} onClick={addPayment}>Add Payment</Button>
          </div>
        </div>
      </Modal>

      {/* Receipt confirmation modal */}
      <Modal open={!!receipt} onClose={() => setReceipt(null)} title="Payment Receipt" size="md">
        {receipt && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[13px] font-bold text-slate-800">{receipt.student?.name}</p>
                <p className="text-[11px] text-slate-400">{receipt.student?.className}-{receipt.student?.sectionName}</p>
              </div>
              <Badge variant="success" dot>{receipt.receiptNo}</Badge>
            </div>
            <div className="border-t border-slate-100 pt-2 space-y-1">
              {receipt.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-[12.5px]"><span className="text-slate-600">{l.name}{l.month ? ` (${l.month})` : ""}</span><span className="font-semibold">{money(l.amount)}</span></div>
              ))}
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px] font-bold">
              <span>Total Paid</span><span className="text-emerald-600">{money(receipt.total)}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="secondary" icon={<FileDown size={14} />} onClick={() => printReceipt(receipt)}>Save as PDF</Button>
              <Button onClick={() => setReceipt(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
