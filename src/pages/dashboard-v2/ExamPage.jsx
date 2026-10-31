/**
 * Dashboard v2 · Exam Performance — every exam of a session side by side, for
 * one class or the whole school: each exam's average and pass rate, the grade
 * spread, subject averages, toppers, and each student's percentage in every
 * exam. Marks, pass marks and grades follow Result Management, so a figure
 * here matches the report card.
 */
import { useEffect, useMemo, useState } from "react";
import { FileText, Users, ClipboardList, TrendingUp, CircleCheck, Trophy } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { useGetReportExamsQuery, useGetExamSummaryQuery } from "../../redux/api/reportsApi";
import {
  ReportHeader, ErrorNote, GradientStat, StatGrid, BarsPanel, DataPanel, Panel, Segmented, Picker, RateBadge, Empty, Donut,
  FilterBar, ClassPicker, useClassFilter, BLUE, ORANGE, num, pctText, fmtDate,
} from "./_ui";

/** An ordinal ramp for grades: best grade darkest, one hue throughout. */
function gradeColors(n) {
  const from = [13, 61, 122]; // #0d3d7a
  const to = [176, 206, 242]; // #b0cef2
  return Array.from({ length: n }, (_, i) => {
    const t = n === 1 ? 0 : i / (n - 1);
    return `rgb(${from.map((c, k) => Math.round(c + (to[k] - c) * t)).join(",")})`;
  });
}

