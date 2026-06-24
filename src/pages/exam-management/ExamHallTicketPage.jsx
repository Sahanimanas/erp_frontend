import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, SearchInput } from "../../components/ui";
import { Ticket, Printer } from "lucide-react";

const SEED = [
  { id: 1, roll: "1001", name: "Aarav Sharma",  class: "Class 10", room: "Room 101", seat: "A-12" },
  { id: 2, roll: "1002", name: "Diya Patel",    class: "Class 10", room: "Room 101", seat: "A-13" },
  { id: 3, roll: "1003", name: "Vivaan Gupta",  class: "Class 10", room: "Room 102", seat: "B-04" },
];

export default function ExamHallTicketPage() {
  usePageTitle("Exam Hall Ticket");
  const [rows] = useState(SEED);
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.roll.includes(search));

  const COLUMNS = [
    { key: "roll", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "class", label: "Class" },
    { key: "room", label: "Room" },
    { key: "seat", label: "Seat" },
    { key: "id", label: "Actions", sortable: false, render: () => <Button size="xs" icon={<Printer size={11} />}>Print Ticket</Button> },
  ];

  return (
    <div>
      <PageHeader title="Exam Hall Ticket" subtitle="Generate and print admit / hall tickets" icon={<Ticket size={18} />}>
        <Button size="sm" icon={<Printer size={13} />}>Print All</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select className="w-44" options={[{ value: "", label: "Select Exam" }, { value: "hy", label: "Half Yearly" }, { value: "annual", label: "Annual" }]} />
          <Select className="w-36" options={[{ value: "", label: "All Classes" }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` }))]} />
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="w-52" />
        </div>
        <DataTable columns={COLUMNS} data={filtered} />
      </Card>
    </div>
  );
}
