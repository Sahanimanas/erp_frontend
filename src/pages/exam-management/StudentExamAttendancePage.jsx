/**
 * Exam Management → Student Exam Attendance
 * Mark present/absent per paper (exam → class → subject).
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select } from "../../components/ui";
import { UserCheck, Save, CheckCheck } from "lucide-react";
import { useGetExamScheduleQuery, useGetExamAttendanceQuery, useSaveExamAttendanceMutation } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions, fmtDate } from "./_examShared";

export default function StudentExamAttendancePage() {
  usePageTitle("Student Exam Attendance");
  const { years, session, setSession, exams, examId, setExamId } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [statuses, setStatuses] = useState({}); // studentId -> PRESENT | ABSENT

  const { data: schedule = [] } = useGetExamScheduleQuery({ examId, classId }, { skip: !examId || !classId });
  const { data, isFetching } = useGetExamAttendanceQuery(scheduleId, { skip: !scheduleId });
  const [save, { isLoading: saving }] = useSaveExamAttendanceMutation();

  const students = data?.students ?? [];

  useEffect(() => { setScheduleId(""); }, [examId, classId]);
  useEffect(() => {
    const seed = {};
    students.forEach((s) => { if (s.status) seed[s.studentId] = s.status; });
    setStatuses(seed);
  }, [data]);

  const paperOptions = [
    { value: "", label: "Select Paper" },
    ...schedule.map((s) => ({ value: s.id, label: `${s.subject?.name} · ${fmtDate(s.examDate)}` })),
  ];

  const submit = async () => {
    const records = Object.entries(statuses).map(([studentId, status]) => ({ studentId, status }));
    if (!records.length) { toast.error("Mark at least one student"); return; }
    try {
      const res = await save({ scheduleId, records }).unwrap();
      toast.success(`Saved ${res.saved} record(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save attendance"); }
  };

  const pill = (active, color) =>
    `px-2.5 py-1 rounded-md text-[11px] font-bold border transition-colors ${active ? color : "border-slate-200 text-slate-400 hover:bg-slate-50"}`;

  const COLUMNS = [
    { key: "rollNumber", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "sectionName", label: "Section", render: (v) => v || "-" },
    {
      key: "studentId", label: "Status", sortable: false, render: (v) => (
        <div className="flex gap-1.5">
          <button className={pill(statuses[v] === "PRESENT", "border-emerald-300 bg-emerald-50 text-emerald-600")} onClick={() => setStatuses((s) => ({ ...s, [v]: "PRESENT" }))}>Present</button>
          <button className={pill(statuses[v] === "ABSENT", "border-red-300 bg-red-50 text-red-600")} onClick={() => setStatuses((s) => ({ ...s, [v]: "ABSENT" }))}>Absent</button>
        </div>
      ),
    },
  ];

  const marked = Object.keys(statuses).length;

  return (
    <div>
      <PageHeader title="Student Exam Attendance" subtitle="Mark attendance for each paper" icon={<UserCheck size={18} />}>
        <Button size="sm" variant="secondary" icon={<CheckCheck size={13} />} disabled={!students.length}
          onClick={() => setStatuses(Object.fromEntries(students.map((s) => [s.studentId, "PRESENT"])))}>All Present</Button>
        <Button size="sm" variant="success" icon={<Save size={13} />} loading={saving} disabled={!scheduleId || !marked} onClick={submit}>Save Attendance</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-40" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-52" />
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} className="w-36" />
          <Select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} options={paperOptions} className="w-56" disabled={!schedule.length} />
          {scheduleId && <span className="ml-auto text-[11px] text-slate-500">{marked}/{students.length} marked</span>}
        </div>
        {examId && classId && !schedule.length && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 m-4 rounded-lg text-sm">
            No papers scheduled for this class — build the schedule under Manage Exam Schedule first.
          </div>
        )}
        <DataTable columns={COLUMNS} data={students} loading={isFetching} emptyText={scheduleId ? "No students in this class." : "Pick session, exam, class and paper to mark attendance."} />
      </Card>
    </div>
  );
}
