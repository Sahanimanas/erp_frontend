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
import { PageHeader, Card, Button, Select, Input, Badge } from "../../components/ui";
import { FileText, Search, CreditCard, FileDown } from "lucide-react";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useLazyExportClassFeesQuery } from "../../redux/api/paymentsApi";
import { academicMonths } from "../fee-management/_feeShared";
import { printTable } from "../../utils/printPdf";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DemandReceiptPage() {
  usePageTitle("Demand Fee Receipt");
  const navigate = useNavigate();
  const months = academicMonths();

  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [perPage, setPerPage] = useState("10");
  const [studentId, setStudentId] = useState(""); // optional student filter
  const [selMonths, setSelMonths] = useState([]);
  const [tillMonth, setTillMonth] = useState("");
  const [combined, setCombined] = useState(false);
  const [prevYearDue, setPrevYearDue] = useState(true);
  const [rows, setRows] = useState(null);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery({ classId, limit: 500 }, { skip: !classId });
  const [fetchExport, { isFetching }] = useLazyExportClassFeesQuery();

  const students = studentList?.data ?? [];
  const className = classes.find((c) => c.id === classId)?.name;
  const monthLabel = selMonths.length ? selMonths.join("; ") : "All Months";
  const toggleMonth = (m) => setSelMonths((s) => (s.includes(m) ? s.filter((x) => x !== m) : [...s, m]));

  const generate = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    try {
      let data = (await fetchExport(classId).unwrap()) || [];
      if (studentId) data = data.filter((r) => r.studentId === studentId);
      setRows(data);
    } catch (e) { toast.error(e?.data?.error || "Failed to generate"); }
  };

  const downloadReceipt = () => {
    if (!rows?.length) { toast.error("Generate the demand first"); return; }
    printTable({
      title: `${className || "Class"} — Demand Fee Receipt`,
      subtitle: [session && years.find((y) => y.id === session)?.name, monthLabel, dueDate && `Due ${dueDate}`].filter(Boolean).join("  ·  "),
      columns: ["Reg ID", "Student Name", "Father Name", "Phone", "Month", "Due Amount"],
      rows: rows.map((r) => [r.regId, r.name, r.fatherName, r.phone, monthLabel, money(r.due)]),
      footer: `Total Demand: ${money(rows.reduce((s, r) => s + Number(r.due || 0), 0))}`,
    });
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
            <Input label="No of demand per page" type="number" min="1" value={perPage} onChange={(e) => setPerPage(e.target.value)} />
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
          action={<Button size="sm" icon={<FileDown size={13} />} disabled={!rows.length} onClick={downloadReceipt}>Download Receipt</Button>}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[820px]">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {["Reg ID", "Student Name", "Father Name", "Phone Number", "Month Name", "Due Amount", "Pay Now", "Send Reminder"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {rows.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-xs text-slate-400">No students / dues for this class.</td></tr>
                ) : rows.map((r) => (
                  <tr key={r.studentId || r.rollNumber} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600">{r.regId || "—"}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12px]">{r.name}</td>
                    <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.fatherName || "—"}</td>
                    <td className="px-4 py-2.5 font-mono text-[11px]">{r.phone || "—"}</td>
                    <td className="px-4 py-2.5 text-slate-500 text-[11px] max-w-[220px] truncate" title={monthLabel}>{monthLabel}</td>
                    <td className="px-4 py-2.5"><Badge variant={Number(r.due) > 0 ? "danger" : "success"}>{money(r.due)}</Badge></td>
                    <td className="px-4 py-2.5">
                      <Button size="xs" icon={<CreditCard size={12} />} disabled={Number(r.due) <= 0}
                        onClick={() => navigate(`/payments/student-fee?id=${r.studentId}`)}>Pay Now</Button>
                    </td>
                    <td className="px-4 py-2.5"><input type="checkbox" className="accent-indigo-600 w-4 h-4" title="Send reminder (coming soon)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
