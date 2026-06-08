/**
 * Payments → Monthly Fee Payment
 * Class-wise dues view for a chosen session + month, exportable. Collection of a
 * specific student is done from Student Fee Payment.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Badge } from "../../components/ui";
import { CalendarClock, Download, Search, CreditCard } from "lucide-react";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { useLazyExportClassFeesQuery } from "../../redux/api/paymentsApi";
import { academicMonths } from "../fee-management/_feeShared";
import { exportRows, autoColumns } from "../../utils/exportExcel";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function MonthlyFeePaymentPage() {
  usePageTitle("Monthly Fee Payment");
  const navigate = useNavigate();
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [month, setMonth] = useState("");
  const [rows, setRows] = useState(null);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [fetchExport, { isFetching }] = useLazyExportClassFeesQuery();
  const months = academicMonths();

  const run = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    try { setRows((await fetchExport(classId).unwrap()) || []); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "name", label: "Student" },
    { key: "expected", label: "Expected", render: (v) => money(v) },
    { key: "paid", label: "Paid", render: (v) => <span className="text-emerald-600">{money(v)}</span> },
    { key: "due", label: "Due", render: (v) => <Badge variant={Number(v) > 0 ? "danger" : "success"}>{money(v)}</Badge> },
    { key: "actions", label: "", sortable: false, render: () => (
        <Button size="xs" icon={<CreditCard size={12} />} onClick={() => navigate("/payments/student-fee")}>Collect</Button>
      ) },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Monthly Fee Payment" subtitle="Class dues by month" icon={<CalendarClock size={18} />} />
      <Card title="Student Fee Payment">
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Month" value={month} onChange={(e) => setMonth(e.target.value)}
            options={[{ value: "", label: "Select Month" }, ...months.map((m) => ({ value: m, label: m }))]} />
          <Button icon={<Search size={14} />} loading={isFetching} onClick={run}>Submit</Button>
        </div>
      </Card>
      {rows && (
        <Card noPadding>
          <div className="p-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[12px] text-slate-500 px-2">{rows.length} student(s){month ? ` · ${month}` : ""}</span>
            <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length} onClick={() => exportRows(`monthly-fees-${classId}.csv`, rows, autoColumns(rows))}>Export Excel</Button>
          </div>
          <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No students / dues." />
        </Card>
      )}
    </div>
  );
}
