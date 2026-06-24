import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, ExportButton, SummaryCards } from "../../components/ui";
import { Eye } from "lucide-react";

const SEED = [
  { id: 1, roll: "1001", name: "Aarav Sharma", subject: "Mathematics", date: "10 Sep 2025", status: "Present" },
  { id: 2, roll: "1002", name: "Diya Patel",   subject: "Mathematics", date: "10 Sep 2025", status: "Present" },
  { id: 3, roll: "1003", name: "Vivaan Gupta", subject: "Mathematics", date: "10 Sep 2025", status: "Absent" },
  { id: 4, roll: "1004", name: "Ananya Singh", subject: "Mathematics", date: "10 Sep 2025", status: "Present" },
];

export default function ViewExamAttendancePage() {
  usePageTitle("View Exam Attendance");
  const [rows] = useState(SEED);
  const present = rows.filter((r) => r.status === "Present").length;

  const CARDS = [
    { label: "Total", value: rows.length },
    { label: "Present", value: present },
    { label: "Absent", value: rows.length - present },
  ];

  const COLUMNS = [
    { key: "roll", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date" },
    { key: "status", label: "Status" },
  ];
  const EXPORT_COLUMNS = [
    { label: "Roll No", get: (r) => r.roll },
    { label: "Student", get: (r) => r.name },
    { label: "Subject", get: (r) => r.subject },
    { label: "Date", get: (r) => r.date },
    { label: "Status", get: (r) => r.status },
  ];

  return (
    <div>
      <PageHeader title="View Exam Attendance" subtitle="Review recorded exam attendance" icon={<Eye size={18} />} />
      <SummaryCards cards={CARDS} className="mb-4" />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "All Classes" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))]} />
          <ExportButton filename="exam-attendance.csv" rows={rows} columns={EXPORT_COLUMNS} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
