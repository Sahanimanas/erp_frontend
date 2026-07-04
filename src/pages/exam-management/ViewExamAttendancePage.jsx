/**
 * Exam Management → View Exam Attendance
 * Read-only per-paper attendance with summary counts and CSV export.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, DataTable, Select, Badge, ExportButton } from "../../components/ui";
import { Eye } from "lucide-react";
import { useGetExamScheduleQuery, useGetExamAttendanceQuery } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions, fmtDate } from "./_examShared";

export default function ViewExamAttendancePage() {
  usePageTitle("View Exam Attendance");
  const { years, session, setSession, exams, examId, setExamId } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [scheduleId, setScheduleId] = useState("");

  const { data: schedule = [] } = useGetExamScheduleQuery({ examId, classId }, { skip: !examId || !classId });
  const { data, isFetching } = useGetExamAttendanceQuery(scheduleId, { skip: !scheduleId });
  useEffect(() => { setScheduleId(""); }, [examId, classId]);

  const students = data?.students ?? [];
  const present = students.filter((s) => s.status === "PRESENT").length;
  const absent = students.filter((s) => s.status === "ABSENT").length;
  const unmarked = students.length - present - absent;

  const paperOptions = [
    { value: "", label: "Select Paper" },
    ...schedule.map((s) => ({ value: s.id, label: `${s.subject?.name} · ${fmtDate(s.examDate)}` })),
  ];

  const COLUMNS = [
    { key: "rollNumber", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "sectionName", label: "Section", render: (v) => v || "-" },
    {
      key: "status", label: "Status", render: (v) =>
        v === "PRESENT" ? <Badge variant="success" dot>Present</Badge>
          : v === "ABSENT" ? <Badge variant="danger" dot>Absent</Badge>
            : <Badge variant="default">Not marked</Badge>,
    },
    { key: "remarks", label: "Remarks", render: (v) => v || "-" },
  ];

  const EXPORT_COLS = [
    { label: "Roll No", get: (r) => r.rollNumber },
    { label: "Student", get: (r) => r.name },
    { label: "Section", get: (r) => r.sectionName },
    { label: "Status", get: (r) => r.status || "NOT MARKED" },
    { label: "Remarks", get: (r) => r.remarks || "" },
  ];

  const chip = (label, count, cls) => (
    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${cls}`}>{label}: {count}</span>
  );

  return (
    <div>
      <PageHeader title="View Exam Attendance" subtitle="Per-paper attendance summary" icon={<Eye size={18} />}>
        <ExportButton filename="exam-attendance.csv" rows={students} columns={EXPORT_COLS} />
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4 items-center">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-40" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-52" />
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} className="w-36" />
          <Select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} options={paperOptions} className="w-56" disabled={!schedule.length} />
          {scheduleId && !isFetching && (
            <div className="ml-auto flex gap-1.5">
              {chip("Present", present, "bg-emerald-50 text-emerald-600")}
              {chip("Absent", absent, "bg-red-50 text-red-600")}
              {chip("Unmarked", unmarked, "bg-slate-100 text-slate-500")}
            </div>
          )}
        </div>
        <DataTable columns={COLUMNS} data={students} loading={isFetching} emptyText={scheduleId ? "No students in this class." : "Pick session, exam, class and paper to view attendance."} />
      </Card>
    </div>
  );
}
