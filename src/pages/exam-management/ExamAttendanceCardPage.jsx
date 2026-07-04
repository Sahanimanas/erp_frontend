/**
 * Exam Management → Exam Attendance Card
 * Printable invigilator sheet for a paper: roll, student, seat and a blank
 * signature column.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select } from "../../components/ui";
import { ClipboardCheck, Printer } from "lucide-react";
import { useGetExamScheduleQuery, useGetExamAttendanceQuery, useGetSeatingQuery } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions, fmtDate } from "./_examShared";
import { printTable } from "../../utils/printPdf";

export default function ExamAttendanceCardPage() {
  usePageTitle("Exam Attendance Card");
  const { years, session, setSession, sessionName, exams, examId, setExamId, exam } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [scheduleId, setScheduleId] = useState("");

  const { data: schedule = [] } = useGetExamScheduleQuery({ examId, classId }, { skip: !examId || !classId });
  const { data, isFetching } = useGetExamAttendanceQuery(scheduleId, { skip: !scheduleId });
  const { data: seats = [] } = useGetSeatingQuery({ examId, classId }, { skip: !examId || !classId });
  useEffect(() => { setScheduleId(""); }, [examId, classId]);

  const paper = schedule.find((s) => s.id === scheduleId);
  const seatByStudent = new Map(seats.map((s) => [s.studentId, s.seatNo]));
  const students = (data?.students ?? []).map((s) => ({ ...s, seatNo: seatByStudent.get(s.studentId) || "-" }));

  const paperOptions = [
    { value: "", label: "Select Paper" },
    ...schedule.map((s) => ({ value: s.id, label: `${s.subject?.name} · ${fmtDate(s.examDate)}` })),
  ];

  const print = () => printTable({
    title: `Exam Attendance Card — ${exam?.name || ""}`,
    subtitle: [
      sessionName && `Session ${sessionName}`,
      paper && `${paper.subject?.name} · ${fmtDate(paper.examDate)} · ${paper.startTime}-${paper.endTime}`,
      classId && `Class ${classes.find((c) => c.id === classId)?.name || ""}`,
    ].filter(Boolean).join("  ·  "),
    columns: ["Roll No", "Student", "Section", "Seat", "Signature"],
    rows: students.map((s) => [s.rollNumber, s.name, s.sectionName || "-", s.seatNo, ""]),
    footer: `Total students: ${students.length} · Invigilator signature: ______________________`,
  });

  const COLUMNS = [
    { key: "rollNumber", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "sectionName", label: "Section", render: (v) => v || "-" },
    { key: "seatNo", label: "Seat" },
    { key: "studentId", label: "Signature", sortable: false, render: () => <span className="text-slate-300">____________</span> },
  ];

  return (
    <div>
      <PageHeader title="Exam Attendance Card" subtitle="Print the invigilator's signature sheet for a paper" icon={<ClipboardCheck size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} disabled={!students.length} onClick={print}>Print Card</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-40" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-52" />
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} className="w-36" />
          <Select value={scheduleId} onChange={(e) => setScheduleId(e.target.value)} options={paperOptions} className="w-56" disabled={!schedule.length} />
        </div>
        <DataTable columns={COLUMNS} data={students} loading={isFetching} emptyText={scheduleId ? "No students in this class." : "Pick session, exam, class and paper to build the sheet."} />
      </Card>
    </div>
  );
}
