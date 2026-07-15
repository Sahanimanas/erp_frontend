/**
 * Payments → Quick Collect (flexible amount)
 *
 * Unlike Student Fee Payment (which collects each installment at its exact
 * monthly amount), this page lets you take ANY amount from a student and
 * auto-distributes it across their outstanding dues — by category or by month —
 * showing a live preview of how much each fee head receives and what stays due.
 * On submit it posts one multi-line payment (the same /payments/collect endpoint).
 */
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { usePageTitle, useDebounce } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, SearchInput, Badge, Modal, EmptyState, Skeleton, Avatar, Textarea } from "../../components/ui";
import { Wallet, User, FileDown, MessageCircle } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetLedgerQuery, useGetInstallmentsQuery, useCollectPaymentMutation, useSendReceiptWhatsAppMutation } from "../../redux/api/paymentsApi";
import { printRecord } from "../../utils/printPdf";

const FINANCE_ACCOUNTS = ["Cash", "SBI Bank", "Paytm/PayPhone", "Primary Account", "All UPI", "Cheque"];
const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// "Jun-2025" → sortable integer; null/one-time rows sort last within their group.
const monthIndex = (m) => {
  if (!m) return Number.POSITIVE_INFINITY;
  const [name, year] = String(m).split("-");
  const mi = MONTHS.indexOf(name);
  if (mi < 0 || !year) return Number.POSITIVE_INFINITY;
  return Number(year) * 12 + mi;
};

/**
 * Greedily spread `amount` over the due rows. Order:
 *  - "category": clear each fee head in ledger order, oldest month first within it
 *  - "month":    clear the oldest month first across every fee head
 * Returns the collect `lines` plus any un-allocatable leftover (overpayment).
 */
function allocate(rows, amount, order, catOrder) {
  let remaining = Math.max(0, Number(amount) || 0);
  const due = rows.filter((r) => r.due > 0);
  due.sort((a, b) =>
    order === "month"
      ? monthIndex(a.month) - monthIndex(b.month) || (catOrder[a.feeTypeId] ?? 0) - (catOrder[b.feeTypeId] ?? 0)
      : (catOrder[a.feeTypeId] ?? 0) - (catOrder[b.feeTypeId] ?? 0) || monthIndex(a.month) - monthIndex(b.month)
  );
  const lines = [];
  for (const r of due) {
    if (remaining <= 0) break;
    const alloc = Math.min(remaining, r.due);
    if (alloc > 0) {
      lines.push({ feeTypeId: r.feeTypeId, name: r.name, month: r.month, monthLabel: r.monthLabel, amount: alloc });
      remaining -= alloc;
    }
  }
  return { lines, leftover: remaining };
}

