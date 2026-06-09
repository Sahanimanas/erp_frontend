/**
 * Attendance → Student Attendance (mark)
 * Pick Session → Class → Section + date, then mark the roster and bulk-save.
 */
import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Skeleton, EmptyState, ExportButton } from "../../components/ui";
import { UserCheck, Save } from "lucide-react";
import {
  useGetAcademicYearsQuery, useGetClassesQuery, useGetSectionsQuery,
  useGetStudentsDailyQuery, useMarkStudentsBulkMutation,
} from "../../redux/api/attendanceApi";
import { StatusPicker, today } from "./_attShared";

export default function StudentAttendancePage() {
  usePageTitle("Student Attendance");
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [date, setDate] = useState(today());
  const [marks, setMarks] = useState({}); // studentId -> status

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });

  const { data: rows = [], isFetching } = useGetStudentsDailyQuery(
    { date, sectionId },
    { skip: !sectionId }
  );
  const [saveBulk, { isLoading: saving }] = useMarkStudentsBulkMutation();

  useEffect(() => {
    const seed = {};
    rows.forEach((r) => { seed[r.studentId] = r.status || "PRESENT"; });
    setMarks(seed);
  }, [rows]);

  const counts = useMemo(() => {
    const c = {};
    Object.values(marks).forEach((s) => { c[s] = (c[s] || 0) + 1; });
    return c;
  }, [marks]);

  const markAll = (status) => setMarks(() => Object.fromEntries(rows.map((r) => [r.studentId, status])));

  const save = async () => {
    const records = rows.map((r) => ({ studentId: r.studentId, status: marks[r.studentId] }));
    try {
      const res = await saveBulk({ date, records }).unwrap();
      toast.success(`Saved ${res.saved} record(s)${res.failed ? `, ${res.failed} failed` : ""}`);
    } catch (e) {
      toast.error(e?.data?.error || "Failed to save attendance");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Student Attendance" subtitle="Mark daily attendance by class & section" icon={<UserCheck size={18} />}>
        <Button variant="success" icon={<Save size={14} />} loading={saving} disabled={!rows.length} onClick={save}>
          Save Attendance
        </Button>
      </PageHeader>

      <Card>
        <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Select label="Session" value={sessionId} onChange={(e) => setSessionId(e.target.value)}
            options={[{ value: "", label: "All Sessions" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}
            options={[{ value: "", label: classId ? "Select Section" : "Pick a class first" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" />
          </div>
        </div>
      </Card>

      <Card noPadding>
        {!sectionId ? (
          <EmptyState icon="🎓" title="Select a class & section" description="Choose a class and section to load the student roster." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="🎓" title="No students" description="No students in this section." />
        ) : (
          <>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3 text-[12px]">
              <span className="font-semibold text-slate-600">{rows.length} students</span>
              <span className="text-emerald-600">Present: {counts.PRESENT || 0}</span>
              <span className="text-red-500">Absent: {counts.ABSENT || 0}</span>
              <span className="text-amber-500">Late: {counts.LATE || 0}</span>
              <div className="flex gap-2 ml-auto">
                <ExportButton filename="student-attendance.csv" rows={rows} columns={[
                  { label: "Roll No", get: (r) => r.rollNumber },
                  { label: "Student", get: (r) => r.name },
                  { label: "Class", get: (r) => `${r.className}-${r.sectionName}` },
                  { label: "Status", get: (r) => marks[r.studentId] || "—" },
                ]} />
                <Button size="xs" variant="success" onClick={() => markAll("PRESENT")}>All Present</Button>
                <Button size="xs" variant="danger" onClick={() => markAll("ABSENT")}>All Absent</Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[620px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Roll No", "Student", "Class", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r) => (
                    <tr key={r.studentId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-mono text-[11px] text-indigo-600 font-semibold">{r.rollNumber}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-[12px]">{r.className}-{r.sectionName}</td>
                      <td className="px-4 py-2.5"><StatusPicker value={marks[r.studentId]} onChange={(s) => setMarks((m) => ({ ...m, [r.studentId]: s }))} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
