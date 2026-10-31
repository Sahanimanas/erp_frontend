/**
 * Exam Result Analysis — for one exam: pass rate, class-wise and subject-wise
 * performance, grade distribution, toppers, and every student's result with
 * rank. Max/pass marks and grades follow Result Management's own rules, so a
 * result here matches the student's report card.
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Trophy } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge } from "../../components/ui";
import { useGetReportExamsQuery, useGetExamReportQuery } from "../../redux/api/reportsApi";
import { ReportError, Kpi, KpiRow, ReportTable, BarsChart, useReportClass, num, pctText, fmtDate, BLUE } from "./_shared";

const selectStyle = { borderColor: "var(--erp-border)", borderRadius: "var(--erp-radius)" };
const resultBadge = (r) => <Badge variant={r === "PASS" ? "success" : "danger"}>{r === "PASS" ? "Pass" : "Fail"}</Badge>;
const rateBadge = (p) => <Badge variant={p >= 75 ? "success" : p >= 50 ? "warning" : "danger"}>{pctText(p)}</Badge>;

export default function ExamReportsPage() {
  usePageTitle("Exam Result Analysis");
  const navigate = useNavigate();
  const { data: exams = [], isLoading: examsLoading } = useGetReportExamsQuery();
  // The class lives in the URL so the Reports home can open this on a class.
  const cls = useReportClass();
  const { classes, classId } = cls;
  const setClassId = cls.set;
  const [examId, setExamId] = useState("");

  // Open on the newest exam that actually has marks.
  useEffect(() => {
    if (!examId && exams.length) setExamId((exams.find((e) => e.marks > 0) || exams[0]).id);
  }, [exams, examId]);

  const { data, isFetching, error } = useGetExamReportQuery({ examId, classId }, { skip: !examId });
  const t = data?.totals;
  const exam = data?.exam;
  const title = exam ? `${exam.name}${classId ? ` — ${classes.find((c) => c.id === classId)?.name ?? ""}` : ""}` : "";

  return (
    <div>
      <PageHeader title="Exam Result Analysis" subtitle="Pass rate, toppers, subject-wise performance" icon={<FileText />} />

      <Card className="mb-4">
        <div className="px-4 py-3 flex flex-wrap items-end gap-3">
          <label className="text-[14px] font-bold text-[#24282e]">
            <span className="block mb-1">Exam</span>
            <select value={examId} onChange={(e) => setExamId(e.target.value)} aria-label="Exam"
              className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none min-w-[240px]" style={selectStyle}>
              {!exams.length && <option value="">{examsLoading ? "Loading…" : "No exams yet"}</option>}
              {exams.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}{e.session ? ` (${e.session})` : ""}{e.marks ? "" : " — no marks yet"}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[14px] font-bold text-[#24282e]">
            <span className="block mb-1">Class</span>
            <select value={classId} onChange={(e) => setClassId(e.target.value)} aria-label="Class"
              className="px-2.5 py-1.5 text-[13px] border bg-white focus:outline-none min-w-[140px]" style={selectStyle}>
              <option value="">All classes</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          {exam && (
            <p className="text-[12px] text-slate-600 pb-1.5">
              {exam.type?.replace(/_/g, " ")} · {fmtDate(exam.startDate)} – {fmtDate(exam.endDate)}
            </p>
          )}
        </div>
      </Card>
      <ReportError error={error} />

      {examId && !isFetching && t && t.appeared === 0 ? (
        <Card><p className="py-12 text-center text-[13px] text-slate-600">Marks for this exam have not been entered yet. The report will appear here once marks are entered in Result Management → Exam Result.</p></Card>
      ) : (
        <>
          <KpiRow cols={5}>
            <Kpi label="Students appeared" value={num(t?.appeared)} loading={isFetching} />
            <Kpi label="Passed" value={num(t?.passed)} sub={`Pass rate ${pctText(t?.passPct)}`} tone="var(--erp-success)" loading={isFetching} />
            <Kpi label="Failed" value={num(t?.failed)} tone="var(--erp-danger)" loading={isFetching} />
            <Kpi label="Average score" value={pctText(t?.avgPct)} loading={isFetching} />
            <Kpi label="Highest score" value={pctText(t?.highestPct)} sub={data?.toppers?.[0]?.name} loading={isFetching} />
          </KpiRow>

          {(data?.toppers?.length ?? 0) > 0 && (
            <Card title="Toppers" subtitle={title} className="mb-4">
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {data.toppers.slice(0, 5).map((s, i) => (
                  <button key={s.studentId} type="button" onClick={() => navigate(`/student-360?id=${s.studentId}`)}
                    className="text-left px-3 py-2.5 bg-white hover:shadow-sm transition-shadow"
                    style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)", borderTop: `3px solid ${i === 0 ? "#f39c12" : "var(--erp-primary)"}` }}>
                    <p className="text-[11px] text-slate-500 font-semibold flex items-center gap-1">
                      {i === 0 && <Trophy size={12} className="text-amber-500" />} #{i + 1}
                    </p>
                    <p className="text-[13px] font-bold text-slate-800 truncate">{s.name}</p>
                    <p className="text-[11.5px] text-slate-600">{s.className} · {pctText(s.pct)} · {s.grade}</p>
                  </button>
                ))}
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
            <BarsChart
              title="Subject-wise average"
              subtitle="Average score as % of max marks"
              data={data?.subjects ?? []}
              xKey="name"
              unit="pct"
              height={240}
              series={[{ key: "avgPct", name: "Average", color: BLUE }]}
            />
            <BarsChart
              title="Grade distribution"
              subtitle="Students per grade"
              data={data?.grades ?? []}
              xKey="grade"
              unit="count"
              height={240}
              series={[{ key: "count", name: "Students", color: BLUE }]}
            />
          </div>

          <ReportTable
            title="Class-wise result"
            subtitle={title}
            filename={`exam-classwise-${exam?.name ?? "exam"}`}
            printTitle={`Class-wise Result — ${title}`}
            loading={isFetching}
            rows={data?.classes ?? []}
            columns={[
              { key: "className", label: "Class", render: (r) => <span className="font-semibold">{r.className}</span>, value: (r) => r.className },
              { key: "appeared", label: "Appeared" },
              { key: "passed", label: "Passed" },
              { key: "failed", label: "Failed" },
              { key: "passPct", label: "Pass %", value: (r) => `${r.passPct}%`, render: (r) => rateBadge(r.passPct) },
              { key: "avgPct", label: "Average", value: (r) => `${r.avgPct}%`, render: (r) => pctText(r.avgPct) },
              { key: "highestPct", label: "Highest", value: (r) => `${r.highestPct}%`, render: (r) => pctText(r.highestPct) },
              { key: "topper", label: "Topper" },
            ]}
          />

          <ReportTable
            title="Subject-wise result"
            subtitle={title}
            filename={`exam-subjectwise-${exam?.name ?? "exam"}`}
            printTitle={`Subject-wise Result — ${title}`}
            loading={isFetching}
            rows={data?.subjects ?? []}
            columns={[
              { key: "name", label: "Subject", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
              { key: "appeared", label: "Appeared" },
              { key: "avgPct", label: "Average", value: (r) => `${r.avgPct}%`, render: (r) => pctText(r.avgPct) },
              { key: "highest", label: "Highest marks" },
              { key: "lowest", label: "Lowest marks" },
              { key: "passPct", label: "Pass %", value: (r) => `${r.passPct}%`, render: (r) => rateBadge(r.passPct) },
            ]}
          />

          <ReportTable
            title="Student-wise result"
            subtitle={`${title} · rank is within the section · click a row to open the student's profile`}
            filename={`exam-results-${exam?.name ?? "exam"}`}
            printTitle={`Result Sheet — ${title}`}
            loading={isFetching}
            searchable
            rows={data?.students ?? []}
            onRowClick={(r) => navigate(`/student-360?id=${r.studentId}`)}
            columns={[
              { key: "rank", label: "Rank" },
              { key: "name", label: "Student", render: (r) => <span className="font-semibold">{r.name}</span>, value: (r) => r.name },
              { key: "rollNumber", label: "Roll No" },
              { key: "className", label: "Class" },
              { key: "obtained", label: "Marks", value: (r) => `${r.obtained} / ${r.max}` },
              { key: "pct", label: "%", value: (r) => r.pct, render: (r) => pctText(r.pct) },
              { key: "grade", label: "Grade" },
              { key: "result", label: "Result", value: (r) => (r.result === "PASS" ? "Pass" : "Fail"), render: (r) => resultBadge(r.result) },
              { key: "failedSubjects", label: "Failed in", value: (r) => r.failedSubjects.join(", ") },
            ]}
          />
        </>
      )}
    </div>
  );
}
