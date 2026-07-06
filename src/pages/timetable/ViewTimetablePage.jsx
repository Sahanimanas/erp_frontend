/**
 * Time Table Management → View Time Table
 * Read-only weekly grid for a section, printable.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarDays, Printer } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetPeriodsQuery, useGetSectionTimetableQuery } from "../../redux/api/academicApi";
import { printTable } from "../../utils/printPdf";
import { DAYS } from "./ManageTimetablePage";

export default function ViewTimetablePage() {
  usePageTitle("View Time Table");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: periods = [] } = useGetPeriodsQuery();
  const { data: timetable, isFetching } = useGetSectionTimetableQuery(sectionId, { skip: !sectionId });
  useEffect(() => { setSectionId(""); }, [classId]);

  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  const sortedClasses = [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));

  const bySlot = new Map((timetable?.slots ?? []).map((s) => [`${s.day}|${s.periodId}`, s.subject?.name || ""]));
  const className = classes.find((c) => c.id === classId)?.name;
  const sectionName = sections.find((s) => s.id === sectionId)?.name;
  const ready = classId && sectionId;

  const print = () => printTable({
    title: `Time Table — Class ${className || ""}/${sectionName || ""}`,
    columns: ["Period", "Time", ...DAYS],
    rows: periods.map((p) => [p.name, `${p.startTime}-${p.endTime}`, ...DAYS.map((d) => bySlot.get(`${d}|${p.id}`) || "—")]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="View Time Table" subtitle="Weekly period plan of a section" icon={<CalendarDays size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} disabled={!ready || !periods.length} onClick={print}>Print</Button>
      </PageHeader>

      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...sortedClasses.map((c) => ({ value: c.id, label: c.name }))]} className="w-44" />
          <Select value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
            options={[{ value: "", label: "Select Section" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} className="w-40" />
        </div>

        {!ready ? (
          <EmptyState icon="🗓️" title="Pick class and section" description="Choose a section to view its timetable." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : !periods.length ? (
          <EmptyState icon="⏰" title="No periods defined" description="Periods are set up under Time Table Management → Periods." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">Period</th>
                  {DAYS.map((d) => <th key={d} className="px-3 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{d}</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {periods.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5">
                      <p className="font-semibold text-slate-800 text-[12.5px]">{p.name}</p>
                      <p className="text-[10.5px] text-slate-400">{p.startTime} – {p.endTime}</p>
                    </td>
                    {DAYS.map((d) => {
                      const name = bySlot.get(`${d}|${p.id}`);
                      return <td key={d} className={`px-3 py-2.5 text-[12px] ${name ? "font-semibold text-slate-700" : "text-slate-300"}`}>{name || "—"}</td>;
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
