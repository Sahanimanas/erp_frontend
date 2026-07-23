/**
 * Class Management → Time Table → View Session Time Table
 * Every class's periods for ONE weekday — rows are sections, columns periods.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarClock, FileDown } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetSessionDayTimetableQuery } from "../../redux/api/timetableApi";
import { DAYS, TT_SESSIONS, fmtTime, printTimetableGrid } from "./_ttShared";

export default function SessionTimetablePage() {
  usePageTitle("View Session Time Table");
  const [academicYearId, setYear] = useState("");
  const [day, setDay] = useState("Monday");
  const [ttSession, setTt] = useState("DEFAULT");

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: tt, isFetching } = useGetSessionDayTimetableQuery({ day, session: ttSession, academicYearId });

  const sessionName = sessions.find((s) => s.id === academicYearId)?.name || "Active";
  const maxPeriods = tt?.maxPeriods || 8;
  const cols = Array.from({ length: maxPeriods }, (_, i) => i);
  const rows = tt?.rows || [];
  const hasData = rows.length > 0;

  const cellFor = (row, i) => row.cells.find((c) => c.periodIndex === i);
  const cellText = (c) => {
    if (!c) return "";
    const t = c.startTime && c.endTime ? `${fmtTime(c.startTime)}-${fmtTime(c.endTime)}` : "";
    return [t, c.subject, c.teacher || "[Not Assigned]"].filter(Boolean).join("\n");
  };

  const download = () => printTimetableGrid({
    title: `Session Time Table — ${day}`,
    meta: [["Session", sessionName], ["Day Name", day], ["Timetable Session", ttSession]],
    columns: ["Class Name", ...cols.map((i) => `Period ${i + 1}`)],
    rows: rows.map((r) => [r.label, ...cols.map((i) => cellText(cellFor(r, i)))]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="View Session Time Table" subtitle="All classes' periods for a single day" icon={<CalendarClock size={18} />}>
        <Button size="sm" icon={<FileDown size={13} />} disabled={!hasData} onClick={download}>Download as PDF</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
          <Select label="Session" value={academicYearId} onChange={(e) => setYear(e.target.value)}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Day Name *" value={day} onChange={(e) => setDay(e.target.value)}
            options={DAYS.map((d) => ({ value: d, label: d }))} />
          <Select label="Timetable Session" value={ttSession} onChange={(e) => setTt(e.target.value)} options={TT_SESSIONS} />
        </div>
      </Card>

      <Card noPadding title={`Class Time Table Details For Session — ${day}`}>
        {isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !hasData ? (
          <EmptyState icon="📭" title="No timetables for this day" description="Build class timetables under Add Time Table first." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600 uppercase">Class Name</th>
                  {cols.map((i) => (
                    <th key={i} className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600">Period {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.sectionId}>
                    <td className="border border-slate-200 px-3 py-3 text-center font-semibold text-slate-700 text-[12px] bg-slate-50/60">{r.label}</td>
                    {cols.map((i) => {
                      const c = cellFor(r, i);
                      return (
                        <td key={i} className="border border-slate-200 px-3 py-3 text-center text-[11.5px]">
                          {c ? (
                            <>
                              {c.startTime && c.endTime && <div className="text-slate-400 text-[10.5px]">{fmtTime(c.startTime)}-{fmtTime(c.endTime)}</div>}
                              {c.subject && <div className="font-semibold text-slate-800">{c.subject}</div>}
                              <div className={c.teacher ? "text-emerald-600 font-medium" : "text-red-500 font-medium"}>{c.teacher || "[Not Assigned]"}</div>
                            </>
                          ) : <span className="text-slate-300">-</span>}
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
