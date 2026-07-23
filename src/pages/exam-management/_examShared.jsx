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

/** "09:00" → "09:00 AM" (schedule times are stored as 24h "HH:mm" strings). */
export const to12h = (t) => {
  const [h, m] = String(t ?? "").split(":");
  const hh = Number(h);
  if (!Number.isFinite(hh)) return t || "-";
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${String(h12).padStart(2, "0")}:${m ?? "00"} ${suffix}`;
};

/** "01 Apr, 2021" — the date format used on the printed timetable. */
const fmtLongDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).replace(/ (\w+) /, " $1, ") : "-";

/**
 * printExamTimetable — student-facing exam timetable.
 *
 * Papers are grouped into exam days: the day number and date print once per
 * day, and the following papers of that day leave those cells blank. Marks are
 * deliberately left out — this sheet goes to students, who are told when and
 * where to sit, not what the paper is worth.
 */
export function printExamTimetable({ exam = {}, sessionName = "", className = "", rows = [], school = getSchool() }) {
  if (!rows.length) { alert("No papers to print."); return false; }
  const win = window.open("", "_blank", "width=1000,height=1000");
  if (!win) { alert("Please allow pop-ups for this site to save as PDF."); return false; }

  const showClass = !className; // "All Classes" → the class needs its own column

  // Rows arrive ordered by date then start time (backend orderBy), so a plain
  // walk is enough to number the days and blank the repeats.
  let day = 0;
  let prevDate = null;
  const body = rows.map((r) => {
    const dateKey = r.examDate ? new Date(r.examDate).toDateString() : "";
    const isNewDay = dateKey !== prevDate;
    if (isNewDay) { day += 1; prevDate = dateKey; }
    const subject = r.paperName && r.paperName !== "Theory"
      ? `${r.subject?.name ?? "-"} (${r.paperName})`
      : r.subject?.name ?? "-";
    return `<tr>
      <td class="day">${isNewDay ? day : ""}</td>
      <td>${isNewDay ? esc(fmtLongDate(r.examDate)) : ""}</td>
      <td>${esc(to12h(r.startTime))} - ${esc(to12h(r.endTime))}</td>
      ${showClass ? `<td>${esc(r.class?.name ?? "-")}</td>` : ""}
      <td>${esc(subject)}</td>
      <td>${esc(r.room || "-")}</td>
    </tr>`;
  }).join("");

  const meta = [
    className && `Class : ${esc(className)}`,
    sessionName && `Session : ${esc(sessionName)}`,
    exam.name && `Exam : ${esc(exam.name)}`,
    exam.startDate && exam.endDate && `Exam Date : ${esc(fmtLongDate(exam.startDate))} to ${esc(fmtLongDate(exam.endDate))}`,
  ].filter(Boolean).map((l) => `<div>${l}</div>`).join("");

  win.document.write(`<!doctype html>
<html><head><meta charset="utf-8" /><title>Exam Time Table — ${esc(exam.name || "")}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1e293b; margin: 28px; }
  .letterhead { display: flex; align-items: center; justify-content: center; gap: 14px; margin-bottom: 14px; }
  .letterhead img { width: 58px; height: 58px; object-fit: contain; flex: none; }
  .school { text-align: center; font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: .3px; }
  .addr { text-align: center; font-size: 11px; color: #475569; margin-top: 3px; }
  .meta { font-size: 13px; line-height: 1.7; margin-bottom: 14px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #16b39b; color: #fff; text-align: left; font-size: 11.5px; padding: 9px 10px; border: 1px solid #16b39b; }
  td { padding: 8px 10px; font-size: 12px; border: 1px solid #e2e8f0; color: #334155; }
  td.day { color: #2563eb; }
  .sign { margin-top: 90px; font-size: 13px; }
  @page { size: A4 portrait; margin: 10mm; }
  @media print { body { margin: 12mm; } th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head>
<body>
  ${(school?.logo || school?.name) ? `<div class="letterhead">
    ${school?.logo ? `<img src="${esc(school.logo)}" alt="" crossorigin="anonymous" onerror="this.remove()" />` : ""}
    <div>
      ${school?.name ? `<div class="school">${esc(school.name)}</div>` : ""}
      ${school?.address ? `<div class="addr">${esc(school.address)}</div>` : ""}
    </div>
  </div>` : ""}
  <div class="meta">${meta}</div>
  <table>
    <thead><tr>
      <th>Day</th><th>Exam Date</th><th>Exam Time</th>${showClass ? "<th>Class</th>" : ""}<th>Subject</th><th>Exam Hall/Room</th>
    </tr></thead>
    <tbody>${body}</tbody>
  </table>
  <div class="sign">Signature</div>
  <script>window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 250); };</script>
</body></html>`);
  win.document.close();
  return true;
}

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
