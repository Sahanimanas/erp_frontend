/**
 * _examShared.jsx — helpers shared by the Exam Management pages.
 * Exams are session-scoped: every page picks a session first (defaulting to
 * the school's active one) and works with that session's exams.
 */
import { useEffect, useState } from "react";
import { useGetAcademicYearsQuery, useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetExamsQuery } from "../../redux/api/examMgmtApi";
import { getSchool } from "../../utils/printPdf";

export const EXAM_TYPES = [
  { value: "UNIT_TEST", label: "Unit Test" },
  { value: "CLASS_TEST", label: "Class Test" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "HALF_YEARLY", label: "Half Yearly" },
  { value: "YEARLY", label: "Yearly" },
];
export const typeLabel = (v) => EXAM_TYPES.find((t) => t.value === v)?.label || v || "-";
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("en-IN") : "-");

export const STATUS_BADGE = { draft: "warning", published: "success", closed: "default" };

/** Academic years with the selection defaulted to the active session. */
export function useSessions() {
  const { data: years = [] } = useGetAcademicYearsQuery();
  const [session, setSession] = useState("");
  useEffect(() => {
    if (!session && years.length) setSession((years.find((y) => y.isActive) || years[0]).id);
  }, [years, session]);
  const sessionName = years.find((y) => y.id === session)?.name || "";
  return { years, session, setSession, sessionName };
}

/** The selected session's exams + an exam selection. */
export function useSessionExams() {
  const s = useSessions();
  const { data: exams = [], isFetching: examsLoading } = useGetExamsQuery(
    { academicYearId: s.session },
    { skip: !s.session }
  );
  const [examId, setExamId] = useState("");
  // Reset the picked exam when the session changes and it no longer exists.
  useEffect(() => {
    if (examId && !exams.some((e) => e.id === examId)) setExamId("");
  }, [exams, examId]);
  const exam = exams.find((e) => e.id === examId) || null;
  return { ...s, exams, examsLoading, examId, setExamId, exam };
}

/** Classes ordered Nursery → LKG → UKG → 1…12 (same rule as fee pages). */
export function useOrderedClasses() {
  const { data: classes = [] } = useGetClassesQuery();
  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  return [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));
}

export const sessionOptions = (years) => [{ value: "", label: "Select Session" }, ...years.map((y) => ({ value: y.id, label: y.name }))];
export const examOptions = (exams) => [{ value: "", label: "Select Exam" }, ...exams.map((e) => ({ value: e.id, label: `${e.name} (${typeLabel(e.type)})` }))];
export const classOptions = (classes, allLabel = "Select Class") => [{ value: "", label: allLabel }, ...classes.map((c) => ({ value: c.id, label: c.name }))];

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/**
 * printHallTickets — print one admit/hall ticket card per student (2 per A4
 * page): student identity, seat/hall and the class's full paper schedule.
 */
export function printHallTickets({ exam = {}, students = [], schedule = [], school = getSchool() }) {
  if (!students.length) { alert("No students to print."); return false; }
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) { alert("Please allow pop-ups for this site to print."); return false; }

  const schedRows = schedule
    .map((s) => `<tr><td>${esc(s.subject)}</td><td>${esc(fmtDate(s.examDate))}</td><td>${esc(s.startTime)} - ${esc(s.endTime)}</td><td>${esc(s.room || "-")}</td><td class="c">${esc(s.maxMarks)}</td><td class="sig"></td></tr>`)
    .join("");

  const ticket = (st) => `<div class="ticket">
    <div class="head">
      <div class="school">${esc(school.name || "School")}</div>
      ${school.address ? `<div class="addr">${esc(school.address)}</div>` : ""}
      <div class="title">HALL TICKET — ${esc(exam.name || "")}${exam.session ? ` · Session ${esc(exam.session)}` : ""}</div>
    </div>
    <div class="meta">
      <div><span>Name</span><b>${esc(st.name)}</b></div>
      <div><span>Roll No</span><b>${esc(st.rollNumber)}</b></div>
      <div><span>Class</span><b>${esc(st.className || "")}${st.sectionName ? `/${esc(st.sectionName)}` : ""}</b></div>
      <div><span>Father</span><b>${esc(st.fatherName || "-")}</b></div>
    </div>
    <table>
      <thead><tr><th>Subject</th><th>Date</th><th>Time</th><th>Room</th><th class="c">Max</th><th class="sig">Invigilator</th></tr></thead>
      <tbody>${schedRows || `<tr><td colspan="6" class="c">Schedule not published yet</td></tr>`}</tbody>
    </table>
    <div class="foot"><span>Controller of Examinations</span><span>Principal</span></div>
  </div>`;

  win.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>Hall Tickets — ${esc(exam.name || "")}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; margin: 0; padding: 6mm; background: #f3f4f6; }
  .ticket { background: #fff; border: 1.6px solid #111827; padding: 12px 16px; margin-bottom: 6mm; break-inside: avoid; }
  .school { text-align: center; font-size: 17px; font-weight: 800; text-transform: uppercase; letter-spacing: .5px; }
  .addr { text-align: center; font-size: 10px; color: #374151; }
  .title { text-align: center; font-size: 11.5px; font-weight: 700; margin: 5px 0 8px; letter-spacing: .4px; }
  .meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px 14px; border: 1.2px solid #111827; padding: 7px 10px; margin-bottom: 8px; }
  .meta div { font-size: 11px; display: flex; gap: 6px; }
  .meta span { color: #374151; font-weight: 600; min-width: 52px; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #111827; padding: 4px 7px; font-size: 10.5px; text-align: left; }
  th { background: #f3f4f6; font-size: 9.5px; text-transform: uppercase; }
  td.c, th.c { text-align: center; }
  .sig { width: 80px; }
  .foot { display: flex; justify-content: space-between; margin-top: 26px; font-size: 10.5px; font-weight: 600; }
  .foot span { border-top: 1px solid #111827; padding: 3px 14px 0; }
  @page { size: A4 portrait; margin: 8mm; }
  @media print { body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  ${students.map(ticket).join("")}
  <script>window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 350); };</script>
</body></html>`);
  win.document.close();
  return true;
}
