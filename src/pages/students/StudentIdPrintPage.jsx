/**
 * Student → Student ID Print
 * Pick a class, choose a card template + orientation, then print real ID cards.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Avatar, EmptyState, Skeleton } from "../../components/ui";
import { CreditCard as IdCard, Printer } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";

const TEMPLATES = [
  { id: 1, name: "Classic Blue", bar: "from-indigo-600 to-blue-600", accent: "text-indigo-600" },
  { id: 2, name: "Emerald", bar: "from-emerald-600 to-teal-600", accent: "text-emerald-600" },
  { id: 3, name: "Sunset", bar: "from-orange-500 to-pink-600", accent: "text-orange-600" },
  { id: 4, name: "Violet", bar: "from-violet-600 to-fuchsia-600", accent: "text-violet-600" },
  { id: 5, name: "Slate", bar: "from-slate-700 to-slate-900", accent: "text-slate-700" },
  { id: 6, name: "Cyan", bar: "from-cyan-500 to-sky-600", accent: "text-cyan-600" },
];

export default function StudentIdPrintPage() {
  usePageTitle("Student ID Print");
  const [classId, setClassId] = useState("");
  const [orientation, setOrientation] = useState("vertical");
  const [template, setTemplate] = useState(1);

  const { data: classes = [] } = useGetClassesQuery();
  const { data, isFetching } = useGetStudentsQuery({ classId, limit: 200 }, { skip: !classId });
  const rows = data?.data ?? [];
  const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0];

  return (
    <div className="space-y-4">
      <style>{`@media print { .no-print { display:none !important; } .id-grid { gap:8px !important; } body { background:#fff; } }`}</style>
      <div className="no-print">
        <PageHeader title="Student ID Print" subtitle="Generate printable student ID cards" icon={<IdCard size={18} />}>
          <Button icon={<Printer size={14} />} disabled={!rows.length} onClick={() => window.print()}>Print</Button>
        </PageHeader>

        <Card title="Template Type">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
                options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
              <Select label="Orientation" value={orientation} onChange={(e) => setOrientation(e.target.value)}
                options={[{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }]} />
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => setTemplate(t.id)}
                  className={`rounded-xl border-2 p-2 transition-all ${template === t.id ? "border-indigo-500" : "border-slate-200 hover:border-slate-300"}`}>
                  <div className={`h-8 rounded-md bg-gradient-to-r ${t.bar} mb-1`} />
                  <p className="text-[10px] font-semibold text-slate-600">Template {t.id}</p>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {!classId ? (
        <EmptyState icon="🪪" title="Pick a class" description="Select a class to generate ID cards." />
      ) : isFetching ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon="🪪" title="No students" description="No students in this class." />
      ) : (
        <div className={`id-grid grid gap-3 ${orientation === "vertical" ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}>
          {rows.map((r) => <IdCardView key={r.id} student={r} tpl={tpl} orientation={orientation} />)}
        </div>
      )}
    </div>
  );
}

function IdCardView({ student, tpl, orientation }) {
  const name = `${student.user?.firstName ?? ""} ${student.user?.lastName ?? ""}`.trim();
  const klass = `${student.section?.class?.name ?? ""}-${student.section?.name ?? ""}`;
  const horizontal = orientation === "horizontal";
  return (
    <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm ${horizontal ? "flex" : ""}`}>
      <div className={`bg-gradient-to-r ${tpl.bar} text-white px-3 py-2 ${horizontal ? "flex flex-col justify-center items-center w-1/3" : "text-center"}`}>
        <p className="text-[11px] font-bold leading-tight">EduServe School</p>
        <p className="text-[8px] opacity-80">STUDENT IDENTITY CARD</p>
      </div>
      <div className={`p-3 ${horizontal ? "flex-1" : ""}`}>
        <div className={`flex ${horizontal ? "items-center gap-3" : "flex-col items-center"} gap-2`}>
          <Avatar name={name} src={student.photo} size="lg" />
          <div className={horizontal ? "" : "text-center"}>
            <p className="text-[13px] font-bold text-slate-800">{name}</p>
            <p className={`text-[10px] font-semibold ${tpl.accent}`}>{klass}</p>
          </div>
        </div>
        <div className="mt-2 space-y-0.5 text-[10px] text-slate-600">
          <Row label="Roll No" value={student.rollNumber} />
          <Row label="Adm No" value={student.admissionNumber || "—"} />
          <Row label="Gender" value={student.gender || "—"} />
          <Row label="Phone" value={student.user?.phone || "—"} />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-2"><span className="text-slate-400">{label}</span><span className="font-semibold text-slate-700">{value}</span></div>
  );
}
