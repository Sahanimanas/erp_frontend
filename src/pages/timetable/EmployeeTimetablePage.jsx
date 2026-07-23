/**
 * Class Management → Time Table → View Employee Time Table
 * A single teacher's weekly schedule across every class they're allotted to.
 */
import { useMemo, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { UserSquare, FileDown } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetEmployeeTimetableQuery, useGetTimetableTeachersQuery } from "../../redux/api/timetableApi";
import { DAYS, TT_SESSIONS, fmtTime, printTimetableGrid } from "./_ttShared";

export default function EmployeeTimetablePage() {
  usePageTitle("View Employee Time Table");
  const [academicYearId, setYear] = useState("");
  const [employeeId, setEmployee] = useState("");
  const [ttSession, setTt] = useState("DEFAULT");

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: teachers = [] } = useGetTimetableTeachersQuery();
  const { data: tt, isFetching } = useGetEmployeeTimetableQuery(
    { employeeId, session: ttSession, academicYearId }, { skip: !employeeId },
  );

  // Column count = the busiest day this teacher has.
  const maxPeriods = useMemo(() => {
    let m = 0;
    Object.values(tt?.schedule || {}).forEach((list) => (m = Math.max(m, list.length)));
    return Math.max(m, 1);
  }, [tt]);
  const cols = Array.from({ length: maxPeriods }, (_, i) => i);

  const sessionName = sessions.find((s) => s.id === academicYearId)?.name || "Active";
  const empName = teachers.find((t) => t.id === employeeId)?.name || "";
  const hasData = employeeId && Object.values(tt?.schedule || {}).some((l) => l.length);

  const cellText = (entry) => {
    if (!entry) return "";
    const t = entry.startTime && entry.endTime ? `${fmtTime(entry.startTime)}-${fmtTime(entry.endTime)}` : "";
    return [t, entry.subject, `[${entry.className}-${entry.sectionName}]`].filter(Boolean).join("\n");
  };

  const download = () => printTimetableGrid({
    title: `Employee Time Table — ${empName}`,
    meta: [["Employee", empName], ["Session", sessionName], ["Timetable Session", ttSession]],
    columns: ["Day Name", ...cols.map((i) => `Period ${i + 1}`)],
    rows: DAYS.map((d) => [d, ...cols.map((i) => cellText((tt?.schedule?.[d] || [])[i]))]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="View Employee Time Table" subtitle="A teacher's weekly schedule across all classes" icon={<UserSquare size={18} />}>
        <Button size="sm" icon={<FileDown size={13} />} disabled={!hasData} onClick={download}>Download as PDF</Button>
      </PageHeader>

      <Card title="Search Time Table" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5">
          <Select label="Session" value={academicYearId} onChange={(e) => setYear(e.target.value)}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Employee *" value={employeeId} onChange={(e) => setEmployee(e.target.value)}
            options={[{ value: "", label: "Select..." }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]} />
          <Select label="Timetable Session" value={ttSession} onChange={(e) => setTt(e.target.value)} options={TT_SESSIONS} />
        </div>
      </Card>

      <Card noPadding title="Employee Time Table Details For Class">
        {!employeeId ? (
          <EmptyState icon="🧑‍🏫" title="Pick an employee" description="Choose a teacher to see their weekly schedule." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !hasData ? (
          <EmptyState icon="📭" title="No allotments" description="This teacher isn't allotted to any period yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50">
                  <th className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600 uppercase">Day Name</th>
                  {cols.map((i) => (
                    <th key={i} className="border border-slate-300 px-3 py-2 text-[11px] font-bold text-slate-600">Period {i + 1}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => {
                  const list = tt?.schedule?.[d] || [];
                  return (
                    <tr key={d}>
                      <td className="border border-slate-200 px-3 py-3 text-center font-semibold text-slate-700 text-[12px] bg-slate-50/60">{d}</td>
                      {cols.map((i) => {
                        const e = list[i];
                        return (
                          <td key={i} className="border border-slate-200 px-3 py-3 text-center text-[11.5px]">
                            {e ? (
                              <>
                                {e.startTime && e.endTime && <div className="text-slate-400 text-[10.5px]">{fmtTime(e.startTime)}-{fmtTime(e.endTime)}</div>}
                                {e.subject && <div className="font-semibold text-slate-800">{e.subject}</div>}
                                <div className="text-indigo-500 text-[10.5px]">[{e.className}-{e.sectionName}]</div>
                              </>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
