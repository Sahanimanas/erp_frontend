/**
 * Exam Management → View Exam Schedule
 * Read-only schedule for a session → exam (optionally one class), printable.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select } from "../../components/ui";
import { CalendarDays, FileDown, Trash2 } from "lucide-react";
import { useGetExamScheduleQuery, useDeleteScheduleItemMutation } from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions, fmtDate } from "./_examShared";
import { printTable } from "../../utils/printPdf";

export default function ViewExamSchedulePage() {
  usePageTitle("View Exam Schedule");
  const { years, session, setSession, sessionName, exams, examId, setExamId, exam } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const { data: rows = [], isFetching } = useGetExamScheduleQuery({ examId, classId: classId || undefined }, { skip: !examId });
  const [deleteItem] = useDeleteScheduleItemMutation();

  const remove = async (r) => {
    if (!confirm(`Remove ${r.subject?.name} (${r.class?.name}) from the schedule?`)) return;
    try { await deleteItem(r.id).unwrap(); toast.success("Paper removed"); }
    catch (e) { toast.error(e?.data?.error || "Failed to remove"); }
  };

  const COLUMNS = [
    { key: "class", label: "Class", sortable: false, render: (v) => <span className="font-medium">{v?.name}</span> },
    { key: "subject", label: "Subject", sortable: false, render: (v) => <span className="font-semibold text-slate-800">{v?.name}</span> },
    { key: "examDate", label: "Date", render: (v) => fmtDate(v) },
    { key: "startTime", label: "Time", render: (v, r) => `${v} - ${r.endTime}` },
    { key: "room", label: "Room", render: (v) => v || "-" },
    { key: "maxMarks", label: "Max Marks" },
    { key: "minMarks", label: "Pass Marks" },
    { key: "id", label: "", sortable: false, render: (_, r) => <button title="Remove paper" onClick={() => remove(r)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button> },
  ];

  const downloadPdf = () => printTable({
    title: `${exam?.name || "Exam"} Schedule`,
    subtitle: [sessionName && `Session ${sessionName}`, classId && classes.find((c) => c.id === classId)?.name && `Class ${classes.find((c) => c.id === classId).name}`].filter(Boolean).join("  ·  "),
    columns: ["Class", "Subject", "Date", "Time", "Room", "Max Marks", "Pass Marks"],
    rows: rows.map((r) => [r.class?.name, r.subject?.name, fmtDate(r.examDate), `${r.startTime} - ${r.endTime}`, r.room || "-", r.maxMarks, r.minMarks]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="View Exam Schedule" subtitle="Full paper schedule of an exam" icon={<CalendarDays size={18} />}>
        <Button size="sm" icon={<FileDown size={13} />} disabled={!rows.length} onClick={downloadPdf}>Download PDF</Button>
      </PageHeader>

      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} className="w-44" />
          <Select value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} className="w-56" />
          <Select value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes, "All Classes")} className="w-40" />
        </div>
        <DataTable
          columns={COLUMNS}
          data={rows}
          loading={isFetching}
          emptyText={examId ? "No papers scheduled yet. Build the schedule under Manage Exam Schedule." : "Pick a session and exam to view its schedule."}
        />
      </Card>
    </div>
  );
}
