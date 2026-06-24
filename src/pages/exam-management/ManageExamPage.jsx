import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SearchInput, Input, Select, Modal, Badge } from "../../components/ui";
import { ClipboardList, Plus, Edit2 } from "lucide-react";

const SEED = [
  { id: 1, name: "Half Yearly Exam", type: "Term", session: "2025-2026", from: "10 Sep 2025", to: "20 Sep 2025", status: "active" },
  { id: 2, name: "Unit Test 1",      type: "Unit", session: "2025-2026", from: "12 Jul 2025", to: "14 Jul 2025", status: "active" },
  { id: 3, name: "Annual Exam",      type: "Term", session: "2025-2026", from: "01 Mar 2026", to: "15 Mar 2026", status: "draft" },
];
const BADGE = { active: "success", draft: "warning", closed: "default" };

export default function ManageExamPage() {
  usePageTitle("Manage Exam");
  const [rows] = useState(SEED);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  const COLUMNS = [
    { key: "name", label: "Exam Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "type", label: "Exam Type" },
    { key: "session", label: "Session" },
    { key: "from", label: "From Date" },
    { key: "to", label: "To Date" },
    { key: "status", label: "Status", render: (v) => <Badge variant={BADGE[v]} dot>{v}</Badge> },
    { key: "id", label: "Actions", sortable: false, render: () => <Button size="xs" variant="secondary" icon={<Edit2 size={11} />}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Manage Exam" subtitle="Create and maintain examination terms" icon={<ClipboardList size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Add Exam</Button>
      </PageHeader>
      <Card noPadding>
        <div className="border-b border-slate-100 p-4">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search exams..." className="w-52" />
        </div>
        <DataTable columns={COLUMNS} data={filtered} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Exam">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Exam Name *" placeholder="e.g. Annual Exam" />
          <Select label="Exam Type *" options={[{ value: "", label: "Select" }, { value: "term", label: "Term" }, { value: "unit", label: "Unit" }]} />
          <Input label="From Date *" type="date" />
          <Input label="To Date *" type="date" />
        </div>
        <div className="mt-5 flex gap-2"><Button className="flex-1">Save</Button><Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button></div>
      </Modal>
    </div>
  );
}
