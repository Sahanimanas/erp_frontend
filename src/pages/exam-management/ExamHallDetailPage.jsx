import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, Badge } from "../../components/ui";
import { Building2 } from "lucide-react";

const SEED = [
  { id: 1, hall: "Main Hall A", subject: "Mathematics", date: "10 Sep 2025", invigilator: "Mr. Rao",    students: 42 },
  { id: 2, hall: "Main Hall B", subject: "Mathematics", date: "10 Sep 2025", invigilator: "Mrs. Iyer",  students: 30 },
  { id: 3, hall: "Block C-101", subject: "Science",     date: "12 Sep 2025", invigilator: "Mr. Khan",   students: 28 },
];

export default function ExamHallDetailPage() {
  usePageTitle("Exam Hall Detail");
  const [rows] = useState(SEED);

  const COLUMNS = [
    { key: "hall", label: "Hall", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date" },
    { key: "invigilator", label: "Invigilator" },
    { key: "students", label: "Students", render: (v) => <Badge variant="info">{v}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Exam Hall Detail" subtitle="Hall-wise allocation, subjects and invigilators" icon={<Building2 size={18} />} />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-40" options={[{ value: "", label: "All Halls" }, { value: "a", label: "Main Hall A" }, { value: "b", label: "Main Hall B" }]} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
