/**
 * Payments → Demand Fee Receipt
 * Per-student outstanding demand for a class/session over selected months, with
 * a printable demand receipt. Uses the same per-student ledger export the
 * Monthly Fee Payment page uses, so dues stay in sync across the app.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, Badge, Modal, Pagination } from "../../components/ui";
import { FileText, Search, CreditCard, FileDown, Printer, MessageCircle } from "lucide-react";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useLazyGetMonthlyDuesQuery } from "../../redux/api/paymentsApi";
import { academicMonths } from "../fee-management/_feeShared";
import { printBills, billToPdfBase64 } from "../../utils/printPdf";
import apiClient from "../../services/axios";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function DemandReceiptPage() {
  usePageTitle("Demand Fee Receipt");
  const navigate = useNavigate();
  const months = academicMonths();

  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [perPage, setPerPage] = useState("10"); // table rows per page
  const [studentId, setStudentId] = useState(""); // optional student filter
  const [selMonths, setSelMonths] = useState([]);
  const [tillMonth, setTillMonth] = useState("");
  const [combined, setCombined] = useState(false);
  const [prevYearDue, setPrevYearDue] = useState(true);
  const [rows, setRows] = useState(null);
  const [page, setPage] = useState(1); // table pagination
  // Print-range modal (which students to print bills for).
  const [printOpen, setPrintOpen] = useState(false);
  const [rangeFrom, setRangeFrom] = useState("1");
  const [rangeTo, setRangeTo] = useState("");
  const [billsPerPage, setBillsPerPage] = useState("6"); // demand bills per printed sheet
  const [sendingReminderId, setSendingReminderId] = useState("");
  const [sendingAll, setSendingAll] = useState(false);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery({ classId, limit: 500 }, { skip: !classId });
  const [fetchDues, { isFetching }] = useLazyGetMonthlyDuesQuery();

  // Deactivated students get no demand bill, so they aren't offered here either.
  const students = (studentList?.data ?? []).filter((s) => s.isActive !== false);
  const className = classes.find((c) => c.id === classId)?.name;
  const toggleMonth = (m) => setSelMonths((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));
  // Dues are scoped to a single month boundary. "Till Month" wins when set —
  // it means "everything due up to and including this month" (cumulative).
  // Otherwise fall back to the latest selected chip. Everything due before the
  // boundary is "previous due"; that month's configured fees are the "current
  // due". Nothing chosen → the whole outstanding ledger.
  const scopeMonth = tillMonth || (selMonths.length ? months.filter((m) => selMonths.includes(m)).slice(-1)[0] : "");
  const monthLabel = tillMonth ? `Up to ${tillMonth}` : (selMonths.length ? selMonths.join("; ") : "All Months");

  // Client-side table pagination ("No of demand per page" = page size).
  const pageSize = Math.max(1, Number(perPage) || 10);
  const pagedRows = rows ? rows.slice((page - 1) * pageSize, page * pageSize) : [];

  const generate = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    try {
      let data = (await fetchDues({ classId, month: scopeMonth }).unwrap()) || [];
      if (studentId) data = data.filter((r) => r.studentId === studentId);
      setRows(data);
      setPage(1);
    } catch (e) { toast.error(e?.data?.error || "Failed to generate"); }
  };

  // Build ONE student's demand bill object (compact bill format). Itemises
  // Previous Dues + each of the scoped month's configured fees — each with its
  // Fee | Discount | Due | Paid breakdown — so the grand total matches the
  // student's full outstanding demand. Shared by the single "Bill" button and
  // the multi-bill (6-per-page) print.
  const buildBillFor = (r) => {
    const now = new Date();
    const prev = Number(r.previousDue) || 0;
    const lines = Array.isArray(r.lines) ? r.lines : [];
    // Older servers only send the due amount; treat it as the full fee then.
    const line = (name, due, fee, discount, paid) => ({
      name, due, fee: fee ?? due, discount: Number(discount) || 0, paid: Number(paid) || 0,
    });
    const billRows = [
      line("Prev. Dues", prev, r.previousFee, r.previousDiscount, r.previousPaid),
      ...(lines.length
        ? lines.map((l) => line(`${l.name}${l.month && l.month !== "Only Once" ? ` (${l.month})` : ""}`, Number(l.amount) || 0, l.fee, l.discount, l.paid))
        : [line(`Current Dues${scopeMonth ? ` (${scopeMonth})` : ""}`, Number(r.currentDue) || 0)]),
    ];
    return {
      billType: "Demand Bill",
      billNo: `DB-${(r.regId || r.rollNumber || "").toString().slice(-6).toUpperCase()}-${now.getDate()}${now.getMonth() + 1}`,
      date: dueDate || fmtDate(now),
      month: scopeMonth || now.toLocaleDateString("en-GB", { month: "long" }),
      year: (session && years.find((y) => y.id === session)?.name) || String(now.getFullYear()),
      party: { name: r.name, fatherName: r.fatherName, className, batch: r.section, idNo: r.regId || r.rollNumber },
      rows: billRows,
      total: Number(r.totalDue ?? r.due) || 0,
      totalLabel: "Grand Total",
      note: "Kindly pay fee before 10th of the Month.",
    };
  };

  // One bill prints through the SAME compact sheet layout as the bulk print, so
  // a single slip comes out the same size as one from a 6-per-page sheet
  // (top-left of the sheet) instead of being blown up to fill the whole page.
  const printDemandBill = (r) =>
    printBills({ bills: [buildBillFor(r)], perPage: Math.max(1, Number(billsPerPage) || 6) });

  const normalizeWhatsAppNumber = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
    return digits;
  };

  const reminderRowId = (r) => r.studentId || r.rollNumber || r.regId || normalizeWhatsAppNumber(r.phone);

  const pdfMoney = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

  const sendDemandBillPdf = async (r, { bulk = false } = {}) => {
    const to = normalizeWhatsAppNumber(r.phone);
    const bill = buildBillFor(r);
    // Render the SAME bill layout used for the on-screen download, so the
    // WhatsApp copy is identical to what the office prints (not a plain fallback).
    // `bulk` paces a whole class ≈1 min apart on the server to dodge rate limits.
    await apiClient.post("/whatsapp/send-media", {
      to,
      mediaType: "document",
      data: await billToPdfBase64(bill),
      filename: `${bill.billNo || "demand-bill"}.pdf`,
      mimetype: "application/pdf",
      caption: `Demand bill for ${bill.party.name} - Total Due ${pdfMoney(bill.total)}`,
      bulk,
    });
  };

  const sendDemandReminder = async (r) => {
    const to = normalizeWhatsAppNumber(r.phone);
    if (!to) { toast.error("This student has no phone number"); return; }
    if (Number(r.totalDue ?? r.due) <= 0) { toast.error("No dues to send for this student"); return; }

    setSendingReminderId(reminderRowId(r));
    try {
      await sendDemandBillPdf(r);
      toast.success(`Demand bill PDF sent on WhatsApp to ${r.phone}`);
    } catch (e) {
      toast.error(e.response?.data?.error || "WhatsApp PDF send failed");
    } finally {
      setSendingReminderId("");
    }
  };

  const sendAllDemandReminders = async () => {
    if (!rows?.length) { toast.error("Generate the demand first"); return; }
    const targets = rows.filter((r) => normalizeWhatsAppNumber(r.phone) && Number(r.totalDue ?? r.due) > 0);
    if (!targets.length) { toast.error("No students with phone numbers and dues"); return; }
    if (!window.confirm(`Send demand bill PDFs to ${targets.length} student(s)?`)) return;

    setSendingAll(true);
    let sent = 0;
    let failed = 0;
    try {
      for (const r of targets) {
        setSendingReminderId(reminderRowId(r));
        try {
          await sendDemandBillPdf(r, { bulk: true });
          sent += 1;
        } catch {
          failed += 1;
        }
      }
      if (failed) toast.error(`Queued ${sent}, failed ${failed}`);
      else toast.success(`Queued ${sent} demand bill PDF(s) — WhatsApp will send about one per minute`);
    } finally {
      setSendingReminderId("");
      setSendingAll(false);
    }
  };

  // "Download Receipt" → ask which students + how many per sheet, then print the
  // demand bills in a grid (default 6 per page, like ID cards).
  const downloadReceipt = () => {
    if (!rows?.length) { toast.error("Generate the demand first"); return; }
    setRangeFrom("1");
    setRangeTo(String(rows.length));
    setPrintOpen(true);
  };

  const doPrintBills = () => {
    const total = rows?.length || 0;
    const from = Math.max(1, Math.min(total, Number(rangeFrom) || 1));
    const to = Math.max(from, Math.min(total, Number(rangeTo) || total));
    const per = Math.max(1, Number(billsPerPage) || 6);
    const slice = rows.slice(from - 1, to);
    if (!slice.length) { toast.error("No students in that range"); return; }
    printBills({ bills: slice.map(buildBillFor), perPage: per });
    setPrintOpen(false);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Demand Fee Receipt" subtitle="Outstanding dues per student" icon={<FileText size={18} />} />

      <Card title="Student Demand Fee Receipt">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select label="Session *" value={session} onChange={(e) => setSession(e.target.value)}
              options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
            <Select label="Class *" value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}
              options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            <Input label="Due Date *" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            <Input label="No of demand per page" type="number" min="1" value={perPage} onChange={(e) => { setPerPage(e.target.value); setPage(1); }} />
            <Select label="Student Filter" value={studentId} onChange={(e) => setStudentId(e.target.value)}
              options={[{ value: "", label: classId ? "All Students" : "Pick a class first" },
                ...students.map((s) => ({ value: s.id, label: `${s.user?.firstName} ${s.user?.lastName} [${s.registrationNo || s.rollNumber}]` }))]} />
            <Select label="Till Month" value={tillMonth} onChange={(e) => setTillMonth(e.target.value)}
              options={[{ value: "", label: "Select" }, ...months.map((m) => ({ value: m, label: m }))]} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">Select Month *</label>
            <div className="flex flex-wrap gap-1.5">
              {months.map((m) => (
                <button key={m} type="button" onClick={() => toggleMonth(m)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${selMonths.includes(m) ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-8 items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={combined} onChange={(e) => setCombined(e.target.checked)} className="accent-indigo-600 w-4 h-4" />
              Fee Detail Combined
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={prevYearDue} onChange={(e) => setPrevYearDue(e.target.checked)} className="accent-emerald-600 w-4 h-4" />
              All Previous Year Due Include
            </label>
            <Button className="ml-auto" icon={<Search size={14} />} loading={isFetching} onClick={generate}>Submit</Button>
          </div>
        </div>
      </Card>

      {rows && (
        <Card noPadding title={`${monthLabel} Class Fee Payment Details`}
          action={(
            <>
              <Button size="sm" variant="success" icon={<MessageCircle size={13} />} loading={sendingAll} disabled={!rows.length} onClick={sendAllDemandReminders}>
                Send All PDFs
              </Button>
              <Button size="sm" icon={<FileDown size={13} />} disabled={!rows.length || sendingAll} onClick={downloadReceipt}>Download Receipt</Button>
            </>
          )}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Reg ID", "Student Name", "Father Name", "Phone Number", "Month Name", "Prev. Due", "Current Due", "Total Due", "Pay Now", "Send PDF"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length === 0 ? (
                  <tr><td colSpan={10} className="px-4 py-10 text-center text-xs text-slate-400">No students / dues for this class.</td></tr>
                ) : pagedRows.map((r) => (
                  <tr key={r.studentId || r.rollNumber} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600">{r.regId || "—"}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12px]">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.fatherName || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px]">{r.phone || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] max-w-[220px] truncate" title={monthLabel}>{monthLabel}</td>
                    <td className="px-4 py-2.5 text-[12px]"><span className={Number(r.previousDue) > 0 ? "text-amber-600 font-semibold" : "text-slate-400"}>{money(r.previousDue)}</span></td>
                    <td className="px-4 py-2.5"><Badge variant={Number(r.currentDue) > 0 ? "danger" : "success"}>{money(r.currentDue)}</Badge></td>
                    <td className="px-4 py-2.5 font-bold text-slate-800 text-[12px]">{money(r.totalDue ?? r.due)}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1.5">
                        <Button size="xs" icon={<CreditCard size={12} />} disabled={Number(r.due) <= 0}
                          onClick={() => navigate(`/payments/student-fee?id=${r.studentId}`)}>Pay Now</Button>
                        <Button size="xs" variant="secondary" icon={<Printer size={12} />} title="Print demand bill"
                          onClick={() => printDemandBill(r)}>Bill</Button>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Button
                        size="xs"
                        variant="success"
                        icon={<MessageCircle size={12} />}
                        loading={sendingReminderId === reminderRowId(r)}
                        disabled={sendingAll || !r.phone || Number(r.totalDue ?? r.due) <= 0}
                        title="Send demand bill PDF on WhatsApp"
                        onClick={() => sendDemandReminder(r)}
                      >
                        {sendingReminderId === reminderRowId(r) ? "Sending" : "PDF"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-500">
                Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, rows.length)} of {rows.length}
              </span>
              <Pagination page={page} total={rows.length} pageSize={pageSize} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}

      {/* Print-range chooser — bills printed in a grid (default 6 per sheet). */}
      <Modal open={printOpen} onClose={() => setPrintOpen(false)} title="Print Demand Bills" size="md">
        <div className="space-y-4">
          <p className="text-[12px] text-slate-500">
            {rows?.length || 0} student(s) generated. Choose which students to print and how many bills per page.
          </p>
          <div className="grid grid-cols-3 gap-3">
            <Input label="From #" type="number" min="1" max={rows?.length || 1} value={rangeFrom} onChange={(e) => setRangeFrom(e.target.value)} />
            <Input label="To #" type="number" min="1" max={rows?.length || 1} value={rangeTo} onChange={(e) => setRangeTo(e.target.value)} />
            <Input label="Bills / page" type="number" min="1" max="12" value={billsPerPage} onChange={(e) => setBillsPerPage(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "All", from: 1, to: rows?.length || 1 },
              { label: "First 6", from: 1, to: Math.min(6, rows?.length || 1) },
              { label: "First 30", from: 1, to: Math.min(30, rows?.length || 1) },
            ].map((q) => (
              <button key={q.label} type="button" onClick={() => { setRangeFrom(String(q.from)); setRangeTo(String(q.to)); }}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold border bg-white text-slate-500 border-slate-200 hover:border-indigo-300">
                {q.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400">
            Printing students {Math.max(1, Number(rangeFrom) || 1)}–{Math.min(rows?.length || 0, Number(rangeTo) || (rows?.length || 0))}
            {" · "}{Math.max(1, Number(perPage) || 6)} bills per page.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setPrintOpen(false)}>Cancel</Button>
            <Button icon={<Printer size={14} />} onClick={doPrintBills}>Print Bills</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
