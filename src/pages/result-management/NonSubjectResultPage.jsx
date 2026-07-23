/**
 * Result Management → Manage / View NonSubject Result
 * Co-curricular items (Music, Dance…) graded per Term. Non-subjects come from
 * Class Management → Add Non-Subject.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { Music, Save } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetNonSubjectResultQuery, useSaveNonSubjectResultMutation } from "../../redux/api/resultMgmtApi";
import { SORT_OPTIONS, TERMS, sessionOptions, classOptions, sectionOptions, showMark } from "./_rmShared";

export default function NonSubjectResultPage({ editable = true }) {
  usePageTitle(editable ? "Manage NonSubject Result" : "View NonSubject Result");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [term, setTerm] = useState("Term 1");
  const [sortBy, setSortBy] = useState("Name");
  const [grid, setGrid] = useState({});

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const ready = sectionId && term;
  const { data, isFetching } = useGetNonSubjectResultQuery({ sectionId, term, sortBy }, { skip: !ready });
  const [save, { isLoading: saving }] = useSaveNonSubjectResultMutation();

  useEffect(() => { setSectionId(""); }, [classId]);
  useEffect(() => {
    const seed = {};
    (data?.students || []).forEach((s) => {
      seed[s.id] = {};
      (data.nonSubjects || []).forEach((n) => { const v = s.marks?.[n.id]; seed[s.id][n.id] = v === null || v === undefined ? "" : String(v); });
    });
    setGrid(seed);
  }, [data]);

  const submit = async () => {
    const rows = (data?.students || []).map((s) => ({
      studentId: s.id,
      marks: Object.fromEntries((data.nonSubjects || []).map((n) => [n.id, grid[s.id]?.[n.id] === "" ? null : Number(grid[s.id]?.[n.id])])),
    }));
    try { const res = await save({ sectionId, term, rows }).unwrap(); toast.success(res.message || "Updated"); }
    catch (e) { toast.error(e?.data?.error || "Failed to update"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Student NonSubject Result Management" subtitle="Co-curricular grades per term" icon={<Music size={18} />} />

      <Card title="NonSubject Exam Result" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Term *" value={term} onChange={(e) => setTerm(e.target.value)} options={TERMS} />
          <Select label="Sort By *" value={sortBy} onChange={(e) => setSortBy(e.target.value)} options={SORT_OPTIONS} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="🎵" title="Choose section & term" description="Pick the filters above to load the grid." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : (data.nonSubjects || []).length === 0 ? (
        <Card noPadding><EmptyState icon="📭" title="No non-subjects" description="Add non-subjects under Class Management → Add Non-Subject." /></Card>
      ) : (
        <Card noPadding title={`Non-Subject — ${term}`}
          action={editable ? <Button size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Update Result</Button> : null}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[820px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Student</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Roll No</th>
                  {(data.nonSubjects || []).map((n) => (
                    <th key={n.id} className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">{n.name}<div className="text-[9px] text-slate-400 font-normal">/ {n.totalMarks}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 font-medium text-slate-700">{s.name}</td>
                    <td className="px-3 py-2 text-slate-500">{s.rollNumber}</td>
                    {(data.nonSubjects || []).map((n) => (
                      <td key={n.id} className="px-2 py-2 text-center">
                        {editable ? (
                          <input type="number" min={0} max={n.totalMarks} value={grid[s.id]?.[n.id] ?? ""} placeholder="Ab"
                            onChange={(e) => setGrid((g) => ({ ...g, [s.id]: { ...g[s.id], [n.id]: e.target.value } }))}
                            className="w-16 px-1.5 py-1 text-[13px] text-center border border-slate-200 rounded focus:outline-none focus:border-indigo-400" />
                        ) : (
                          <span className={s.marks?.[n.id] == null ? "text-slate-300" : "font-medium text-slate-700"}>{showMark(s.marks?.[n.id])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
