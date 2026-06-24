import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, ExportButton } from "../../components/ui";
import { CalendarDays } from "lucide-react";

const SEED = [
  { id: 1, subject: "Mathematics", date: "10 Sep 2025", day: "Wednesday", time: "09:00 AM - 12:00 PM", room: "Room 101" },
  { id: 2, subject: "Science",     date: "12 Sep 2025", day: "Friday",    time: "09:00 AM - 12:00 PM", room: "Room 102" },
  { id: 3, subject: "English",     date: "14 Sep 2025", day: "Sunday",    time: "09:00 AM - 11:30 AM", room: "Room 103" },
  { id: 4, subject: "Social Studies", date: "16 Sep 2025", day: "Tuesday", time: "09:00 AM - 11:30 AM", room: "Room 101" },
];

export default function ViewExamSchedulePage() {
  usePageTitle("View Exam Schedule");
  const [rows] = useState(SEED);

  const COLUMNS = [
    { key: "subject", label: "Subject", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "date", label: "Date" },
    { key: "day", label: "Day" },
    { key: "time", label: "Time" },
    { key: "room", label: "Room" },
  ];
  const EXPORT_COLUMNS = [
    { label: "Subject", get: (r) => r.subject },
    { label: "Date", get: (r) => r.date },
    { label: "Day", get: (r) => r.day },
    { label: "Time", get: (r) => r.time },
    { label: "Room", get: (r) => r.room },
  ];

  return (
    <div>
      <PageHeader title="View Exam Schedule" subtitle="Read-only timetable for a selected exam and class" icon={<CalendarDays size={18} />} />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "All Classes" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))]} />
          <ExportButton filename="exam-schedule.csv" rows={rows} columns={EXPORT_COLUMNS} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
