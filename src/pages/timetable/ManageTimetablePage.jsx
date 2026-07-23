/**
 * Class Management → Time Table → Add Time Table (builder)
 * Video-style grid: pick Session/Class/Section/Timetable-Session, choose the
 * Maximum Period count, then fill each day×period cell with a start/end time,
 * subject and optional online link; set a Class Teacher and mark the timetable
 * completed. Saves to ONE shared record so View / Allotment / Employee / Session
 * pages all reflect it. Teacher allotment (set on the Assign page) is preserved
 * through saves here.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarRange, Save, FileDown } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetSessionsQuery, useGetSubjectsQuery, useGetClassSubjectMapQuery } from "../../redux/api/academicApi";
import { useGetTimetableQuery, useSaveTimetableMutation, useGetTimetableTeachersQuery } from "../../redux/api/timetableApi";
import {
  DAYS, MAX_PERIOD_OPTIONS, TT_SESSIONS, sortClasses, fmtTime, periodLabel, printTimetableGrid,
} from "./_ttShared";

const key = (day, i) => `${day}|${i}`;
const EMPTY_CELL = { startTime: "", endTime: "", subjectId: "", teacherId: "", onlineLink: "" };

export default function ManageTimetablePage() {
  usePageTitle("Add Time Table");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [ttSession, setTt] = useState("DEFAULT");

  const [maxPeriods, setMaxPeriods] = useState(8);
  const [completed, setCompleted] = useState(false);
  const [classTeacherId, setClassTeacher] = useState("");
  const [labels, setLabels] = useState([]);
  const [cells, setCells] = useState({}); // "day|idx" -> full cell

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: allSubjects = [] } = useGetSubjectsQuery();
  const { data: classSubjects = [] } = useGetClassSubjectMapQuery(classId, { skip: !classId });
  const { data: teachers = [] } = useGetTimetableTeachersQuery();
  const { data: tt, isFetching } = useGetTimetableQuery(
    { sectionId, session: ttSession, academicYearId }, { skip: !sectionId },
  );
  const [save, { isLoading: saving }] = useSaveTimetableMutation();

  const subjects = useMemo(() => {
    const mapped = classSubjects.map((cs) => cs.subject).filter(Boolean);
    return mapped.length ? mapped : allSubjects;
  }, [classSubjects, allSubjects]);

  useEffect(() => { setSectionId(""); }, [classId]);

  // Seed the builder from the loaded record (carrying teacherId through).
  useEffect(() => {
    if (!tt) return;
    setMaxPeriods(tt.maxPeriods || 8);
    setCompleted(!!tt.completed);
    setClassTeacher(tt.classTeacherId || "");
    setLabels(tt.periodLabels || []);
    const seed = {};
    (tt.cells || []).forEach((c) => {
      seed[key(c.day, c.periodIndex)] = {
        startTime: c.startTime || "", endTime: c.endTime || "",
        subjectId: c.subjectId || "", teacherId: c.teacherId || "", onlineLink: c.onlineLink || "",
      };
    });
    setCells(seed);
  }, [tt]);

  const periodsArr = Array.from({ length: maxPeriods }, (_, i) => i);
  const getCell = (day, i) => cells[key(day, i)] || EMPTY_CELL;
  const setCell = (day, i, patch) =>
    setCells((c) => ({ ...c, [key(day, i)]: { ...EMPTY_CELL, ...c[key(day, i)], ...patch } }));
  const setLabel = (i, v) => setLabels((l) => { const n = [...l]; n[i] = v; return n; });

  const className = classes.find((c) => c.id === classId)?.name;
  const sectionName = sections.find((s) => s.id === sectionId)?.name;
  const sessionName = sessions.find((s) => s.id === academicYearId)?.name || "Active";
  const subjectName = (id) => subjects.find((s) => s.id === id)?.name || allSubjects.find((s) => s.id === id)?.name || "";
  const ready = classId && sectionId;

  const collectCells = () => {
    const out = [];
    for (const day of DAYS) for (const i of periodsArr) {
      const c = getCell(day, i);
      if (c.startTime || c.endTime || c.subjectId || c.teacherId || c.onlineLink) {
        out.push({ day, periodIndex: i, ...c });
      }
    }
    return out;
  };

  const submit = async () => {
    try {
      const res = await save({
        sectionId, session: ttSession, academicYearId: academicYearId || undefined,
        maxPeriods, completed, classTeacherId: classTeacherId || null,
        periodLabels: periodsArr.map((i) => labels[i] || ""),
        cells: collectCells(),
      }).unwrap();
      toast.success(`Timetable saved (${res.cells} period${res.cells === 1 ? "" : "s"})`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save timetable"); }
  };

  const preview = () => printTimetableGrid({
    title: `Time Table — ${className}/${sectionName}`,
    meta: [["Session", sessionName], ["Class", className], ["Section", sectionName], ["Timetable Session", ttSession]],
    columns: ["Day Name", ...periodsArr.map((i) => periodLabel(labels, i))],
    rows: DAYS.map((d) => [d, ...periodsArr.map((i) => {
      const c = getCell(d, i);
      const t = c.startTime && c.endTime ? `${fmtTime(c.startTime)} - ${fmtTime(c.endTime)}` : "";
      return [t, subjectName(c.subjectId)].filter(Boolean).join("\n");
    })]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Add Time Table" subtitle="Build a class's weekly timetable — Search / Add / Edit" icon={<CalendarRange size={18} />}>
        <Button variant="secondary" size="sm" icon={<FileDown size={13} />} disabled={!ready} onClick={preview}>Preview</Button>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!ready} onClick={submit}>Save</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Session" value={academicYearId} onChange={(e) => setYear(e.target.value)}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select..." }, ...sortClasses(classes).map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
            options={[{ value: "", label: "Select..." }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Timetable Session" value={ttSession} onChange={(e) => setTt(e.target.value)} options={TT_SESSIONS} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="🗓️" title="Pick class & section" description="Choose a class and section to build its timetable." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Card>
      ) : (
        <Card noPadding title={`Class Time Table — ${className}/${sectionName}`}>
          <div className="flex flex-wrap items-end gap-4 border-b border-slate-100 p-4">
            <Select label="Maximum Period" value={String(maxPeriods)} onChange={(e) => setMaxPeriods(Number(e.target.value))}
              options={MAX_PERIOD_OPTIONS} className="w-40" />
            <label className="flex items-center gap-2 text-[13px] font-medium text-slate-600 pb-2 select-none">
              <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} className="w-4 h-4 accent-indigo-600" />
              Timetable Completed
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 min-w-[110px]">Day / Period</th>
                  {periodsArr.map((i) => (
                    <th key={i} className="px-2 py-2 border-b border-l border-slate-200 min-w-[190px]">
                      <input value={labels[i] ?? ""} onChange={(e) => setLabel(i, e.target.value)} placeholder={`Period ${i + 1}`}
                        className="w-full px-2 py-1 text-[12px] font-semibold text-slate-700 border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400 bg-white text-center" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="align-top">
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 font-semibold text-slate-700 text-[12.5px] border-b border-slate-100">{day}</td>
                    {periodsArr.map((i) => {
                      const c = getCell(day, i);
                      return (
                        <td key={i} className="px-2 py-2 border-b border-l border-slate-100">
                          <div className="space-y-1.5">
                            <div className="flex gap-1">
                              <input type="time" value={c.startTime} onChange={(e) => setCell(day, i, { startTime: e.target.value })}
                                className="w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                              <input type="time" value={c.endTime} onChange={(e) => setCell(day, i, { endTime: e.target.value })}
                                className="w-full px-1.5 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                            </div>
                            <select value={c.subjectId} onChange={(e) => setCell(day, i, { subjectId: e.target.value })}
                              className="w-full px-2 py-1 text-[12px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400 bg-white">
                              <option value="">— Subject —</option>
                              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input value={c.onlineLink} onChange={(e) => setCell(day, i, { onlineLink: e.target.value })} placeholder="online link"
                              className="w-full px-2 py-1 text-[11px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 p-4">
            <Select label="Class Teacher" value={classTeacherId} onChange={(e) => setClassTeacher(e.target.value)} className="w-72"
              options={[{ value: "", label: "Select..." }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={<FileDown size={13} />} onClick={preview}>Preview</Button>
              <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Save</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
