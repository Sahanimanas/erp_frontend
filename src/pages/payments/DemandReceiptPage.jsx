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
import { getSchool, printBill, printBills } from "../../utils/printPdf";
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

  const students = studentList?.data ?? [];
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
  // Previous Dues + each of the scoped month's configured fees so the grand
  // total matches the student's full outstanding demand. Shared by the single
  // "Bill" button and the multi-bill (6-per-page) print.
  const buildBillFor = (r) => {
    const now = new Date();
    const prev = Number(r.previousDue) || 0;
    const lines = Array.isArray(r.lines) ? r.lines : [];
    const billRows = [
      ["Prev. Dues", prev],
      ...(lines.length
        ? lines.map((l) => [`${l.name}${l.month && l.month !== "Only Once" ? ` (${l.month})` : ""}`, Number(l.amount) || 0])
        : [[`Current Dues${scopeMonth ? ` (${scopeMonth})` : ""}`, Number(r.currentDue) || 0]]),
    ];
    return {
      billType: "Demand Bill",
      billNo: `DB-${(r.regId || r.rollNumber || "").toString().slice(-6).toUpperCase()}-${now.getDate()}${now.getMonth() + 1}`,
      date: dueDate || fmtDate(now),
      month: scopeMonth || now.toLocaleDateString("en-GB", { month: "long" }),
      year: (session && years.find((y) => y.id === session)?.name) || String(now.getFullYear()),
      party: { name: r.name, className, batch: r.section, idNo: r.regId || r.rollNumber },
      rows: billRows,
      total: Number(r.totalDue ?? r.due) || 0,
      totalLabel: "Grand Total",
      note: "Kindly pay fee before 10th of the Month.",
    };
  };

  const printDemandBill = (r) => printBill(buildBillFor(r));

  const normalizeWhatsAppNumber = (phone) => {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) return `91${digits}`;
    if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
    return digits;
  };

  const reminderRowId = (r) => r.studentId || r.rollNumber || r.regId || normalizeWhatsAppNumber(r.phone);

  const pdfSafe = (v) => String(v ?? "")
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const pdfMoney = (n) => `Rs. ${Number(n || 0).toLocaleString("en-IN")}`;

  const wrapPdfText = (text, maxChars) => {
    const words = pdfSafe(text).split(" ").filter(Boolean);
    const lines = [];
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) lines.push(line);
    return lines.length ? lines : [""];
  };

  const pdfEscape = (text) => pdfSafe(text).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  const buildDemandBillPdfBase64 = (r) => {
    const bill = buildBillFor(r);
    const school = getSchool();
    const pageWidth = 595.28;
    const pageHeight = 841.89;
    const left = 58;
    const right = pageWidth - 58;
    const tableTop = 485;
    const descX = left + 12;
    const amountX = right - 12;
    const amountColX = 405;
    const commands = [];

    const text = (x, y, value, size = 10, align = "left", font = "F1") => {
      const safe = pdfEscape(value);
      const width = pdfSafe(value).length * size * 0.5;
      const tx = align === "right" ? x - width : align === "center" ? x - width / 2 : x;
      commands.push(`BT /${font} ${size} Tf ${tx.toFixed(2)} ${y.toFixed(2)} Td (${safe}) Tj ET`);
    };
    const line = (x1, y1, x2, y2) => commands.push(`${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    const rect = (x, y, w, h) => commands.push(`${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`);

    commands.push("0.9 w");
    rect(left, 96, right - left, 665);
    if (school.phone) text(right - 12, 742, school.phone, 9, "right");
    text(pageWidth / 2, 722, school.name || "School", 18, "center", "F2");
    if (school.address) text(pageWidth / 2, 706, school.address, 9, "center");
    text(pageWidth / 2, 681, "DEMAND BILL", 15, "center", "F2");
    text(pageWidth / 2, 662, pdfSafe(bill.party.name), 13, "center", "F2");
    text(pageWidth / 2, 646, `${pdfSafe(bill.party.className)}${bill.party.batch ? `-${pdfSafe(bill.party.batch)}` : ""}`, 10, "center");

    text(left + 14, 615, `Bill No: ${bill.billNo}`, 10);
    text(left + 14, 598, `ID No: ${bill.party.idNo || ""}`, 10);
    text(left + 14, 581, `Month: ${bill.month}`, 10);
    text(left + 14, 564, `Period: ${monthLabel}`, 10);
    text(amountColX, 615, `Date: ${bill.date}`, 10);
    text(amountColX, 598, `Session: ${bill.year}`, 10);
    text(amountColX, 581, `Class: ${bill.party.className || ""}`, 10);
    text(amountColX, 564, `Batch: ${bill.party.batch || ""}`, 10);

    rect(left, tableTop, right - left, 92);
    line(amountColX, tableTop, amountColX, tableTop + 92);
    line(left, tableTop + 64, right, tableTop + 64);
    line(left, tableTop + 32, right, tableTop + 32);
    text(descX, tableTop + 73, "Student", 10, "left", "F2");
    text(amountX, tableTop + 73, bill.party.name, 10, "right");
    text(descX, tableTop + 41, "Demand Period", 10, "left", "F2");
    text(amountX, tableTop + 41, monthLabel, 10, "right");
    text(descX, tableTop + 9, "Due Date", 10, "left", "F2");
    text(amountX, tableTop + 9, bill.date, 10, "right");

    const rowHeight = 24;
    const headerY = tableTop - 36;
    rect(left, headerY, right - left, rowHeight);
    line(amountColX, headerY, amountColX, headerY + rowHeight);
    text(descX, headerY + 8, "Description", 10, "left", "F2");
    text(amountX, headerY + 8, "Amount", 10, "right", "F2");

    let y = headerY - rowHeight;
    const dueRows = bill.rows.filter(([, amount]) => Number(amount) > 0);
    const rowsToPrint = dueRows.length ? dueRows : [["Current Dues", bill.total]];
    for (const [name, amount] of rowsToPrint.slice(0, 12)) {
      rect(left, y, right - left, rowHeight);
      line(amountColX, y, amountColX, y + rowHeight);
      text(descX, y + 8, wrapPdfText(name, 42)[0], 10);
      text(amountX, y + 8, pdfMoney(amount), 10, "right");
      y -= rowHeight;
    }

    rect(left, y, right - left, 30);
    line(amountColX, y, amountColX, y + 30);
    text(descX, y + 10, bill.totalLabel || "Grand Total", 12, "left", "F2");
    text(amountX, y + 10, pdfMoney(bill.total), 12, "right", "F2");
    y -= 42;

    for (const noteLine of wrapPdfText(`Note: ${bill.note}`, 70).slice(0, 3)) {
      text(left + 12, y, noteLine, 9);
      y -= 13;
    }
    text(pageWidth / 2, 122, "This is a computer generated demand bill.", 8, "center");

    const stream = commands.join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    objects.forEach((obj, idx) => {
      offsets.push(pdf.length);
      pdf += `${idx + 1} 0 obj\n${obj}\nendobj\n`;
    });
    const xref = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i += 1) pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
    const bytes = new TextEncoder().encode(pdf);
    let binary = "";
    bytes.forEach((b) => { binary += String.fromCharCode(b); });
    return btoa(binary);
  };

  const sendDemandBillPdf = async (r) => {
    const to = normalizeWhatsAppNumber(r.phone);
    const bill = buildBillFor(r);
    await apiClient.post("/whatsapp/send-media", {
      to,
      mediaType: "document",
      data: buildDemandBillPdfBase64(r),
      filename: `${bill.billNo || "demand-bill"}.pdf`,
      mimetype: "application/pdf",
      caption: `Demand bill for ${bill.party.name} - Total Due ${pdfMoney(bill.total)}`,
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
          await sendDemandBillPdf(r);
          sent += 1;
        } catch {
          failed += 1;
        }
      }
      if (failed) toast.error(`Sent ${sent}, failed ${failed}`);
      else toast.success(`Demand bill PDFs sent to ${sent} student(s)`);
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
