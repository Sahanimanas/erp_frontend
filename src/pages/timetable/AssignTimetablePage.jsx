/**
 * Class Management → Time Table → Time Table Assign (Teacher Allotment)
 * Same shared record as the builder — here you assign a teacher to each period.
 * Subjects / times / links set in the builder are preserved on save.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, EmptyState, Skeleton } from "../../components/ui";
import { UserCheck, Save } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetTimetableQuery, useSaveTimetableMutation, useGetTimetableTeachersQuery } from "../../redux/api/timetableApi";
import { DAYS, TimetableFilters, fmtTime, periodLabel } from "./_ttShared";

const key = (day, i) => `${day}|${i}`;

export default function AssignTimetablePage() {
  usePageTitle("Time Table Assign");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [ttSession, setTt] = useState("DEFAULT");
  const [cells, setCells] = useState({}); // "day|idx" -> full cell (teacher editable)

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: teachers = [] } = useGetTimetableTeachersQuery();
  const { data: tt, isFetching } = useGetTimetableQuery(
    { sectionId, session: ttSession, academicYearId }, { skip: !sectionId },
  );
  const [save, { isLoading: saving }] = useSaveTimetableMutation();

  useEffect(() => { setSectionId(""); }, [classId]);
  useEffect(() => {
    const seed = {};
    (tt?.cells || []).forEach((c) => {
      seed[key(c.day, c.periodIndex)] = {
        startTime: c.startTime || "", endTime: c.endTime || "",
        subjectId: c.subjectId || "", teacherId: c.teacherId || "", onlineLink: c.onlineLink || "",
        subjectName: c.subject?.name || "",
      };
    });
    setCells(seed);
  }, [tt]);

  const maxPeriods = tt?.maxPeriods || 8;
  const periodsArr = Array.from({ length: maxPeriods }, (_, i) => i);
  const labels = tt?.periodLabels || [];
  const className = classes.find((c) => c.id === classId)?.name;
  const sectionName = sections.find((s) => s.id === sectionId)?.name;
  const ready = classId && sectionId;
  const hasData = ready && (tt?.cells?.length || 0) > 0;

  const setTeacher = (day, i, teacherId) =>
    setCells((c) => ({ ...c, [key(day, i)]: { ...c[key(day, i)], teacherId } }));

  const submit = async () => {
    const out = [];
    for (const day of DAYS) for (const i of periodsArr) {
      const c = cells[key(day, i)];
      if (c && (c.startTime || c.endTime || c.subjectId || c.teacherId || c.onlineLink)) {
        out.push({ day, periodIndex: i, startTime: c.startTime, endTime: c.endTime, subjectId: c.subjectId, teacherId: c.teacherId, onlineLink: c.onlineLink });
      }
    }
    try {
      await save({
        sectionId, session: ttSession, academicYearId: academicYearId || undefined,
        maxPeriods, completed: tt?.completed, classTeacherId: tt?.classTeacherId || null,
        periodLabels: tt?.periodLabels || [], cells: out,
      }).unwrap();
      toast.success("Teacher allotment saved");
    } catch (e) { toast.error(e?.data?.error || "Failed to save allotment"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Time Table Assign" subtitle="Assign a teacher to each period (Teacher Allotment)" icon={<UserCheck size={18} />}>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!hasData} onClick={submit}>Save Allotment</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <TimetableFilters
          sessions={sessions} classes={classes} sections={sections}
          academicYearId={academicYearId} classId={classId} sectionId={sectionId} ttSession={ttSession}
          onYear={setYear} onClass={setClassId} onSection={setSectionId} onTt={setTt} />
      </Card>

      <Card noPadding title="Time Table Teacher Allotment">
        {!ready ? (
          <EmptyState icon="🧑‍🏫" title="Pick class & section" description="Choose a section to assign teachers." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !hasData ? (
          <EmptyState icon="📭" title="No timetable yet" description="Build the timetable under Add Time Table before allotting teachers." />
        ) : (
          <div className="overflow-x-auto">
            <table className="text-sm border-separate border-spacing-0">
              <thead>
                <tr className="bg-slate-50">
                  <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-200 min-w-[110px]">Day / Period</th>
                  {periodsArr.map((i) => (
                    <th key={i} className="px-2 py-2 border-b border-l border-slate-200 min-w-[180px] text-[11px] font-bold text-slate-500">{periodLabel(labels, i)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day} className="align-top">
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 font-semibold text-slate-700 text-[12.5px] border-b border-slate-100">{day}</td>
                    {periodsArr.map((i) => {
                      const c = cells[key(day, i)];
                      const filled = c && (c.subjectId || c.startTime);
                      return (
                        <td key={i} className="px-2 py-2 border-b border-l border-slate-100">
                          {filled ? (
                            <div className="space-y-1.5">
                              <div className="text-[11px] text-slate-500">
                                {c.startTime && c.endTime && <span>{fmtTime(c.startTime)}-{fmtTime(c.endTime)}</span>}
                                {c.subjectName && <span className="font-semibold text-slate-700 block">{c.subjectName}</span>}
                              </div>
                              <select value={c.teacherId || ""} onChange={(e) => setTeacher(day, i, e.target.value)}
                                className="w-full px-2 py-1 text-[12px] border border-slate-200 rounded focus:outline-none focus:border-indigo-400 bg-white">
                                <option value="">[Not Assigned]</option>
                                {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                              </select>
                            </div>
                          ) : <div className="text-center text-slate-300 py-2">X</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
