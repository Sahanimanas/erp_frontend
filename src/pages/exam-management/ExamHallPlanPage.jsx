import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Input, Modal, Badge } from "../../components/ui";
import { LayoutGrid, Plus, Edit2 } from "lucide-react";

const SEED = [
  { id: 1, hall: "Main Hall A", rows: 6, cols: 8, capacity: 48, allocated: 42 },
  { id: 2, hall: "Main Hall B", rows: 5, cols: 8, capacity: 40, allocated: 30 },
  { id: 3, hall: "Block C-101", rows: 5, cols: 6, capacity: 30, allocated: 28 },
];

export default function ExamHallPlanPage() {
  usePageTitle("Exam Hall Plan");
  const [rows] = useState(SEED);
  const [open, setOpen] = useState(false);

  const COLUMNS = [
    { key: "hall", label: "Hall Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "rows", label: "Rows" },
    { key: "cols", label: "Columns" },
    { key: "capacity", label: "Capacity", render: (v) => <span className="font-semibold">{v}</span> },
    { key: "allocated", label: "Allocated", render: (v) => <Badge variant="info">{v}</Badge> },
    { key: "id", label: "Actions", sortable: false, render: () => <Button size="xs" variant="secondary" icon={<Edit2 size={11} />}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Exam Hall Plan" subtitle="Define exam halls and their seating capacity" icon={<LayoutGrid size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Add Hall</Button>
      </PageHeader>
      <Card noPadding>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Hall">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Hall Name *" placeholder="e.g. Main Hall A" />
          <Input label="Capacity" type="number" placeholder="48" />
          <Input label="Rows *" type="number" placeholder="6" />
          <Input label="Columns *" type="number" placeholder="8" />
        </div>
        <div className="mt-5 flex gap-2"><Button className="flex-1">Save</Button><Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button></div>
      </Modal>
    </div>
  );
}
