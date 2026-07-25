/**
 * Result Management → Manage / Add Exam Result
 * Student Exam Subject Result Management: pick Session/Class/Section/Exam/Subject,
 * enter each student's Scored Marks, Update. Writes the SHARED StudentMark table
 * used by Exam Management (results stay in sync both ways).
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { ClipboardEdit, Save } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery, useGetClassSubjectsQuery } from "../../redux/api/examMgmtApi";
import { useGetExamResultQuery, useSaveExamResultMutation } from "../../redux/api/resultMgmtApi";
import { SORT_OPTIONS, sessionOptions, classOptions, sectionOptions, examOptions, StudentSearchBar, filterStudents, emptyStudentFilter } from "./_rmShared";

export default function ExamResultEntryPage({ title = "Manage Exam Result" }) {
  usePageTitle(title);
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [scores, setScores] = useState({}); // studentId -> value
  const [sf, setSf] = useState(emptyStudentFilter);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId }, { skip: false });
  const { data: classSubjects = [] } = useGetClassSubjectsQuery(classId, { skip: !classId });
  const ready = examId && sectionId && subjectId;
  const { data, isFetching } = useGetExamResultQuery({ examId, sectionId, subjectId, sortBy }, { skip: !ready });
  const [save, { isLoading: saving }] = useSaveExamResultMutation();

  const subjects = useMemo(() => classSubjects.map((cs) => cs.subject).filter(Boolean), [classSubjects]);

  useEffect(() => { setSectionId(""); setSubjectId(""); }, [classId]);
  useEffect(() => { setSf(emptyStudentFilter); }, [examId, sectionId, subjectId]);
  const visibleStudents = filterStudents(data?.students || [], sf);
  useEffect(() => {
    const seed = {};
    (data?.students || []).forEach((s) => { seed[s.id] = s.scored === null || s.scored === undefined ? "" : String(s.scored); });
    setScores(seed);
  }, [data]);

  const submit = async () => {
    const marks = (data?.students || []).map((s) => ({ studentId: s.id, scored: scores[s.id] === "" ? null : Number(scores[s.id]) }));
    try {
      const res = await save({ examId, sectionId, subjectId, marks }).unwrap();
      toast.success(res.message || "Updated");
    } catch (e) { toast.error(e?.data?.error || "Failed to update"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Student Exam Subject Result Management" subtitle="Enter subject-wise scored marks" icon={<ClipboardEdit size={18} />} />

      <Card title="Exam Result" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Exam *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
          <Select label="Sort By *" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={SORT_OPTIONS} />
          <Select label="Subject *" value={subjectId} onChange={(e) => setSubjectId(e.target.value)} disabled={!classId} options={[{ value: "", label: "Select..." }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="📝" title="Choose exam, section & subject" description="Pick the filters above to load the marks grid." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : (
        <Card noPadding title={`${data.exam?.name} || ${data.subject?.name}`}
          action={<Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Exam Result</Button>}>
          <StudentSearchBar students={data.students || []} value={sf} onChange={setSf} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Student Name</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Reg No</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Roll No</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Father Name</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">Total Marks</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">{data.subject?.name} — Scored</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-700">{s.name}</td>
                    <td className="px-3 py-2 text-slate-500">{s.registrationNo}</td>
                    <td className="px-3 py-2 text-slate-500">{s.rollNumber}</td>
                    <td className="px-3 py-2 text-slate-500">{s.fatherName}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{data.totalMarks}</td>
                    <td className="px-3 py-2 text-center">
                      <input type="number" min={0} max={data.totalMarks} value={scores[s.id] ?? ""} placeholder="Absent"
                        onChange={(e) => setScores((m) => ({ ...m, [s.id]: e.target.value }))}
                        className="w-24 px-2 py-1 text-[13px] text-center border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                    </td>
                  </tr>
                ))}
                {data.students.length > 0 && visibleStudents.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">No students match your search.</td></tr>}
                {data.students.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">No students in this section.</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="p-4 flex justify-end border-t border-slate-100">
            <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Exam Result</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
