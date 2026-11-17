/**
 * Result Management → View Report Card
 * Lists generated report cards for a section+term; preview and print each one,
 * or print the whole list at one card per page.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, EmptyState, Skeleton } from "../../components/ui";
import { FileText } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useListReportCardsQuery } from "../../redux/api/resultMgmtApi";
import ReportCardList from "./_reportCardList";
import { sessionOptions, classOptions, sectionOptions, examOptions } from "./_rmShared";

export default function ViewReportCardPage() {
  usePageTitle("View Report Card");
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

  return (
    <div className="space-y-4">
      <PageHeader title="View Report Card" subtitle="Generated report cards" icon={<FileText size={18} />} />
      <Card title="Report Card" noPadding>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
          <Select label="Session *" value={academicYearId} onChange={(e) => setYear(e.target.value)} options={sessionOptions(sessions)} />
          <Select label="Class *" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }} options={classOptions(classes)} />
          <Select label="Class (Year/Semester) *" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId} options={sectionOptions(sections)} />
          <Select label="Exam Term *" value={examId} onChange={(e) => setExamId(e.target.value)} options={examOptions(exams)} />
        </div>
      </Card>

      {!sectionId || !term ? (
        <Card noPadding><EmptyState icon="🧾" title="Choose section & term" description="Pick filters to list generated report cards." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9" />)}</div></Card>
      ) : cards.length === 0 ? (
        <Card noPadding><EmptyState icon="📭" title="No report cards" description="Generate them under Generate Report Card first." /></Card>
      ) : (
        <ReportCardList cards={cards} />
      )}
    </div>
  );
}
