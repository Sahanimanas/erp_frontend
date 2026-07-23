/**
 * Result Management → Generate Report Card
 * Aggregates an exam's marks + non-subjects + remark into a stored report card
 * per student (Class-Wise or a single student). View / Publish read these.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Skeleton } from "../../components/ui";
import { FileBadge, Sparkles, CheckCircle2 } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useGenerateReportCardsMutation } from "../../redux/api/resultMgmtApi";
import { sessionOptions, classOptions, sectionOptions, examOptions } from "./_rmShared";

export default function GenerateReportCardPage() {
  usePageTitle("Generate Report Card");
  const [mode, setMode] = useState("class"); // class | student
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [done, setDone] = useState(null);

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId });
  const [generate, { isLoading }] = useGenerateReportCardsMutation();

  const examName = exams.find((e) => e.id === examId)?.name || "";

  const submit = async () => {
    if (!sectionId || !examId) return toast.error("Select section and exam term");
    try {
      const res = await generate({ academicYearId, sectionId, examId, term: examName }).unwrap();
      setDone(res);
      toast.success(res.message || "Generated");
    } catch (e) { toast.error(e?.data?.error || "Failed to generate"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Generate Report Card" subtitle="Build report cards from exam results" icon={<FileBadge size={18} />} />

      <Card title="Select Report Generate Action">
        <div className="p-5 space-y-4">
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none"><input type="radio" checked={mode === "class"} onChange={() => setMode("class")} className="accent-emerald-600" /> Class Wise</label>
            <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none"><input type="radio" checked={mode === "student"} onChange={() => setMode("student")} className="accent-emerald-600" /> Class Wise Particular Student</label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Select Session" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
            <Select label="Select Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }} options={classOptions(classes)} />
            <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
            <Select label="Exam Term *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
          </div>
          <div className="flex justify-end">
            <Button icon={<Sparkles size={14} />} loading={isLoading} onClick={submit}>Generate Report Card</Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
      ) : done ? (
        <Card>
          <div className="py-8 text-center">
            <CheckCircle2 size={44} className="mx-auto text-emerald-500" />
            <p className="mt-3 text-slate-700 font-medium">Report Card Generated Successfully ({done.generated} card{done.generated === 1 ? "" : "s"}).</p>
            <p className="text-[13px] text-slate-500">To view, go to Result Management → View Report Card.</p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
