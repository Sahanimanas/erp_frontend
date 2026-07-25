/**
 * Result Management → View Report Card
 * Lists generated report cards for a section+term; view/print each as a PDF.
 */
import { useEffect, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton, Badge } from "../../components/ui";
import { FileText, Printer } from "lucide-react";
import { useGetSessionsQuery } from "../../redux/api/academicApi";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { useListReportCardsQuery } from "../../redux/api/resultMgmtApi";
import { getSchool } from "../../utils/printPdf";
import { sessionOptions, classOptions, sectionOptions, examOptions, StudentSearchBar, studentMatches, emptyStudentFilter } from "./_rmShared";

// Normalize a stored report card into the { id, name, rollNumber, … } shape the
// shared student search bar / matcher expects (id = card id).
const cardStudent = (c) => ({ id: c.id, name: c.data?.student?.name, rollNumber: c.data?.student?.rollNumber, registrationNo: c.data?.student?.registrationNo });

function esc(s) { return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

function printReportCard(d) {
  const school = getSchool();
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) { alert("Please allow pop-ups to print."); return; }
  const subjRows = (d.subjects || []).map((s) => `<tr><td class="l">${esc(s.subject)}</td><td>${esc(s.total)}</td><td>${s.scored === null ? "Absent" : esc(s.scored)}</td></tr>`).join("");
  const nonRows = (d.nonSubjects || []).map((s) => `<tr><td class="l">${esc(s.name)}</td><td>${esc(s.total)}</td><td>${s.scored === null ? "-" : esc(s.scored)}</td></tr>`).join("");
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>Report Card — ${esc(d.student?.name)}</title>
<style>
  *{box-sizing:border-box}body{font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#111827;margin:24px}
  .frame{border:2px solid #111827;padding:0}
  .head{text-align:center;padding:12px;border-bottom:2px solid #111827}.head h1{margin:0;font-size:22px}.head p{margin:2px 0 0;font-size:12px;color:#374151}
  .meta{display:flex;flex-wrap:wrap;gap:4px 24px;padding:12px 16px;border-bottom:2px solid #111827;font-size:13px}
  table{width:100%;border-collapse:collapse}th,td{border:1px solid #111827;padding:6px 10px;font-size:12.5px;text-align:center}
  th{background:#f3f4f6}td.l{text-align:left;font-weight:600}
  .tot{display:flex;justify-content:space-between;padding:12px 16px;font-size:14px;font-weight:700;border-top:2px solid #111827}
  .rem{padding:10px 16px;font-size:12.5px;border-top:1px solid #111827}
  @media print{body{margin:0}th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
  <div class="frame">
    <div class="head"><h1>${esc(school.name || "School")}</h1>${school.address ? `<p>${esc(school.address)}</p>` : ""}<p><b>REPORT CARD — ${esc(d.term || d.exam)}</b></p></div>
    <div class="meta">
      <div><b>Name:</b> ${esc(d.student?.name)}</div><div><b>Roll No:</b> ${esc(d.student?.rollNumber)}</div>
      <div><b>Reg No:</b> ${esc(d.student?.registrationNo)}</div><div><b>Father:</b> ${esc(d.student?.fatherName)}</div>
      <div><b>Class:</b> ${esc(d.className)} / ${esc(d.sectionName)}</div>
    </div>
    <table><thead><tr><th style="text-align:left">Subject</th><th>Total</th><th>Scored</th></tr></thead><tbody>
      ${subjRows}${nonRows ? `<tr><td colspan="3" style="text-align:left;background:#f9fafb;font-weight:700">Co-curricular</td></tr>${nonRows}` : ""}
    </tbody></table>
    <div class="tot"><span>Total: ${esc(d.obtained)} / ${esc(d.total)}</span><span>Percentage: ${esc(d.percentage)}%</span><span>Grade: ${esc(d.grade || "-")}</span></div>
    ${d.remark ? `<div class="rem"><b>Remark:</b> ${esc(d.remark)}</div>` : ""}
  </div>
  <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},250)}</script>
</body></html>`);
  win.document.close();
}

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

  const [sf, setSf] = useState(emptyStudentFilter);
  useEffect(() => { setSf(emptyStudentFilter); }, [sectionId, term]);
  const visibleCards = cards.filter((c) => studentMatches(sf, cardStudent(c)));

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
        <Card noPadding title={`Report Cards (${cards.length})`}>
          <StudentSearchBar students={cards.map(cardStudent)} value={sf} onChange={setSf} />
          <div className="divide-y divide-slate-100">
            {visibleCards.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-4 py-2.5">
                <div>
                  <p className="font-medium text-slate-700 text-[13px]">{c.data?.student?.name}</p>
                  <p className="text-[11px] text-slate-400">Roll {c.data?.student?.rollNumber} · {c.data?.percentage}% · Grade {c.data?.grade || "-"}</p>
                </div>
                <div className="flex items-center gap-2">
                  {c.published ? <Badge variant="success">Published</Badge> : <Badge variant="default">Draft</Badge>}
                  <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={() => printReportCard(c.data)}>Print</Button>
                </div>
              </div>
            ))}
            {visibleCards.length === 0 && <div className="px-4 py-8 text-center text-slate-400">No report cards match your search.</div>}
          </div>
        </Card>
      )}
    </div>
  );
}
