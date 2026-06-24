import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select } from "../../components/ui";
import { ClipboardCheck, Printer } from "lucide-react";

const SEED = [
  { id: 1, room: "Room 101", class: "Class 10", students: 30, subject: "Mathematics", date: "10 Sep 2025" },
  { id: 2, room: "Room 102", class: "Class 10", students: 30, subject: "Mathematics", date: "10 Sep 2025" },
  { id: 3, room: "Room 103", class: "Class 9",  students: 28, subject: "Mathematics", date: "10 Sep 2025" },
];

export default function ExamAttendanceCardPage() {
  usePageTitle("Exam Attendance Card");
  const [rows] = useState(SEED);

  const COLUMNS = [
    { key: "room", label: "Room", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "class", label: "Class" },
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date" },
    { key: "students", label: "Students", render: (v) => <span className="font-semibold text-indigo-600">{v}</span> },
    { key: "id", label: "Actions", sortable: false, render: () => <Button size="xs" icon={<Printer size={11} />}>Print Card</Button> },
  ];

  return (
    <div>
      <PageHeader title="Exam Attendance Card" subtitle="Printable attendance sheets per exam room" icon={<ClipboardCheck size={18} />}>
        <Button size="sm" icon={<Printer size={13} />}>Print All</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "All Subjects" }, { value: "math", label: "Mathematics" }, { value: "sci", label: "Science" }]} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
