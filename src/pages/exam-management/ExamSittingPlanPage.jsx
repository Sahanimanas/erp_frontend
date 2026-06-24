import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select } from "../../components/ui";
import { Armchair, Shuffle, Printer } from "lucide-react";

const SEED = [
  { id: 1, seat: "A-01", roll: "1001", name: "Aarav Sharma", class: "Class 10", hall: "Main Hall A" },
  { id: 2, seat: "A-02", roll: "1002", name: "Diya Patel",   class: "Class 10", hall: "Main Hall A" },
  { id: 3, seat: "A-03", roll: "1003", name: "Vivaan Gupta", class: "Class 10", hall: "Main Hall A" },
  { id: 4, seat: "A-04", roll: "1004", name: "Ananya Singh", class: "Class 9",  hall: "Main Hall A" },
];

export default function ExamSittingPlanPage() {
  usePageTitle("Exam Sitting Plan");
  const [rows] = useState(SEED);

  const COLUMNS = [
    { key: "seat", label: "Seat No", render: (v) => <span className="font-semibold text-indigo-600">{v}</span> },
    { key: "roll", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "class", label: "Class" },
    { key: "hall", label: "Hall" },
  ];

  return (
    <div>
      <PageHeader title="Exam Sitting Plan" subtitle="Generate and print student seat allocation" icon={<Armchair size={18} />}>
        <Button size="sm" variant="secondary" icon={<Shuffle size={13} />}>Auto Generate</Button>
        <Button size="sm" icon={<Printer size={13} />}>Print</Button>
      </PageHeader>
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
