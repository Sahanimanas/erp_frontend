import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SearchInput, Input, Select, Textarea, Badge } from "../../components/ui";
import { Award, Plus } from "lucide-react";

const SEED = [
  { idx: 1, name: "A",   created: "24 Feb, 2020 12:45", from: 90.0, to: 100.0,  enabled: true },
  { idx: 1, name: "3rd", created: "17 Jun, 2026 17:39", from: 33.0, to: 100.0,  enabled: true },
  { idx: 2, name: "B",   created: "24 Feb, 2020 12:46", from: 80.0, to: 89.99,  enabled: true },
  { idx: 3, name: "C",   created: "06 Mar, 2021 11:32", from: 70.0, to: 79.99,  enabled: true },
  { idx: 4, name: "D",   created: "27 Mar, 2021 23:24", from: 60.0, to: 69.99,  enabled: true },
  { idx: 5, name: "E",   created: "27 Mar, 2021 23:25", from: 50.0, to: 59.99,  enabled: true },
  { idx: 6, name: "F",   created: "27 Mar, 2021 23:25", from: 0.0,  to: 49.99,  enabled: true },
];

export default function SetupExamGradingPage() {
  usePageTitle("Setup Exam Grading");
  const [rows, setRows] = useState(SEED);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", from: "", to: "", seq: "", remarks: "", enabled: true });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.name || form.from === "" || form.to === "") return;
    setRows((r) => [
      ...r,
      {
        idx: form.seq || r.length + 1,
        name: form.name,
        created: "22 Jun, 2026 00:00",
        from: Number(form.from),
        to: Number(form.to),
        enabled: form.enabled,
      },
    ]);
    setForm({ name: "", from: "", to: "", seq: "", remarks: "", enabled: true });
  };

  const filtered = rows.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  const COLUMNS = [
    { key: "idx", label: "Index" },
    { key: "name", label: "Grade Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "created", label: "Create Date" },
    { key: "from", label: "From Percentage", render: (v) => v.toFixed(1) },
    { key: "to", label: "To Percentage", render: (v) => v.toFixed(2) },
    { key: "enabled", label: "Enabled", render: (v) => <Badge variant={v ? "success" : "default"}>{v ? "Yes" : "No"}</Badge> },
  ];

  return (
    <div>
      <PageHeader title="Setup Exam Grading" subtitle="Configure grade bands used across report cards" icon={<Award size={18} />} />

      <div className="mb-4 rounded-lg bg-amber-400/90 px-4 py-3 text-sm font-semibold text-amber-950">
        Please Enter Exam Grading Details Carefully !!
      </div>

      <Card className="mb-5">
        <h3 className="mb-4 text-base font-semibold text-slate-700">Setup Exam Grading Configuration</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Input label="Name *" placeholder="Enter Grade Name" value={form.name} onChange={set("name")} />
          <Input label="From Percentage *" type="number" placeholder="example : 5" value={form.from} onChange={set("from")} />
          <Input label="To Percentage *" type="number" placeholder="example : 50.1" value={form.to} onChange={set("to")} />
          <Select
            label="Sequence Index *"
            value={form.seq}
            onChange={set("seq")}
            options={[{ value: "", label: "Select..." }, ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }))]}
          />
        </div>
        <div className="mt-4">
          <Textarea label="Report Card Remarks" value={form.remarks} onChange={set("remarks")} />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <input type="checkbox" className="h-4 w-4 rounded accent-emerald-500" checked={form.enabled} onChange={(e) => setForm((f) => ({ ...f, enabled: e.target.checked }))} />
            Enabled
          </label>
          <Button icon={<Plus size={13} />} onClick={submit}>Submit</Button>
        </div>
      </Card>

      <Card noPadding>
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="text-base font-semibold text-slate-700">All Exam Grading Setup List</h3>
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-52" />
        </div>
        <DataTable columns={COLUMNS} data={filtered} />
      </Card>
    </div>
  );
}
