import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, Badge } from "../../components/ui";
import { UserCheck, Save } from "lucide-react";

const SEED = [
  { id: 1, roll: "1001", name: "Aarav Sharma", present: true },
  { id: 2, roll: "1002", name: "Diya Patel",   present: true },
  { id: 3, roll: "1003", name: "Vivaan Gupta", present: false },
  { id: 4, roll: "1004", name: "Ananya Singh", present: true },
];

export default function StudentExamAttendancePage() {
  usePageTitle("Student Exam Attendance");
  const [rows, setRows] = useState(SEED);
  const toggle = (id) => setRows((r) => r.map((x) => (x.id === id ? { ...x, present: !x.present } : x)));

  const COLUMNS = [
    { key: "roll", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "present", label: "Status", render: (v) => <Badge variant={v ? "success" : "danger"} dot>{v ? "Present" : "Absent"}</Badge> },
    {
      key: "id", label: "Mark", sortable: false,
      render: (_, r) => (
        <Button size="xs" variant={r.present ? "secondary" : "primary"} onClick={() => toggle(r.id)}>
          {r.present ? "Mark Absent" : "Mark Present"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Student Exam Attendance" subtitle="Record attendance for an exam sitting" icon={<UserCheck size={18} />}>
        <Button size="sm" icon={<Save size={13} />}>Save</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "Select Class" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))]} />
          <Select className="w-40" options={[{ value: "", label: "Select Subject" }, { value: "math", label: "Mathematics" }, { value: "sci", label: "Science" }]} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