export default function QuickCollectPage() {
  usePageTitle("Quick Collect");
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [mode, setMode] = useState("code");
  const [search, setSearch] = useState("");
  const [father, setFather] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState(params.get("id") || "");
  const [amount, setAmount] = useState("");
  const [order, setOrder] = useState("category"); // category | month
  const [account, setAccount] = useState("Cash");
  const [txnNo, setTxnNo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [receipt, setReceipt] = useState(null);

  // Debounced so a request fires once the user pauses, not per keystroke.
  const qSearch = useDebounce(search.trim());
  const qFather = useDebounce(father.trim());

  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList, isFetching: searching } = useGetStudentsQuery(
    { ...(mode === "code" ? { ...(qSearch && { search: qSearch }) } : { classId }), ...(qFather && { fatherName: qFather }), limit: 50 },
    { skip: mode === "code" ? !qSearch && !qFather : !classId }
  );
  const { data: ledger } = useGetLedgerQuery(studentId, { skip: !studentId });
  const { data: inst, isFetching } = useGetInstallmentsQuery(studentId, { skip: !studentId });
  const [collect, { isLoading: collecting }] = useCollectPaymentMutation();
  const [sendWhatsApp, { isLoading: sendingWa }] = useSendReceiptWhatsAppMutation();

  const onWhatsApp = async (receiptNo) => {
    try {
      const res = await sendWhatsApp(receiptNo).unwrap();
      toast.success(`Receipt sent on WhatsApp to ${res.to}`);
    } catch (e) { toast.error(e?.data?.error || "WhatsApp send failed"); }
  };

  const students = studentList?.data ?? [];
  const st = inst?.student || ledger?.student;
  const rows = inst?.rows ?? [];
  const hasQuery = mode === "code" ? !!(qSearch || qFather) : !!classId;
  const pickStudent = (id) => { setStudentId(id); setAmount(""); };
  const totalDue = Number(inst?.totals?.due ?? ledger?.totals?.due ?? 0);
  const items = ledger?.items ?? [];

  // Fee-head order from the ledger, so "by category" follows the structure order.
  const catOrder = useMemo(() => {
    const o = {};
    items.forEach((it, i) => { o[it.feeTypeId] = i; });
    return o;
  }, [items]);

  // Live allocation of the entered amount.
  const { lines, leftover } = useMemo(
    () => allocate(rows, amount, order, catOrder),
    [rows, amount, order, catOrder]
  );
  const allocated = lines.reduce((s, l) => s + l.amount, 0);

  // Per-category preview: due now vs. how much this payment covers vs. what remains.
  const catRows = useMemo(() => {
    return items
      .filter((it) => it.due > 0)
      .map((it) => {
        const got = lines.filter((l) => l.feeTypeId === it.feeTypeId).reduce((s, l) => s + l.amount, 0);
        return { feeTypeId: it.feeTypeId, name: it.name, frequency: it.frequency, due: it.due, allocated: got, remaining: it.due - got };
      });
  }, [items, lines]);

  const fillFull = () => setAmount(String(totalDue));

  const submit = async () => {
    const amt = Number(amount);
    if (!(amt > 0)) { toast.error("Enter an amount greater than 0"); return; }
    if (!lines.length) { toast.error("Nothing due to allocate this payment to"); return; }
    try {
      const res = await collect({
        studentId,
        mode: account,
        note: [txnNo && `Txn ${txnNo}`, remarks, `Auto-allocated by ${order}`].filter(Boolean).join(" · "),
        lines: lines.map(({ feeTypeId, name, month, amount }) => ({ feeTypeId, name, month, amount })),
      }).unwrap();
      setReceipt({ ...res, total: allocated, student: st, lines, account, leftover });
      setAmount("");
      toast.success(`Collected ${money(allocated)} — ${res.receiptNo}`);
    } catch (e) {
      toast.error(e?.data?.error || "Payment failed");
    }
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

  return (
    <div className="space-y-5 w-full">
      <PageHeader title="Quick Collect" subtitle="Take any amount — auto-split across category dues" icon={<Wallet size={18} />} />

      {/* Student search */}
      <Card title="Find Student">
        <div className="p-7 space-y-5">
          <div className="flex gap-4">
            {[["code", "Student Code"], ["class", "Class Filter"]].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" checked={mode === v} onChange={() => { setMode(v); setStudentId(""); }} className="accent-indigo-600" /> {l}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            {mode === "code" ? (
              <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name / father name / registration / roll / phone…" />
            ) : (
              <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
                options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            )}
            <Input label="Father Name" value={father} onChange={(e) => setFather(e.target.value)} placeholder="Search by father name…" />
          </div>
        </div>
      </Card>

      {/* Results — click a row to load that student's dues below */}
      {hasQuery && (
        <Card noPadding title={searching ? "Searching…" : `${students.length} student${students.length === 1 ? "" : "s"} found`}>
          {searching && !students.length ? (
            <div className="p-5 space-y-2">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : !students.length ? (
            <EmptyState icon={<User size={20} />} title="No students found" description="Try a different name, father name, registration or roll number." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {["Roll No", "Name", "Father Name", "Class", "Phone"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {students.map((s) => (
                    <tr key={s.id} onClick={() => pickStudent(s.id)}
                      className={`cursor-pointer ${String(s.id) === String(studentId) ? "bg-indigo-50/80" : "hover:bg-slate-50/70"}`}>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{s.rollNumber || "—"}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">
                        {[s.user?.firstName, s.user?.lastName].filter(Boolean).join(" ") || "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{s.fatherName || "—"}</td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">
                        {s.section?.class?.name ? `${s.section.class.name}-${s.section?.name || ""}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 text-[12px]">{s.user?.phone || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Profile + dues summary */}
      {studentId && st && (
        <Card className="p-7">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="w-20 h-24 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {st.photo ? <img src={st.photo} alt={st.name} className="w-full h-full object-cover" /> : <Avatar name={st.name} size="lg" />}
            </div>
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1.5 text-[13px]">
              {[["Name", st.name], ["Roll No", st.rollNumber], ["Class", `${st.className || "—"}-${st.sectionName || ""}`],
                ["Father", st.fatherName], ["Phone", st.phone], ["Reg Id", st.registrationNo]].map(([l, v]) => (
                <div key={l} className="flex gap-2"><span className="text-slate-400 font-medium">{l}:</span><span className="text-slate-800 font-semibold truncate">{v || "N/A"}</span></div>
              ))}
            </div>
            <div className="text-right shrink-0">
              <p className="text-[11px] text-slate-400 uppercase font-semibold">Total Due</p>
              <p className="text-2xl font-extrabold text-red-500">{money(totalDue)}</p>
              <Button variant="secondary" size="sm" icon={<User size={14} />} className="mt-1" onClick={() => navigate(`/students/profile?id=${studentId}`)}>Profile</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Collect — the Amount field is always shown once a student is picked, so
          it's obvious where to enter money. Allocation/preview only render when
          the student actually has dues. */}
      {studentId && (
        isFetching ? (
          <Card><div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Card>
        ) : (
          <Card title="Collect Payment">
            <div className="p-7 space-y-6">
              {/* Amount + allocation controls (always visible & editable) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Received *</label>
                  <div className="flex gap-2">
                    <Input type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
                    <Button variant="secondary" size="sm" onClick={fillFull} title="Pay full due" disabled={totalDue <= 0}>Full</Button>
                  </div>
                </div>
                <Select label="Allocate By" value={order} onChange={(e) => setOrder(e.target.value)}
                  options={[{ value: "category", label: "Category (clear head by head)" }, { value: "month", label: "Month (oldest first)" }]} />
                <Select label="Finance Account" value={account} onChange={(e) => setAccount(e.target.value)}
                  options={FINANCE_ACCOUNTS.map((a) => ({ value: a, label: a }))} />
                <Input label="Transaction No" value={txnNo} onChange={(e) => setTxnNo(e.target.value)} placeholder="UPI / Cheque ref" />
              </div>

              {/* States: no fees configured / all paid / has dues */}
              {!rows.length ? (
                <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
                  <span className="text-lg leading-none">💳</span>
                  <div className="text-[12.5px] text-amber-700">
                    <b>No fee structure for this class yet.</b> Add fee categories and amounts under{" "}
                    <span className="font-semibold">Fee Management → Class Fee Type</span> and{" "}
                    <span className="font-semibold">Manage Class Fee</span>. Once dues exist, the amount you enter here auto-splits across them.
                  </div>
                </div>
              ) : totalDue <= 0 ? (
                <div className="flex items-start gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3">
                  <span className="text-lg leading-none">✅</span>
                  <div className="text-[12.5px] text-emerald-700"><b>All dues cleared.</b> This student has nothing outstanding to collect.</div>
                </div>
              ) : (
                <>
                  {leftover > 0 && (
                    <p className="text-[12px] text-amber-600">
                      ₹{Number(leftover).toLocaleString("en-IN")} of the entered amount exceeds the total due and won't be allocated. It will not be collected.
                    </p>
                  )}

                  {/* Category-wise auto allocation preview */}
                  <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-sm min-w-[640px]">
                      <thead>
                        <tr className="bg-slate-50">
                          {["Fee Category", "Frequency", "Current Due", "Paying Now", "Remaining Due"].map((h) => (
                            <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {catRows.map((c) => (
                          <tr key={c.feeTypeId}>
                            <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{c.name}</td>
                            <td className="px-4 py-2.5 text-slate-500 text-[12px]">{c.frequency}</td>
                            <td className="px-4 py-2.5 text-slate-700 text-[12px]">{money(c.due)}</td>
                            <td className={`px-4 py-2.5 text-[12px] font-semibold ${c.allocated > 0 ? "text-emerald-600" : "text-slate-400"}`}>{money(c.allocated)}</td>
                            <td className={`px-4 py-2.5 text-[12px] font-semibold ${c.remaining > 0 ? "text-red-500" : "text-emerald-600"}`}>{money(c.remaining)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold">
                          <td className="px-4 py-2.5 text-slate-800 text-[12.5px]" colSpan={2}>Total</td>
                          <td className="px-4 py-2.5 text-slate-800 text-[12.5px]">{money(totalDue)}</td>
                          <td className="px-4 py-2.5 text-emerald-600 text-[12.5px]">{money(allocated)}</td>
                          <td className="px-4 py-2.5 text-red-500 text-[12.5px]">{money(totalDue - allocated)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <Textarea label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional note for this receipt" />

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[13px] text-slate-600">Collecting <b className="text-emerald-600">{money(allocated)}</b> across {lines.length} installment{lines.length === 1 ? "" : "s"}</span>
                    <Button icon={<Wallet size={15} />} loading={collecting} disabled={!(allocated > 0)} onClick={submit}>Collect {money(allocated)}</Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        )
      )}

      {/* Receipt modal */}
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
            <div className="border-t border-slate-100 pt-2 space-y-1 max-h-64 overflow-y-auto">
              {receipt.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-[12.5px]"><span className="text-slate-600">{l.name}{l.month ? ` (${l.month})` : ""}</span><span className="font-semibold">{money(l.amount)}</span></div>
              ))}
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-2 text-[14px] font-bold">
              <span>Total Paid</span><span className="text-emerald-600">{money(receipt.total)}</span>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="success" icon={<MessageCircle size={14} />} loading={sendingWa} onClick={() => onWhatsApp(receipt.receiptNo)}>Send WhatsApp</Button>
              <Button variant="secondary" icon={<FileDown size={14} />} onClick={() => printReceipt(receipt)}>Save as PDF</Button>
              <Button onClick={() => setReceipt(null)}>Done</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
