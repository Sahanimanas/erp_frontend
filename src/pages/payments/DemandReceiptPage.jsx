/**
 * Payments → Demand Fee Receipt
 * Per-student demand (expected/paid/due) for a class, exportable to Excel.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, Badge } from "../../components/ui";
import { FileText, Download, Search } from "lucide-react";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { useLazyExportClassFeesQuery } from "../../redux/api/paymentsApi";
import { exportRows, autoColumns } from "../../utils/exportExcel";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

export default function DemandReceiptPage() {
  usePageTitle("Demand Fee Receipt");
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState(null);

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [fetchExport, { isFetching }] = useLazyExportClassFeesQuery();

  const generate = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    try {
      const data = await fetchExport(classId).unwrap();
      setRows(data || []);
    } catch (e) { toast.error(e?.data?.error || "Failed to generate"); }
  };

  const doExport = () => {
    if (!rows?.length) { toast.error("Nothing to export"); return; }
    exportRows(`demand-receipt-${classId}.csv`, rows, autoColumns(rows));
  };

  const columns = [
    { key: "rollNumber", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600">{v}</span> },
    { key: "name", label: "Student" },
    { key: "class", label: "Class" },
    { key: "expected", label: "Expected", render: (v) => money(v) },
    { key: "paid", label: "Paid", render: (v) => <span className="text-emerald-600">{money(v)}</span> },
    { key: "due", label: "Due", render: (v) => <Badge variant={Number(v) > 0 ? "danger" : "success"}>{money(v)}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Demand Fee Receipt" subtitle="Outstanding dues per student" icon={<FileText size={18} />} />
      <Card title="Student Demand Fee Receipt">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Button icon={<Search size={14} />} loading={isFetching} onClick={generate}>Submit</Button>
        </div>
      </Card>

      {rows && (
        <Card noPadding>
          <div className="p-3 flex items-center justify-between border-b border-slate-100">
            <span className="text-[12px] text-slate-500 px-2">{rows.length} student(s)</span>
            <Button size="sm" variant="secondary" icon={<Download size={13} />} disabled={!rows.length} onClick={doExport}>Export Excel</Button>
          </div>
          <DataTable columns={columns} data={rows} loading={isFetching} emptyText="No students / dues for this class." />
        </Card>
      )}
    </div>
  );
}
