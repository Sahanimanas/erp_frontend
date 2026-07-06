/**
 * Time Table Management → Manage Time Table
 * Pick class + section → day × period grid; assign one of the class's mapped
 * subjects (falls back to all subjects) to each cell → save. Printable.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarRange, Save, Printer } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import {
  useGetSubjectsQuery, useGetClassSubjectMapQuery, useGetPeriodsQuery,
  useGetSectionTimetableQuery, useSaveSectionTimetableMutation,
} from "../../redux/api/academicApi";
import { printTable } from "../../utils/printPdf";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const cellKey = (day, periodId) => `${day}|${periodId}`;

export default function ManageTimetablePage() {
  usePageTitle("Manage Time Table");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [grid, setGrid] = useState({}); // "day|periodId" -> subjectId | ""

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: periods = [] } = useGetPeriodsQuery();
  const { data: allSubjects = [] } = useGetSubjectsQuery();
  const { data: classSubjects = [] } = useGetClassSubjectMapQuery(classId, { skip: !classId });
  const { data: timetable, isFetching } = useGetSectionTimetableQuery(sectionId, { skip: !sectionId });
  const [save, { isLoading: saving }] = useSaveSectionTimetableMutation();

  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  const sortedClasses = [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));

  // Subjects offered in the cell dropdowns: the class's mapped subjects, or
  // every subject when the class has no mapping yet.
  const subjects = useMemo(() => {
    const mapped = classSubjects.map((cs) => cs.subject).filter(Boolean);
    return mapped.length ? mapped : allSubjects;
  }, [classSubjects, allSubjects]);

  useEffect(() => { setSectionId(""); }, [classId]);
  useEffect(() => {
    const seed = {};
    (timetable?.slots ?? []).forEach((s) => { seed[cellKey(s.day, s.periodId)] = s.subjectId; });
    setGrid(seed);
  }, [timetable]);

  const submit = async () => {
    const slots = [];
    for (const day of DAYS) for (const p of periods) {
      const key = cellKey(day, p.id);
      // Send every touched/known cell; empty value clears the slot.
      if (key in grid) slots.push({ day, periodId: p.id, subjectId: grid[key] || null });
    }
    if (!slots.length) { toast.error("Nothing to save yet"); return; }
    try {
      const res = await save({ sectionId, slots }).unwrap();
      toast.success(`Saved ${res.saved} slot(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save timetable"); }
  };

  const className = classes.find((c) => c.id === classId)?.name;
  const sectionName = sections.find((s) => s.id === sectionId)?.name;
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || allSubjects.find((s) => s.id === id)?.name || "";

  const print = () => printTable({
    title: `Time Table — Class ${className || ""}/${sectionName || ""}`,
    columns: ["Period", "Time", ...DAYS],
    rows: periods.map((p) => [
      p.name, `${p.startTime}-${p.endTime}`,
      ...DAYS.map((d) => subjectName(grid[cellKey(d, p.id)]) || "—"),
    ]),
  });

  const ready = classId && sectionId;

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Time Table" subtitle="Build each section's weekly period plan" icon={<CalendarRange size={18} />}>
        <Button variant="secondary" size="sm" icon={<Printer size={13} />} disabled={!ready || !periods.length} onClick={print}>Print</Button>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!ready || !periods.length} onClick={submit}>Save Time Table</Button>
      </PageHeader>

      <Card title="Select Section">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...sortedClasses.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
            options={[{ value: "", label: "Select Section" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
        </div>
      </Card>

      <Card noPadding title={ready ? `Class ${className}/${sectionName} — Weekly Time Table` : "Weekly Time Table"}>
        {!ready ? (
          <EmptyState icon="🗓️" title="Pick class and section" description="Choose a section to build its timetable." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !periods.length ? (
          <EmptyState icon="⏰" title="No periods defined" description="Create periods first under Time Table Management → Periods." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Period</th>
                  {DAYS.map((d) => <th key={d} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{d}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {periods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2">
                      <p className="font-semibold text-slate-800 text-[12.5px]">{p.name}</p>
                      <p className="text-[10.5px] text-slate-400">{p.startTime} – {p.endTime}</p>
                    </td>
                    {DAYS.map((d) => {
                      const key = cellKey(d, p.id);
                      return (
                        <td key={d} className="px-2 py-2">
                          <select value={grid[key] || ""} onChange={(e) => setGrid((g) => ({ ...g, [key]: e.target.value }))}
                            className="w-full min-w-[110px] px-2 py-1.5 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 bg-white">
                            <option value="">—</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="px-4 py-3 text-[11px] text-slate-400">Cells use the class's assigned subjects{classSubjects.length ? "" : " (none mapped yet — showing all subjects)"}. Clear a cell by choosing "—" and saving.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
