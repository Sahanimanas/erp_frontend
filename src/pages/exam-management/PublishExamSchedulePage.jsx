/**
 * Exam Management → Publish Exam Schedule
 * Flip a session's exams between draft / published / closed. Publishing marks
 * the schedule as final (hall tickets reference published exams).
 */
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, Select, Badge } from "../../components/ui";
import { Send, CheckCircle, Undo2, Lock } from "lucide-react";
import { useSetExamStatusMutation } from "../../redux/api/examMgmtApi";
import { useSessionExams, typeLabel, fmtDate, STATUS_BADGE, sessionOptions } from "./_examShared";

export default function PublishExamSchedulePage() {
  usePageTitle("Publish Exam Schedule");
  const { years, session, setSession, exams, examsLoading } = useSessionExams();
  const [setStatus, { isLoading }] = useSetExamStatusMutation();

  const change = async (exam, status, label) => {
    if (status === "closed" && !confirm(`Close "${exam.name}"? Closed exams are archived.`)) return;
    try {
      await setStatus({ id: exam.id, status }).unwrap();
      toast.success(`${exam.name} ${label}`);
    } catch (e) { toast.error(e?.data?.error || "Failed to update status"); }
  };

  const COLUMNS = [
    { key: "name", label: "Exam Name", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "type", label: "Type", render: (v) => typeLabel(v) },
    { key: "startDate", label: "From", render: (v) => fmtDate(v) },
    { key: "endDate", label: "To", render: (v) => fmtDate(v) },
    { key: "_count", label: "Papers Scheduled", sortable: false, render: (v) => <span className={`font-semibold ${v?.schedules ? "text-indigo-600" : "text-red-400"}`}>{v?.schedules ?? 0}</span> },
    { key: "status", label: "Status", render: (v) => <Badge variant={STATUS_BADGE[v] || "default"} dot>{v}</Badge> },
    {
      key: "id", label: "Actions", sortable: false, render: (_, r) => (
        <div className="flex gap-1.5">
          {r.status === "draft" && (
            <Button size="xs" icon={<Send size={11} />} disabled={isLoading || !(r._count?.schedules)} title={r._count?.schedules ? "" : "Schedule papers first"} onClick={() => change(r, "published", "published")}>Publish</Button>
          )}
          {r.status === "published" && (
            <>
              <Button size="xs" variant="secondary" icon={<Undo2 size={11} />} disabled={isLoading} onClick={() => change(r, "draft", "moved back to draft")}>Unpublish</Button>
              <Button size="xs" variant="secondary" icon={<Lock size={11} />} disabled={isLoading} onClick={() => change(r, "closed", "closed")}>Close</Button>
            </>
          )}
          {r.status === "closed" && (
            <Button size="xs" variant="secondary" icon={<CheckCircle size={11} />} disabled={isLoading} onClick={() => change(r, "published", "re-opened")}>Re-open</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Publish Exam Schedule" subtitle="Make an exam's schedule official" icon={<Send size={18} />} />
      <Card noPadding>
        <div className="flex flex-wrap gap-2 border-b border-slate-100 p-4">
          <Select value={session} onChange={(e) => setSession(e.target.value)} options={sessionOptions(years)} className="w-44" />
        </div>
        <DataTable columns={COLUMNS} data={exams} loading={examsLoading} emptyText="No exams in this session. Create one under Manage Exam." />
      </Card>
    </div>
  );
}
