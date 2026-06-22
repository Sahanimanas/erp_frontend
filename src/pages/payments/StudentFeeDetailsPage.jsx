/**
 * Payments → Student Fee Details
 * Per-student fee snapshot for a class oriented around the monthly fee cycle:
 * last submitted date & amount, total fee, total fee left, and the current
 * month's fee status. Backed by GET /payments/fee-details.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, Badge, Button, SearchInput, EmptyState, Skeleton, ExportButton } from "../../components/ui";
import { Wallet, CreditCard } from "lucide-react";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetFeeDetailsQuery } from "../../redux/api/paymentsApi";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const STATUS_VARIANT = { Paid: "success", Pending: "danger", "N/A": "default" };

export default function StudentFeeDetailsPage() {
  usePageTitle("Student Fee Details");
  const navigate = useNavigate();
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");

  const { data: classes = [] } = useGetClassesQuery();
  const { data: rows = [], isFetching } = useGetFeeDetailsQuery(classId, { skip: !classId });

  const className = classes.find((c) => c.id === classId)?.name;
  const filtered = rows.filter(
    (r) => !search || `${r.name} ${r.rollNumber} ${r.regId}`.toLowerCase().includes(search.toLowerCase())
  );
  const curMonth = rows[0]?.currentMonth;

  const EXPORT_COLUMNS = [
    { label: "Roll No", get: (r) => r.rollNumber },
    { label: "Student", get: (r) => r.name },
    { label: "Class", get: (r) => r.class },
    { label: "Last Submitted Date", get: (r) => fmtDate(r.lastPaidDate) },
    { label: "Last Submitted Amount", get: (r) => Number(r.lastPaidAmount || 0) },
    { label: "Total Fee", get: (r) => Number(r.totalFee || 0) },
    { label: "Total Fee Left", get: (r) => Number(r.totalLeft || 0) },
    { label: `Current Month Status${curMonth ? ` (${curMonth})` : ""}`, get: (r) => r.currentMonthStatus },
  ];

  const COLS = ["Roll No", "Student", "Class", "Last Submitted Date", "Last Submitted Amount", "Total Fee", "Total Fee Left", `${curMonth || "Current Month"} Status`, ""];

  return (
    <div className="space-y-4">
      <PageHeader title="Student Fee Details" subtitle="Monthly fee status, last payment & dues per student" icon={<Wallet size={18} />} />

      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <div className="md:col-span-2">
            <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name / roll / reg id…" />
          </div>
        </div>
      </Card>

      {classId && (
        <Card noPadding title={`${className || "Class"} — Student Fee Details`}
          action={<ExportButton filename={`fee-details-${className || "class"}.csv`} rows={filtered} columns={EXPORT_COLUMNS} />}>
          {isFetching ? (
            <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : !filtered.length ? (
            <EmptyState icon="💳" title="No students / fees" description="No students with a configured fee structure for this class." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[1000px]">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {COLS.map((h, i) => (
                    <th key={i} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((r) => (
                    <tr key={r.studentId} className="hover:bg-slate-50/70">
                      <td className="px-3 py-2.5 font-mono text-[11px] text-indigo-600 whitespace-nowrap">{r.rollNumber || "—"}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-800 text-[12px] whitespace-nowrap">{r.name}</td>
                      <td className="px-3 py-2.5 text-slate-500 text-[12px] whitespace-nowrap">{r.class}</td>
                      <td className="px-3 py-2.5 text-slate-600 text-[12px] whitespace-nowrap">{fmtDate(r.lastPaidDate)}</td>
                      <td className="px-3 py-2.5 text-emerald-600 text-[12px] whitespace-nowrap">{r.lastPaidAmount ? money(r.lastPaidAmount) : "—"}</td>
                      <td className="px-3 py-2.5 text-slate-700 text-[12px] whitespace-nowrap">{money(r.totalFee)}</td>
                      <td className="px-3 py-2.5 font-semibold text-red-500 text-[12px] whitespace-nowrap">{money(r.totalLeft)}</td>
                      <td className="px-3 py-2.5"><Badge variant={STATUS_VARIANT[r.currentMonthStatus] || "default"}>{r.currentMonthStatus}</Badge></td>
                      <td className="px-3 py-2.5">
                        <Button size="xs" variant="secondary" icon={<CreditCard size={12} />} disabled={Number(r.totalLeft) <= 0}
                          onClick={() => navigate(`/payments/student-fee?id=${r.studentId}`)}>Collect</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
