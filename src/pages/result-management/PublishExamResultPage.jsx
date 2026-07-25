/**
 * Result Management → Publish Exam Result
 * Summary of an exam's results for a section (total, %, grade) with a Publish /
 * Unpublish toggle and a downloadable PDF.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton, Badge } from "../../components/ui";
import { Megaphone, CheckCircle2, FileDown } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useGetExamPublishStatusQuery, usePublishExamResultMutation } from "../../redux/api/resultMgmtApi";
import { printTable } from "../../utils/printPdf";
import { sessionOptions, classOptions, sectionOptions, examOptions, StudentSearchBar, filterStudents, emptyStudentFilter } from "./_rmShared";

export default function PublishExamResultPage() {
  usePageTitle("Publish Exam Result");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [sf, setSf] = useState(emptyStudentFilter);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId });
  const ready = examId && sectionId;
  const { data, isFetching } = useGetExamPublishStatusQuery({ examId, sectionId }, { skip: !ready });
  const [publish, { isLoading: publishing }] = usePublishExamResultMutation();

  useEffect(() => { setSf(emptyStudentFilter); }, [examId, sectionId]);
  const visibleStudents = filterStudents(data?.students || [], sf);

  const doPublish = async (state) => {
    try { const res = await publish({ examId, sectionId, published: state }).unwrap(); toast.success(res.message); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };

  const download = () => printTable({
    title: `${data.exam?.name} — ${data.section?.className}/${data.section?.name}`,
    subtitle: "Exam Result",
    columns: ["Roll", "Student", ...(data.subjects || []).map((s) => s.name), "Total", "%", "Grade"],
    rows: (data.students || []).map((s) => [s.rollNumber, s.name, ...(data.subjects || []).map((sub) => { const v = s.marks?.[sub.id]; return v === null || v === undefined ? "" : v; }), `${s.obtained}/${s.total}`, `${s.percentage}%`, s.grade]),
  });

  return (
    <div className="space-y-4">
      <PageHeader title="Publish Exam Result" subtitle="Release results to students / parents" icon={<Megaphone size={18} />} />

      <Card title="Exam Result" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => setClassId(e.target.value)} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Exam *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="📢" title="Choose exam & section" description="Pick filters to load the result summary." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : (
        <Card noPadding title={`${data.exam?.name} — result summary`}
          action={<div className="flex items-center gap-2">
            {data.published ? <Badge variant="success">Published</Badge> : <Badge variant="warning">Not published</Badge>}
            <Button size="sm" variant="secondary" icon={<FileDown size={13} />} onClick={download}>Download PDF</Button>
            {data.published
              ? <Button size="sm" variant="danger" loading={publishing} onClick={() => doPublish(false)}>Unpublish</Button>
              : <Button size="sm" icon={<CheckCircle2 size={13} />} loading={publishing} onClick={() => doPublish(true)}>Publish</Button>}
          </div>}>
          <StudentSearchBar students={data.students || []} value={sf} onChange={setSf} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Roll</th>
                  <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-500 uppercase">Student</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">Obtained</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">Total</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">%</th>
                  <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-500 uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visibleStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/60">
                    <td className="px-3 py-2 text-slate-500">{s.rollNumber}</td>
                    <td className="px-3 py-2 font-medium text-slate-700">{s.name}</td>
                    <td className="px-3 py-2 text-center">{s.obtained}</td>
                    <td className="px-3 py-2 text-center text-slate-500">{s.total}</td>
                    <td className="px-3 py-2 text-center font-semibold">{s.percentage}%</td>
                    <td className="px-3 py-2 text-center">{s.grade || "—"}</td>
                  </tr>
                ))}
                {visibleStudents.length === 0 && <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-400">No students match your search.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
