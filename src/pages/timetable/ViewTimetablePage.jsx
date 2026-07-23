/**
 * Class Management → Time Table → View Time Table
 * Read-only "Course Time Table" for a section with the school header and a
 * Download-as-PDF button (matches the video). Reads the same shared record the
 * builder writes.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, EmptyState, Skeleton } from "../../components/ui";
import { CalendarDays, FileDown } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetTimetableQuery } from "../../redux/api/timetableApi";
import { getSchool } from "../../utils/printPdf";
import { DAYS, TimetableFilters, fmtTime, periodLabel, printTimetableGrid } from "./_ttShared";

export default function ViewTimetablePage() {
  usePageTitle("View Time Table");
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

  const maxPeriods = tt?.maxPeriods || 8;
  const periodsArr = Array.from({ length: maxPeriods }, (_, i) => i);
  const labels = tt?.periodLabels || [];
  const byCell = new Map((tt?.cells || []).map((c) => [`${c.day}|${c.periodIndex}`, c]));
  const cellText = (c) => {
    if (!c) return "";
    const t = c.startTime && c.endTime ? `${fmtTime(c.startTime)} - ${fmtTime(c.endTime)}` : "";
    return [t, c.subject?.name].filter(Boolean).join("\n");
  };

  const school = getSchool();
  const download = () => printTimetableGrid({
    title: `Time Table — ${className}/${sectionName}`,
    meta: [["Session", sessionName], ["Class", className], ["Section", sectionName], ["Timetable Session", ttSession],
      ...(tt?.classTeacher ? [["Class Teacher", tt.classTeacher.name]] : [])],
    columns: ["Day Name", ...periodsArr.map((i) => periodLabel(labels, i))],
    rows: DAYS.map((d) => [d, ...periodsArr.map((i) => cellText(byCell.get(`${d}|${i}`)))]),
  });

  const hasData = ready && (tt?.cells?.length || 0) > 0;

  return (
    <div className="space-y-4">
      <PageHeader title="View Time Table" subtitle="A section's weekly Course Time Table" icon={<CalendarDays size={18} />}>
        <Button size="sm" icon={<FileDown size={13} />} disabled={!hasData} onClick={download}>Download as PDF</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <TimetableFilters
          sessions={sessions} classes={classes} sections={sections}
          academicYearId={academicYearId} classId={classId} sectionId={sectionId} ttSession={ttSession}
          onYear={setYear} onClass={setClassId} onSection={setSectionId} onTt={setTt} />
      </Card>

      <Card noPadding title="Course Time Table">
        {!ready ? (
          <EmptyState icon="🗓️" title="Pick class & section" description="Choose a section to view its timetable." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !hasData ? (
          <EmptyState icon="📭" title="No timetable yet" description="Build it under Add Time Table first." />
        ) : (
          <div className="p-4">
            {/* Printed-style header block */}
            <div className="border border-slate-800 rounded-sm overflow-hidden">
              <div className="text-center py-3 border-b border-slate-800">
                <h2 className="text-lg font-extrabold text-slate-800">{school.name || "School"}</h2>
                {school.address && <p className="text-[11px] text-slate-500">{school.address}</p>}
              </div>
              <div className="px-4 py-3 text-[12.5px] leading-6 border-b border-slate-800">
                <div><b>Session :</b> {sessionName}</div>
                <div><b>Class :</b> {className}</div>
                <div><b>Section :</b> {sectionName}</div>
                <div><b>Timetable Session :</b> {ttSession}</div>
                {tt?.classTeacher && <div><b>Class Teacher :</b> {tt.classTeacher.name}</div>}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
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
                          return (
                            <td key={i} className="border border-slate-200 px-3 py-3 text-center text-[11.5px]">
                              {c && (c.startTime || c.subject) ? (
                                <>
                                  {c.startTime && c.endTime && <div className="text-slate-500">{fmtTime(c.startTime)} - {fmtTime(c.endTime)}</div>}
                                  {c.subject && <div className="font-semibold text-slate-800">{c.subject.name}</div>}
                                  {c.onlineLink && <a href={c.onlineLink} target="_blank" rel="noreferrer" className="text-[10.5px] text-indigo-500 underline">link</a>}
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
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