export default function ExamPage() {
  usePageTitle("Exam Performance");
  const { data: exams = [], isLoading: examsLoading } = useGetReportExamsQuery();
  const { classId, className } = useClassFilter();
  const [tab, setTab] = useState("students");

  // Sessions come from the exams themselves; exams with no session are grouped.
  const sessions = useMemo(() => {
    const m = new Map();
    for (const e of exams) {
      const id = e.sessionId || "none";
      const s = m.get(id) || { id, name: e.session || "Exams without a session", active: e.sessionActive, marks: 0 };
      s.marks += e.marks;
      m.set(id, s);
    }
    return [...m.values()];
  }, [exams]);
  const [sessionId, setSessionId] = useState("");
  // Open on the active session that has marks, else any session with marks.
  useEffect(() => {
    if (!sessionId && sessions.length) {
      setSessionId((sessions.find((s) => s.active && s.marks) || sessions.find((s) => s.marks) || sessions[0]).id);
    }
  }, [sessions, sessionId]);

  const { data, isFetching, error } = useGetExamSummaryQuery({ sessionId, classId }, { skip: !sessionId });
  const t = data?.totals;
  const loading = isFetching;
  const sessionName = sessions.find((s) => s.id === sessionId)?.name || "";
  const scope = `${sessionName}${className ? ` · ${className}` : ""}`;

  const gradeParts = useMemo(() => {
    const g = (data?.grades || []).filter((x) => x.count > 0);
    const colors = gradeColors((data?.grades || []).length);
    return g.map((x) => ({ name: x.grade, value: x.count, color: colors[(data.grades || []).findIndex((y) => y.grade === x.grade)] }));
  }, [data]);

  const examCols = (data?.exams || []).map((e) => ({
    key: `x-${e.examId}`,
    label: e.name,
    align: "right",
    value: (r) => (r.byExam[e.examId] ? r.byExam[e.examId].pct : ""),
    render: (r) => {
      const x = r.byExam[e.examId];
      if (!x) return <span className="text-slate-400">—</span>;
      return <span className={x.result === "PASS" ? "" : "font-semibold text-red-700"}>{pctText(x.pct)} <span className="text-slate-500">{x.grade}</span></span>;
    },
  }));

  const tables = {
    students: {
      title: "Student-wise result",
      filename: "exam-performance-students",
      rows: data?.students || [],
      columns: [
        { key: "name", label: "Student" },
        { key: "className", label: "Class" },
        { key: "rollNumber", label: "Roll no." },
        ...examCols,
        { key: "avgPct", label: "Average", align: "right", value: (r) => r.avgPct, render: (r) => <span className="font-semibold">{pctText(r.avgPct)}</span> },
        { key: "best", label: "Best", align: "right", value: (r) => r.best, render: (r) => pctText(r.best) },
        { key: "failed", label: "Failed in", align: "right", value: (r) => r.failed, render: (r) => (r.failed ? `${r.failed} exam${r.failed === 1 ? "" : "s"}` : "—") },
      ],
    },
    exams: {
      title: "Exam-wise result",
      filename: "exam-performance-exams",
      rows: data?.exams || [],
      columns: [
        { key: "name", label: "Exam" },
        { key: "startDate", label: "Held", nowrap: true, value: (r) => (r.startDate ? fmtDate(r.startDate) : "—"), sortValue: (r) => r.startDate || "" },
        { key: "appeared", label: "Appeared", align: "right" },
        { key: "passed", label: "Passed", align: "right" },
        { key: "failed", label: "Failed", align: "right" },
        { key: "passPct", label: "Pass rate", align: "right", value: (r) => r.passPct, render: (r) => <RateBadge value={r.passPct} good={90} fair={70} /> },
        { key: "avgPct", label: "Average", align: "right", value: (r) => r.avgPct, render: (r) => pctText(r.avgPct) },
        { key: "highestPct", label: "Highest", align: "right", value: (r) => r.highestPct, render: (r) => pctText(r.highestPct) },
        { key: "topper", label: "Topper" },
      ],
    },
    subjects: {
      title: "Subject-wise result",
      filename: "exam-performance-subjects",
      rows: data?.subjects || [],
      columns: [
        { key: "name", label: "Subject" },
        { key: "appeared", label: "Papers", align: "right" },
        { key: "avgPct", label: "Average", align: "right", value: (r) => r.avgPct, render: (r) => pctText(r.avgPct) },
        { key: "passPct", label: "Pass rate", align: "right", value: (r) => r.passPct, render: (r) => <RateBadge value={r.passPct} good={90} fair={70} /> },
      ],
    },
  };

  return (
    <div>
      <ReportHeader title="Exam Performance" subtitle="Exam results & academic analytics, session by session" icon={FileText} />
      <FilterBar>
        <Picker label="Session" value={sessionId} onChange={setSessionId} minWidth={220}
          options={sessions.length
            ? sessions.map((s) => ({ value: s.id, label: `${s.name}${s.active ? " (Active)" : ""}${s.marks ? "" : " — no marks yet"}` }))
            : [{ value: "", label: examsLoading ? "Loading…" : "No exams yet" }]} />
        <ClassPicker />
      </FilterBar>
      <ErrorNote error={error} />

      {!examsLoading && !exams.length ? (
        <Panel><Empty>No exam has been created yet. Exams and marks come from Exam Management and Result Management.</Empty></Panel>
      ) : (
        <>
          <StatGrid>
            <GradientStat tone="violet" icon={Users} label="Total students" loading={loading} value={num(t?.enrolled)}
              sub={`${num(t?.students)} with marks`} />
            <GradientStat tone="purple" icon={ClipboardList} label="Total exams" loading={loading} value={num(t?.exams)}
              sub={t?.examsWithoutMarks ? `${num(t.examsWithoutMarks)} more without marks yet` : `${num(t?.results)} result${t?.results === 1 ? "" : "s"}`} />
            <GradientStat tone="cyan" icon={TrendingUp} label="Average score" loading={loading} value={t?.results ? pctText(t.avgPct) : "—"}
              sub="across every result" />
            <GradientStat tone="green" icon={CircleCheck} label="Pass rate" loading={loading} value={t?.results ? pctText(t.passPct) : "—"}
              sub={`${num(t?.passed)} passed · ${num(t?.failed)} failed`} />
          </StatGrid>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
            <BarsPanel className="xl:col-span-3" title="Exam-wise performance" subtitle={`Average % · ${scope}`} horizontal unit="pct"
              loading={loading} data={data?.exams || []} xKey="name" height={Math.max(180, (data?.exams?.length || 0) * 64)}
              series={[{ key: "avgPct", name: "Average %", color: BLUE }]} empty="No marks entered for this session yet." />
            <Panel className="xl:col-span-2" title="Grade distribution" subtitle={scope}>
              {loading ? (
                <div className="mx-auto h-[220px] w-[220px] animate-pulse rounded-full bg-slate-100" />
              ) : (
                <Donut parts={gradeParts} centerLabel="Results" centerValue={num(t?.results)} format={num} />
              )}
            </Panel>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
            <BarsPanel className="xl:col-span-3" title="Subject-wise average" subtitle={scope} unit="pct" loading={loading}
              data={data?.subjects || []} xKey="name" series={[{ key: "avgPct", name: "Average %", color: BLUE }]}
              empty="No marks yet." />
            <Panel className="xl:col-span-2" title="Toppers" subtitle={`Average across the session's exams${className ? ` · ${className}` : ""}`}>
              {!data?.toppers?.length ? (
                <Empty h={200}>No marks yet.</Empty>
              ) : (
                <ol className="divide-y divide-slate-100">
                  {data.toppers.slice(0, 6).map((r, i) => (
                    <li key={r.studentId} className="flex items-center gap-3 py-2.5">
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12.5px] font-bold ${
                        i === 0 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        {i === 0 ? <Trophy size={15} /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-semibold text-slate-900">{r.name}</p>
                        <p className="truncate text-[12px] text-slate-600">{r.className} · {r.exams} exam{r.exams === 1 ? "" : "s"}</p>
                      </div>
                      <span className="text-[13.5px] font-bold text-slate-900">{pctText(r.avgPct)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Panel>
          </div>

          <BarsPanel className="mb-5" title="Passed and failed, exam by exam" subtitle={scope} stacked loading={loading}
            data={data?.exams || []} xKey="name"
            series={[{ key: "passed", name: "Passed", color: BLUE }, { key: "failed", name: "Failed", color: ORANGE }]}
            empty="No marks yet." height={220} />

          <div className="mb-3">
            <Segmented label="Exam tables" value={tab} onChange={setTab} options={[
              { key: "students", label: "Students", count: data?.students?.length },
              { key: "exams", label: "Exam-wise", count: data?.exams?.length },
              { key: "subjects", label: "Subject-wise", count: data?.subjects?.length },
            ]} />
          </div>
          <DataPanel key={`${tab}-${sessionId}`} {...tables[tab]} subtitle={scope} printSubtitle={`Exam performance · ${scope}`}
            loading={loading} emptyText="No marks entered for this session yet." />
        </>
      )}
    </div>
  );
}
