/**
 * Result Management → Generate Report Card
 * Aggregates an exam's marks + non-subjects + remark into a stored report card
 * per student (Class-Wise or a single student), then lists the cards just made
 * in the printed design: a single student's card opens on screen at once.
 * View / Publish read the same cards.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Skeleton } from "../../components/ui";
import { FileBadge, Sparkles, CheckCircle2 } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useGenerateReportCardsMutation, useGetExamPublishStatusQuery, useListReportCardsQuery } from "../../redux/api/resultMgmtApi";
import { sessionOptions, classOptions, sectionOptions, examOptions, StudentSearchBar, emptyStudentFilter } from "./_rmShared";
import ReportCardList from "./_reportCardList";

export default function GenerateReportCardPage() {
  usePageTitle("Generate Report Card");
  const [mode, setMode] = useState("class"); // class | student
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");
  const [done, setDone] = useState(null);
  const [sf, setSf] = useState(emptyStudentFilter); // for "particular student" mode

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId });
  const [generate, { isLoading }] = useGenerateReportCardsMutation();

  // Students of the chosen section (for the single-student picker). Reuses the
  // publish-status endpoint, which returns the section roster for the exam.
  const { data: status } = useGetExamPublishStatusQuery({ examId, sectionId }, { skip: !(examId && sectionId) });
  const students = status?.students || [];

  const examName = exams.find((e) => e.id === examId)?.name || "";

  useEffect(() => { setSf(emptyStudentFilter); setDone(null); }, [sectionId, examId, mode]);

  // The cards this run made, read back in full for the list and the preview.
  const { data: allCards = [], isFetching: loadingCards } = useListReportCardsQuery(
    { sectionId: done?.sectionId, academicYearId: done?.academicYearId, term: done?.term }, { skip: !done });
  const madeCards = done?.cardIds ? allCards.filter((c) => done.cardIds.includes(c.id)) : allCards;

  const submit = async () => {
    if (!sectionId || !examId) return toast.error("Select section and exam term");
    if (mode === "student" && !sf.id) return toast.error("Select a student");
    try {
      const res = await generate({ academicYearId, sectionId, examId, term: examName, studentId: mode === "student" ? sf.id : undefined }).unwrap();
      setDone({ ...res, sectionId, academicYearId, term: examName, single: mode === "student" });
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
          {mode === "student" && (
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              {sectionId && examId ? (
                <StudentSearchBar students={students} value={sf} onChange={setSf} placeholder="Search the student to generate for…" />
              ) : (
                <p className="px-4 py-3 text-[12.5px] text-slate-400">Select a class, section and exam term to pick a student.</p>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button icon={<Sparkles size={14} />} loading={isLoading} onClick={submit}>Generate Report Card</Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
      ) : done ? (
        <>
          <div className="flex items-center gap-2 px-1 text-[13px] text-emerald-700">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Report Card Generated Successfully ({done.generated} card{done.generated === 1 ? "" : "s"}). View or print them below.
          </div>
          {loadingCards && !madeCards.length ? (
            <Card><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8" />)}</div></Card>
          ) : (
            <ReportCardList cards={madeCards} openId={done.single ? done.cardIds?.[0] : null} />
          )}
        </>
      ) : null}
    </div>
  );
}
