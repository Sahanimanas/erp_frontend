/**
 * Result Management → Manage All Exam Result (editable) / View All Exam Result (read-only)
 * Every class subject as a column; enter/view scored marks for the whole exam at
 * once. Writes the shared StudentMark table (synced with Exam Management).
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { Table2, Save } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useGetAllExamResultQuery, useSaveAllExamResultMutation } from "../../redux/api/resultMgmtApi";
import { SORT_OPTIONS, sessionOptions, classOptions, sectionOptions, examOptions, showMark } from "./_rmShared";

export default function AllExamResultPage({ editable = true }) {
  usePageTitle(editable ? "Manage All Exam Result" : "View All Exam Result");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [sortBy, setSortBy] = useState("Name");
  const [grid, setGrid] = useState({}); // studentId -> { subjectId: value }

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId });
  const ready = examId && sectionId;
  const { data, isFetching } = useGetAllExamResultQuery({ examId, sectionId, sortBy }, { skip: !ready });
  const [save, { isLoading: saving }] = useSaveAllExamResultMutation();

  useEffect(() => { setSectionId(""); }, [classId]);
  useEffect(() => {
    const seed = {};
    (data?.students || []).forEach((s) => {
      seed[s.id] = {};
      (data.subjects || []).forEach((c) => { const v = s.marks?.[c.id]; seed[s.id][c.id] = v === null || v === undefined ? "" : String(v); });
    });
    setGrid(seed);
  }, [data]);

  const submit = async () => {
    const rows = (data?.students || []).map((s) => ({
      studentId: s.id,
      marks: Object.fromEntries((data.subjects || []).map((c) => [c.id, grid[s.id]?.[c.id] === "" ? null : Number(grid[s.id]?.[c.id])])),
    }));
    try { const res = await save({ examId, sectionId, rows }).unwrap(); toast.success(res.message || "Updated"); }
    catch (e) { toast.error(e?.data?.error || "Failed to update"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title={editable ? "Student Exam Result Management" : "View Exam Result"} subtitle="All subjects for an exam" icon={<Table2 size={18} />} />

      <Card title="Exam Result" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Exam *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
          <Select label="Sort By *" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={SORT_OPTIONS} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="📊" title="Choose exam & section" description="Pick the filters above to load results." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : (
        <Card noPadding title={data.exam?.name}
          action={editable ? <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Exam Result</Button> : null}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase sticky left-0 bg-slate-50">Student</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Roll No</th>
                  {(data.subjects || []).map((c) => (
                    <th key={c.id} className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">{c.name}<div className="text-[9px] text-slate-400 font-normal">/ {c.totalMarks}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-700 sticky left-0 bg-white">{s.name}</td>
                    <td className="px-3 py-2 text-slate-500">{s.rollNumber}</td>
                    {(data.subjects || []).map((c) => (
                      <td key={c.id} className="px-2 py-2 text-center">
                        {editable ? (
                          <input type="number" min={0} max={c.totalMarks} value={grid[s.id]?.[c.id] ?? ""} placeholder="Ab"
                            onChange={(e) => setGrid((g) => ({ ...g, [s.id]: { ...g[s.id], [c.id]: e.target.value } }))}
                            className="w-16 px-1.5 py-1 text-[13px] text-center border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                        ) : (
                          <span className={s.marks?.[c.id] === null || s.marks?.[c.id] === undefined ? "text-slate-300" : "font-medium text-slate-700"}>{showMark(s.marks?.[c.id])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {data.students.length === 0 && <tr><td colSpan={(data.subjects?.length || 0) + 2} className="px-3 py-8 text-center text-slate-400">No students in this section.</td></tr>}
              </tbody>
            </table>
          </div>
          {editable && (
            <div className="p-4 flex justify-end border-t border-slate-100">
              <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Exam Result</Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
