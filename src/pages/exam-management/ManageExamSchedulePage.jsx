import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, Input, Modal, Badge } from "../../components/ui";
import { CalendarClock, Plus, Edit2 } from "lucide-react";

const SEED = [
  { id: 1, subject: "Mathematics", date: "10 Sep 2025", start: "09:00 AM", end: "12:00 PM", room: "Room 101", marks: 100 },
  { id: 2, subject: "Science",     date: "12 Sep 2025", start: "09:00 AM", end: "12:00 PM", room: "Room 102", marks: 100 },
  { id: 3, subject: "English",     date: "14 Sep 2025", start: "09:00 AM", end: "11:30 AM", room: "Room 103", marks: 80 },
];

export default function ManageExamSchedulePage() {
  usePageTitle("Manage Exam Schedule");
  const [rows] = useState(SEED);
  const [open, setOpen] = useState(false);

  const COLUMNS = [
    { key: "subject", label: "Subject", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "date", label: "Exam Date" },
    { key: "start", label: "Start Time" },
    { key: "end", label: "End Time" },
    { key: "room", label: "Room" },
    { key: "marks", label: "Total Marks", render: (v) => <span className="font-semibold">{v}</span> },
    { key: "id", label: "Actions", sortable: false, render: () => <Button size="xs" variant="secondary" icon={<Edit2 size={11} />}>Edit</Button> },
  ];

  return (
    <div>
      <PageHeader title="Manage Exam Schedule" subtitle="Assign subjects, dates and rooms for an exam" icon={<CalendarClock size={18} />}>
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Add Schedule</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "All Classes" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))]} />
        </div>
        <DataTable columns={COLUMNS} data={rows} />
      </Card>
      <Modal open={open} onClose={() => setOpen(false)} title="Add Schedule Row">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Subject *" options={[{ value: "", label: "Select" }, { value: "math", label: "Mathematics" }, { value: "sci", label: "Science" }]} />
          <Input label="Exam Date *" type="date" />
          <Input label="Start Time *" type="time" />
          <Input label="End Time *" type="time" />
          <Input label="Room" placeholder="e.g. Room 101" />
          <Input label="Total Marks *" type="number" placeholder="100" />
        </div>
        <div className="mt-5 flex gap-2"><Button className="flex-1">Save</Button><Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button></div>
      </Modal>
    </div>
  );
}
