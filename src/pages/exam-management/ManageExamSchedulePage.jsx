/**
 * Exam Management → Manage Exam Schedule
 * For a session → exam → class, set the date/time/room/marks of each subject's
 * paper. Rows are the class's mapped subjects (falls back to all subjects).
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarClock, Save } from "lucide-react";
import {
  useGetExamScheduleQuery, useSaveExamScheduleMutation,
  useGetClassSubjectsQuery, useGetAllSubjectsQuery,
} from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions } from "./_examShared";

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export default function ManageExamSchedulePage() {
  usePageTitle("Manage Exam Schedule");
  const { years, session, setSession, exams, examId, setExamId, exam } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [rowsState, setRowsState] = useState({}); // subjectId -> {examDate, startTime, endTime, room, maxMarks, minMarks}

  const { data: classSubjects = [] } = useGetClassSubjectsQuery(classId, { skip: !classId });
  const { data: allSubjects = [] } = useGetAllSubjectsQuery(undefined, { skip: !classId || classSubjects.length > 0 });
  const { data: schedule, isFetching } = useGetExamScheduleQuery({ examId, classId }, { skip: !examId || !classId });
  const [save, { isLoading: saving }] = useSaveExamScheduleMutation();

  // The subjects the schedule grid is built from: mapped class subjects when
  // configured, otherwise every subject of the school.
  const subjects = useMemo(() => {
    if (classSubjects.length) return classSubjects.map((cs) => cs.subject).filter(Boolean);
    return allSubjects;
  }, [classSubjects, allSubjects]);

  // Seed grid state from the saved schedule whenever exam/class change.
  // Guard on real data — a defaulted [] would re-seed on every render.
  useEffect(() => {
    if (!schedule) return;
    const seed = {};
    schedule.forEach((s) => {
      seed[s.subjectId] = {
        examDate: s.examDate ? new Date(s.examDate).toISOString().slice(0, 10) : "",
        startTime: s.startTime, endTime: s.endTime, room: s.room || "",
        maxMarks: s.maxMarks, minMarks: s.minMarks,
      };
    });
    setRowsState(seed);
  }, [schedule]);

  const set = (subjectId, patch) =>
    setRowsState((s) => ({ ...s, [subjectId]: { startTime: "09:00", endTime: "12:00", room: "", maxMarks: 100, minMarks: 33, examDate: "", ...s[subjectId], ...patch } }));

  const submit = async () => {
    const items = Object.entries(rowsState)
      .filter(([, v]) => v.examDate)
      .map(([subjectId, v]) => ({ subjectId, ...v }));
    if (!items.length) { toast.error("Set a date on at least one subject"); return; }
    try {
      const res = await save({ examId, classId, items }).unwrap();
      toast.success(`Saved ${res.saved} paper(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save schedule"); }
  };

  const cell = "px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400";
  const ready = session && examId && classId;

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Exam Schedule" subtitle="Set each subject's paper date, time, room and marks" icon={<CalendarClock size={18} />}>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!ready || !subjects.length} onClick={submit}>Save Schedule</Button>
      </PageHeader>

      <Card title="Select Exam">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => { setSession(e.target.value); setExamId(""); }} options={sessionOptions(years)} />
          <Select label="Exam *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
        </div>
      </Card>

      <Card noPadding title={exam ? `Paper Schedule — dates allowed ${new Date(exam.startDate).toLocaleDateString("en-GB")} to ${new Date(exam.endDate).toLocaleDateString("en-GB")}` : "Paper Schedule"}>
        {!ready ? (
          <EmptyState icon="🗓️" title="Pick session, exam and class" description="Choose an exam and class to build its paper schedule." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : subjects.length === 0 ? (
          <EmptyState icon="📚" title="No subjects found" description="Create subjects (Academic → Subjects) before scheduling papers." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[860px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Subject", "Exam Date", "Start Time", "End Time", "Room", "Max Marks", "Pass Marks"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {subjects.map((sub) => {
                  const st = rowsState[sub.id] || {};
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2 font-semibold text-slate-800 text-[12.5px]">{sub.name}{sub.code ? <span className="text-slate-400 font-normal"> · {sub.code}</span> : null}</td>
                      <td className="px-4 py-2"><input type="date" value={st.examDate || ""} min={toInputDate(exam?.startDate)} max={toInputDate(exam?.endDate)} onChange={(e) => set(sub.id, { examDate: e.target.value })} className={`${cell} w-36`} /></td>
                      <td className="px-4 py-2"><input type="time" value={st.startTime || "09:00"} onChange={(e) => set(sub.id, { startTime: e.target.value })} className={`${cell} w-28`} /></td>
                      <td className="px-4 py-2"><input type="time" value={st.endTime || "12:00"} onChange={(e) => set(sub.id, { endTime: e.target.value })} className={`${cell} w-28`} /></td>
                      <td className="px-4 py-2"><input value={st.room || ""} onChange={(e) => set(sub.id, { room: e.target.value })} placeholder="Room 101" className={`${cell} w-28`} /></td>
                      <td className="px-4 py-2"><input type="number" min="0" value={st.maxMarks ?? 100} onChange={(e) => set(sub.id, { maxMarks: e.target.value })} className={`${cell} w-20`} /></td>
                      <td className="px-4 py-2"><input type="number" min="0" value={st.minMarks ?? 33} onChange={(e) => set(sub.id, { minMarks: e.target.value })} className={`${cell} w-20`} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="px-4 py-3 text-[11px] text-slate-400">Only rows with a date are saved. Clearing a date does not delete an already-saved paper — remove it from View Exam Schedule.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
