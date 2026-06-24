import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, Badge } from "../../components/ui";
import { Send, CheckCircle } from "lucide-react";

const SEED = [
  { id: 1, exam: "Half Yearly Exam", class: "Class 10", subjects: 6, published: true },
  { id: 2, exam: "Half Yearly Exam", class: "Class 9",  subjects: 6, published: false },
  { id: 3, exam: "Unit Test 1",      class: "Class 8",  subjects: 4, published: false },
];

export default function PublishExamSchedulePage() {
  usePageTitle("Publish Exam Schedule");
  const [rows, setRows] = useState(SEED);
  const toggle = (id) => setRows((r) => r.map((x) => (x.id === id ? { ...x, published: !x.published } : x)));

  const COLUMNS = [
    { key: "exam", label: "Exam", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "class", label: "Class" },
    { key: "subjects", label: "Subjects" },
    { key: "published", label: "Status", render: (v) => <Badge variant={v ? "success" : "warning"} dot>{v ? "Published" : "Unpublished"}</Badge> },
    {
      key: "id", label: "Actions", sortable: false,
      render: (_, r) => (
        <Button size="xs" variant={r.published ? "secondary" : "primary"} icon={<CheckCircle size={11} />} onClick={() => toggle(r.id)}>
          {r.published ? "Unpublish" : "Publish"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Publish Exam Schedule" subtitle="Make schedules visible to students and parents" icon={<Send size={18} />} />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
    </div>
  );
}
