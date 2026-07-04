/**
 * Exam Management → Exam Hall Ticket
 * Per-student admit/hall tickets for a session's exam + class: identity, seat
 * and the class's paper schedule. Print one or all.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, SearchInput, Badge } from "../../components/ui";
import { Ticket, Printer } from "lucide-react";
import { useGetHallTicketsQuery } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions, printHallTickets } from "./_examShared";

export default function ExamHallTicketPage() {
  usePageTitle("Exam Hall Ticket");
  const { years, session, setSession, exams, examId, setExamId } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [search, setSearch] = useState("");

  const { data, isFetching } = useGetHallTicketsQuery({ examId, classId }, { skip: !examId || !classId });
  const students = data?.students ?? [];
  const filtered = students.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNumber).includes(search));

  const printMany = (list) => printHallTickets({ exam: data?.exam ?? {}, schedule: data?.schedule ?? [], students: list });

  const COLUMNS = [
    { key: "rollNumber", label: "Roll No" },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "className", label: "Class", render: (v, r) => `${v || ""}${r.sectionName ? `/${r.sectionName}` : ""}` },
    { key: "hall", label: "Hall", render: (v) => v || <Badge variant="warning">Not allocated</Badge> },
    { key: "seatNo", label: "Seat", render: (v) => v || "-" },
    { key: "id", label: "Actions", sortable: false, render: (_, r) => <Button size="xs" icon={<Printer size={11} />} onClick={() => printMany([r])}>Print Ticket</Button> },
  ];

  return (
    <div>
      <PageHeader title="Exam Hall Ticket" subtitle="Generate and print admit / hall tickets" icon={<Ticket size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} disabled={!filtered.length} onClick={() => printMany(filtered)}>Print All</Button>
      </PageHeader>
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-44" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-56" />
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} className="w-40" />
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search student..." className="w-52" />
        </div>
        {examId && classId && !isFetching && (data?.schedule?.length ?? 0) === 0 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 p-3 m-4 rounded-lg text-sm">
            No papers scheduled for this class yet — tickets will print without a schedule table. Build it under Manage Exam Schedule.
          </div>
        )}
        <DataTable columns={COLUMNS} data={filtered} loading={isFetching} emptyText={examId && classId ? "No students in this class." : "Pick session, exam and class to generate tickets."} />
      </Card>
    </div>
  );
}
