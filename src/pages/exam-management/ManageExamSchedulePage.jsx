/**
 * Exam Management → Manage Exam Schedule
 * For a session → exam → class, set every detail of each paper: name, date,
 * time, room, exam code, invigilator, marks and the sub-subject flag.
 *
 * Rows are papers, not subjects — one subject may hold several papers (Sanskrit
 * "Theory" and Sanskrit "Oral"), so the grid is a flat list keyed by a local
 * `key` and each saved row carries its server `id`.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CalendarClock, Save, Plus, Trash2 } from "lucide-react";
import {
  useGetExamScheduleQuery, useSaveExamScheduleMutation, useDeleteScheduleItemMutation,
  useGetClassSubjectsQuery, useGetAllSubjectsQuery, useGetInvigilatorsQuery,
} from "../../redux/api/examMgmtApi";
import { useSessionExams, useOrderedClasses, sessionOptions, examOptions, classOptions } from "./_examShared";

const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

const blankPaper = (subjectId, paperName = "Theory") => ({
  key: `new-${subjectId}-${paperName}-${Math.random().toString(36).slice(2, 8)}`,
  id: null, subjectId, paperName,
  examDate: "", startTime: "09:00", endTime: "12:00",
  room: "", examCode: "", invigilatorId: "", subSubject: false,
  maxMarks: 100, minMarks: 33,
});

export default function ManageExamSchedulePage() {
  usePageTitle("Manage Exam Schedule");
  const { years, session, setSession, exams, examId, setExamId, exam } = useSessionExams();
  const classes = useOrderedClasses();
  const [classId, setClassId] = useState("");
  const [papers, setPapers] = useState([]);

  const { data: classSubjects = [] } = useGetClassSubjectsQuery(classId, { skip: !classId });
  const { data: allSubjects = [] } = useGetAllSubjectsQuery(undefined, { skip: !classId || classSubjects.length > 0 });
  const { data: schedule, isFetching } = useGetExamScheduleQuery({ examId, classId }, { skip: !examId || !classId });
  const { data: staff = [] } = useGetInvigilatorsQuery();
  const [save, { isLoading: saving }] = useSaveExamScheduleMutation();
  const [deleteItem] = useDeleteScheduleItemMutation();

  // The subjects the schedule grid is built from: mapped class subjects when
  // configured, otherwise every subject of the school.
  const subjects = useMemo(() => {
    if (classSubjects.length) return classSubjects.map((cs) => cs.subject).filter(Boolean);
    return allSubjects;
  }, [classSubjects, allSubjects]);

  const invigilatorOptions = useMemo(() => [
    { value: "", label: "Select…" },
    ...staff.map((e) => ({
      value: e.id,
      label: [e.user?.firstName, e.user?.lastName].filter(Boolean).join(" ") || e.employeeCode || "Staff",
    })),
  ], [staff]);

  // Seed the grid from the saved schedule, then top it up with a blank paper for
  // every subject that has none yet. Guard on real data — a defaulted [] would
  // re-seed (and wipe unsaved edits) on every render.
  useEffect(() => {
    if (!schedule || !subjects.length) return;
    const saved = schedule.map((s) => ({
      key: s.id,
      id: s.id,
      subjectId: s.subjectId,
      paperName: s.paperName || "Theory",
      examDate: toInputDate(s.examDate),
      startTime: s.startTime, endTime: s.endTime,
      room: s.room || "", examCode: s.examCode || "",
      invigilatorId: s.invigilatorId || "", subSubject: !!s.subSubject,
      maxMarks: s.maxMarks, minMarks: s.minMarks,
    }));
    const scheduled = new Set(saved.map((p) => p.subjectId));
    const blanks = subjects.filter((s) => !scheduled.has(s.id)).map((s) => blankPaper(s.id));
    setPapers([...saved, ...blanks]);
  }, [schedule, subjects]);

  const set = (key, patch) => setPapers((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));

  const addPaper = (subjectId) => {
    // Name the new paper after what the subject already has, so the second
    // paper of a subject doesn't collide with the first on (subject, paperName).
    const used = papers.filter((p) => p.subjectId === subjectId).map((p) => p.paperName);
    const next = ["Theory", "Oral", "Practical", "Main"].find((n) => !used.includes(n)) || `Paper ${used.length + 1}`;
    setPapers((ps) => [...ps, blankPaper(subjectId, next)]);
  };

  const removePaper = async (p) => {
    if (!p.id) { setPapers((ps) => ps.filter((x) => x.key !== p.key)); return; }
    const sub = subjects.find((s) => s.id === p.subjectId);
    if (!confirm(`Remove ${sub?.name || "this subject"} (${p.paperName}) from the schedule?`)) return;
    try {
      await deleteItem(p.id).unwrap();
      setPapers((ps) => ps.filter((x) => x.key !== p.key));
      toast.success("Paper removed");
    } catch (e) { toast.error(e?.data?.error || "Failed to remove"); }
  };

  const submit = async () => {
    const items = papers
      .filter((p) => p.examDate)
      .map(({ key, ...rest }) => rest); // eslint-disable-line no-unused-vars
    if (!items.length) { toast.error("Set a date on at least one paper"); return; }
    const dupe = items.find((it, i) =>
      items.findIndex((o) => o.subjectId === it.subjectId && o.paperName.trim() === it.paperName.trim()) !== i);
    if (dupe) { toast.error(`Two papers share the name "${dupe.paperName}" on the same subject`); return; }
    try {
      const res = await save({ examId, classId, items }).unwrap();
      toast.success(`Saved ${res.saved} paper(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save schedule"); }
  };

  const cell = "px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400";
  const ready = session && examId && classId;

  // Papers grouped under their subject, in the subject order of the grid.
  const grouped = useMemo(() => subjects.map((sub) => ({
    subject: sub,
    rows: papers.filter((p) => p.subjectId === sub.id),
  })), [subjects, papers]);

  const HEADERS = ["Subject", "Paper", "Exam Date", "Start Time", "End Time", "Room", "Exam Code", "Invigilator", "Max Marks", "Pass Marks", "Sub Subject", ""];

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Exam Schedule" subtitle="Set each paper's name, date, time, room, invigilator and marks" icon={<CalendarClock size={18} />}>
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
            <table className="w-full text-sm min-w-[1500px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {HEADERS.map((h, i) => (
                    <th key={i} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {grouped.map(({ subject: sub, rows }) => rows.map((p, i) => (
                  <tr key={p.key} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2 font-semibold text-slate-800 text-[12.5px] align-middle">
                      {/* Only the first paper of a subject repeats its name. */}
                      {i === 0 ? (
                        <div className="flex items-center gap-2">
                          <span>{sub.name}{sub.code ? <span className="text-slate-400 font-normal"> · {sub.code}</span> : null}</span>
                          <button type="button" title="Add another paper for this subject" onClick={() => addPaper(sub.id)}
                            className="p-1 rounded-md hover:bg-indigo-50 text-indigo-500"><Plus size={13} /></button>
                        </div>
                      ) : <span className="text-slate-300 pl-2">↳</span>}
                    </td>
                    <td className="px-4 py-2"><input value={p.paperName} onChange={(e) => set(p.key, { paperName: e.target.value })} placeholder="Theory" className={`${cell} w-28`} /></td>
                    <td className="px-4 py-2"><input type="date" value={p.examDate} min={toInputDate(exam?.startDate)} max={toInputDate(exam?.endDate)} onChange={(e) => set(p.key, { examDate: e.target.value })} className={`${cell} w-36`} /></td>
                    <td className="px-4 py-2"><input type="time" value={p.startTime} onChange={(e) => set(p.key, { startTime: e.target.value })} className={`${cell} w-28`} /></td>
                    <td className="px-4 py-2"><input type="time" value={p.endTime} onChange={(e) => set(p.key, { endTime: e.target.value })} className={`${cell} w-28`} /></td>
                    <td className="px-4 py-2"><input value={p.room} onChange={(e) => set(p.key, { room: e.target.value })} placeholder="Room 101" className={`${cell} w-28`} /></td>
                    <td className="px-4 py-2"><input value={p.examCode} onChange={(e) => set(p.key, { examCode: e.target.value })} placeholder="Code" className={`${cell} w-24`} /></td>
                    <td className="px-4 py-2">
                      <select value={p.invigilatorId} onChange={(e) => set(p.key, { invigilatorId: e.target.value })} className={`${cell} w-40 bg-white`}>
                        {invigilatorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2"><input type="number" min="0" value={p.maxMarks} onChange={(e) => set(p.key, { maxMarks: e.target.value })} className={`${cell} w-20`} /></td>
                    <td className="px-4 py-2"><input type="number" min="0" value={p.minMarks} onChange={(e) => set(p.key, { minMarks: e.target.value })} className={`${cell} w-20`} /></td>
                    <td className="px-4 py-2 text-center">
                      <input type="checkbox" checked={p.subSubject} onChange={(e) => set(p.key, { subSubject: e.target.checked })} className="h-4 w-4 accent-indigo-500" />
                    </td>
                    <td className="px-4 py-2">
                      <button type="button" title={p.id ? "Remove paper" : "Discard row"} onClick={() => removePaper(p)}
                        className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                )))}
              </tbody>
            </table>
            <p className="px-4 py-3 text-[11px] text-slate-400">
              Only rows with a date are saved. Use <span className="text-indigo-500">+</span> to give a subject a second paper (e.g. Theory and Oral); clearing a date does not delete a saved paper — use the bin icon.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}
