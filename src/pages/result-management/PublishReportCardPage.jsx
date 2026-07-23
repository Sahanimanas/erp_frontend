/**
 * Result Management → Publish Report Card
 * Publish / unpublish generated report cards for a section+term.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton, Badge } from "../../components/ui";
import { Send, CheckCircle2 } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useListReportCardsQuery, usePublishReportCardsMutation } from "../../redux/api/resultMgmtApi";
import { sessionOptions, classOptions, sectionOptions, examOptions } from "./_rmShared";

export default function PublishReportCardPage() {
  usePageTitle("Publish Report Card");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [examId, setExamId] = useState("");

  const { data: sessions = [] } = useGetSessionsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  const { data: exams = [] } = useGetExamsQuery({ academicYearId });
  const term = exams.find((e) => e.id === examId)?.name || "";
  const { data: cards = [], isFetching } = useListReportCardsQuery({ sectionId, academicYearId, term }, { skip: !sectionId || !term });
  const [publish, { isLoading }] = usePublishReportCardsMutation();

  const doPublish = async (state) => {
    try { const res = await publish({ sectionId, academicYearId, term, published: state }).unwrap(); toast.success(`${res.message} (${res.count})`); }
    catch (e) { toast.error(e?.data?.error || "Failed"); }
  };

  const publishedCount = cards.filter((c) => c.published).length;

  return (
    <div className="space-y-4">
      <PageHeader title="Publish Generated Report Card" subtitle="Release report cards to students / parents" icon={<Send size={18} />} />

      <Card title="Publish Generated Card Report" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Select Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Select Class *" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Exam Term *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
        </div>
      </Card>

      {!sectionId || !term ? (
        <Card noPadding><EmptyState icon="📨" title="Choose section & term" description="Pick filters to load generated report cards." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : cards.length === 0 ? (
        <Card noPadding><EmptyState icon="📭" title="No report cards" description="Generate them under Generate Report Card first." /></Card>
      ) : (
        <Card noPadding title={`${cards.length} report card(s) · ${publishedCount} published`}
          action={<div className="flex gap-2">
            <Button size="sm" variant="secondary" loading={isLoading} onClick={() => doPublish(false)}>Unpublish All</Button>
            <Button size="sm" icon={<CheckCircle2 size={13} />} loading={isLoading} onClick={() => doPublish(true)}>Publish All</Button>
          </div>}>
          <div className="divide-y divide-slate-100">
            {cards.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                <p className="font-medium text-slate-700 text-[13px]">{c.data?.student?.name} <span className="text-[11px] text-slate-400">· Roll {c.data?.student?.rollNumber}</span></p>
                {c.published ? <Badge variant="success">Published</Badge> : <Badge variant="default">Draft</Badge>}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
