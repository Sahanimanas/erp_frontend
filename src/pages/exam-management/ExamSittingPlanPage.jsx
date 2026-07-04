/**
 * Exam Management → Exam Sitting Plan
 * Auto-allocate seats (classes → halls, by roll order) for a session's exam,
 * view/filter the allocation and print it.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, Modal } from "../../components/ui";
import { Armchair, Shuffle, Printer } from "lucide-react";
import { useGetHallsQuery, useGetSeatingQuery, useGenerateSeatingMutation } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions } from "./_examShared";
import { printTable } from "../../utils/printPdf";

export default function ExamSittingPlanPage() {
  usePageTitle("Exam Sitting Plan");
  const { years, session, setSession, sessionName, exams, examId, setExamId, exam } = useSessionExams();
  const classes = useOrderedClasses();
  const { data: halls = [] } = useGetHallsQuery();
  const [hallId, setHallId] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [genOpen, setGenOpen] = useState(false);
  const [genClasses, setGenClasses] = useState([]);
  const [genHalls, setGenHalls] = useState([]);

  const { data: seats = [], isFetching } = useGetSeatingQuery(
    { examId, hallId: hallId || undefined, classId: classFilter || undefined },
    { skip: !examId }
  );
  const [generate, { isLoading: generating }] = useGenerateSeatingMutation();

  const toggle = (list, setList, id) => setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const runGenerate = async () => {
    if (!genClasses.length || !genHalls.length) { toast.error("Pick at least one class and one hall"); return; }
    try {
      const res = await generate({ examId, classIds: genClasses, hallIds: genHalls }).unwrap();
      toast.success(`Allocated ${res.allocated} seat(s) across ${res.halls} hall(s)`);
      setGenOpen(false);
    } catch (e) { toast.error(e?.data?.error || "Failed to generate sitting plan"); }
  };

  const COLUMNS = [
    { key: "seatNo", label: "Seat No", render: (v) => <span className="font-semibold text-indigo-600">{v}</span> },
    { key: "rollNumber", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "className", label: "Class", render: (v, r) => `${v || ""}${r.sectionName ? `/${r.sectionName}` : ""}` },
    { key: "hall", label: "Hall", sortable: false, render: (v) => v?.name },
  ];

  const print = () => printTable({
    title: `${exam?.name || "Exam"} — Sitting Plan`,
    subtitle: [sessionName && `Session ${sessionName}`, hallId && halls.find((h) => h.id === hallId)?.name].filter(Boolean).join("  ·  "),
    columns: ["Seat No", "Roll No", "Student", "Class", "Hall"],
    rows: seats.map((s) => [s.seatNo, s.rollNumber, s.name, `${s.className || ""}${s.sectionName ? `/${s.sectionName}` : ""}`, s.hall?.name]),
    footer: `${seats.length} seat(s)`,
  });

  return (
    <div>
      <PageHeader title="Exam Sitting Plan" subtitle="Generate and print student seat allocation" icon={<Armchair size={18} />}>
        <Button size="sm" variant="secondary" icon={<Shuffle size={13} />} disabled={!examId} onClick={() => { setGenClasses([]); setGenHalls(halls.map((h) => h.id)); setGenOpen(true); }}>Auto Generate</Button>
        <Button size="sm" icon={<Printer size={13} />} disabled={!seats.length} onClick={print}>Print</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-44" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-56" />
          <Select value={hallId} onChange={(e) => setHallId(e.target.value)} options={[{ value: "", label: "All Halls" }, ...halls.map((h) => ({ value: h.id, label: h.name }))]} className="w-40" />
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} options={classOptions(classes, "All Classes")} className="w-40" />
          <span className="ml-auto text-[11px] text-slate-500">{isFetching ? "Loading..." : `${seats.length} seat(s)`}</span>
        </div>
        <DataTable columns={COLUMNS} data={seats} loading={isFetching} emptyText={examId ? 'No seats allocated yet. Click "Auto Generate".' : "Pick a session and exam first."} />
      </Card>

      <Modal open={genOpen} onClose={() => setGenOpen(false)} title="Auto Generate Sitting Plan" size="lg">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Classes</p>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
              {classes.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-[12.5px] text-slate-700">
                  <input type="checkbox" checked={genClasses.includes(c.id)} onChange={() => toggle(genClasses, setGenClasses, c.id)} className="accent-indigo-600 w-4 h-4" />
                  Class {c.name}
                </label>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase mb-2">Halls (fill order)</p>
            {halls.length === 0 ? (
              <p className="text-[12px] text-slate-400">No halls yet — add them under Exam Hall Detail.</p>
            ) : (
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-2">
                {halls.map((h) => (
                  <label key={h.id} className="flex items-center gap-2 text-[12.5px] text-slate-700">
                    <input type="checkbox" checked={genHalls.includes(h.id)} onChange={() => toggle(genHalls, setGenHalls, h.id)} className="accent-indigo-600 w-4 h-4" />
                    {h.name} <span className="text-slate-400">({h.capacity || "∞"} seats)</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 mt-3">Students of the selected classes are seated in roll-number order, filling halls top to bottom. Re-generating replaces the previous allocation for those classes.</p>
        <div className="mt-5 flex gap-2">
          <Button className="flex-1" loading={generating} onClick={runGenerate}>Generate</Button>
          <Button variant="secondary" className="flex-1" onClick={() => setGenOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  );
}
