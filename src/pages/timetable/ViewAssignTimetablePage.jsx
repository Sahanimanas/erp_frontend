/**
 * Class Management → Time Table → View Time Table Assign
 * Read-only teacher allotment for a section (who teaches each period).
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, EmptyState, Skeleton } from "../../components/ui";
import { ClipboardList, FileDown } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetTimetableQuery } from "../../redux/api/timetableApi";
import { DAYS, TimetableFilters, fmtTime, periodLabel, printTimetableGrid } from "./_ttShared";

export default function ViewAssignTimetablePage() {
  usePageTitle("View Time Table Assign");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [ttSession, setTt] = useState("DEFAULT");

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: tt, isFetching } = useGetTimetableQuery(
    { sectionId, session: ttSession, academicYearId }, { skip: !sectionId },
  );
  useEffect(() => { setSectionId(""); }, [classId]);

  const className = classes.find((c) => c.id === classId)?.name;
  const sectionName = sections.find((s) => s.id === sectionId)?.name;
  const sessionName = sessions.find((s) => s.id === academicYearId)?.name || "Active";
  const ready = classId && sectionId;
  const hasData = ready && (tt?.cells?.length || 0) > 0;

  const maxPeriods = tt?.maxPeriods || 8;
  const periodsArr = Array.from({ length: maxPeriods }, (_, i) => i);
  const labels = tt?.periodLabels || [];
  const byCell = new Map((tt?.cells || []).map((c) => [`${c.day}|${c.periodIndex}`, c]));

  const download = () => printTimetableGrid({
    title: `Teacher Allotment — ${className}/${sectionName}`,
    meta: [["Session", sessionName], ["Class", className], ["Section", sectionName], ["Timetable Session", ttSession]],
    columns: ["Day Name", ...periodsArr.map((i) => periodLabel(labels, i))],
    rows: DAYS.map((d) => [d, ...periodsArr.map((i) => {
      const c = byCell.get(`${d}|${i}`);
      if (!c || (!c.subject && !c.startTime)) return "";
      return [c.subject?.name, c.teacher?.name || "[Not Assigned]"].filter(Boolean).join("\n");
    })]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="View Time Table Assign" subtitle="Teacher allotment across the week" icon={<ClipboardList size={18} />}>
        <Button size="sm" icon={<FileDown size={13} />} disabled={!hasData} onClick={download}>Download as PDF</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <TimetableFilters
          sessions={sessions} classes={classes} sections={sections}
          academicYearId={academicYearId} classId={classId} sectionId={sectionId} ttSession={ttSession}
          onYear={setYear} onClass={setClassId} onSection={setSectionId} onTt={setTt} />
      </Card>

      <Card noPadding title="Time Table Teacher Allotment">
        {!ready ? (
          <EmptyState icon="🧑‍🏫" title="Pick class & section" description="Choose a section to view its allotment." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !hasData ? (
          <EmptyState icon="📭" title="No timetable yet" description="Build the timetable and allot teachers first." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600 uppercase">Day Name</th>
                  {periodsArr.map((i) => (
                    <th key={i} className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600">{periodLabel(labels, i)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => (
                  <tr key={d}>
                    <td className="border border-slate-200 px-3 py-3 text-center font-semibold text-slate-700 text-[12px] bg-slate-50/60">{d}</td>
                    {periodsArr.map((i) => {
                      const c = byCell.get(`${d}|${i}`);
                      const filled = c && (c.subject || c.startTime);
                      return (
                        <td key={i} className="border border-slate-200 px-3 py-3 text-center text-[11.5px]">
                          {filled ? (
                            <>
                              {c.startTime && c.endTime && <div className="text-slate-400 text-[10.5px]">{fmtTime(c.startTime)}-{fmtTime(c.endTime)}</div>}
                              {c.subject && <div className="font-semibold text-slate-700">{c.subject.name}</div>}
                              <div className={c.teacher ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>
                                {c.teacher?.name || "[Not Assigned]"}
                              </div>
                            </>
                          ) : <span className="text-slate-300">X</span>}
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
