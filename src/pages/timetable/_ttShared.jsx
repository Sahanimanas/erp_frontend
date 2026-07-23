/**
 * _ttShared.jsx — shared bits for the (video-style) Time Table pages that live
 * under Class Management: the Session / Class / Section / Timetable-Session
 * filter bar, time helpers, and a print/PDF renderer for the weekly grid.
 * Every page reads the SAME backend record, so they stay in sync.
 */
import { Select } from "../../components/ui";
import { getSchool } from "../../utils/printPdf";

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// The timetable-session toggle (NOT the academic year) — a class can keep a
// separate physical (DEFAULT) and ONLINE timetable.
export const TT_SESSIONS = [
  { value: "DEFAULT", label: "DEFAULT" },
  { value: "ONLINE", label: "ONLINE" },
];

export const MAX_PERIOD_OPTIONS = [
  ["1", "One"], ["2", "Two"], ["3", "Three"], ["4", "Four"], ["5", "Five"], ["6", "Six"],
  ["7", "Seven"], ["8", "Eight"], ["9", "Nine"], ["10", "Ten"], ["11", "Eleven"], ["12", "Twelve"],
].map(([value, label]) => ({ value, label }));

// Nursery/LKG/UKG sort before numbered classes.
const ORDER = { Nursery: -3, LKG: -2, UKG: -1 };
export const sortClasses = (classes = []) =>
  [...classes].sort((a, b) => (ORDER[a.name] ?? Number(a.name) ?? 0) - (ORDER[b.name] ?? Number(b.name) ?? 0));

/** "08:30" → "08:30 AM". Passes through anything that isn't HH:MM. */
export function fmtTime(hhmm) {
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) return hhmm || "";
  let [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ap}`;
}

export const periodLabel = (labels, i) => (labels?.[i]?.trim() ? labels[i] : `Period ${i + 1}`);

/**
 * Filter bar: Session (academic year) · Class · Section · Timetable Session.
 * `show` lets a page hide fields it doesn't use (e.g. Employee page).
 */
export function TimetableFilters({
  sessions = [], classes = [], sections = [],
  academicYearId, classId, sectionId, ttSession,
  onYear, onClass, onSection, onTt,
  extra = null,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5">
      <Select label="Session" value={academicYearId} onChange={(e) => onYear?.(e.target.value)}
        options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
      <Select label="Class" value={classId} onChange={(e) => onClass?.(e.target.value)}
        options={[{ value: "", label: "Select..." }, ...sortClasses(classes).map((c) => ({ value: c.id, label: c.name }))]} />
      <Select label="Class (Year/Semester)" value={sectionId} onChange={(e) => onSection?.(e.target.value)} disabled={!classId}
        options={[{ value: "", label: "Select..." }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
      <Select label="Timetable Session" value={ttSession} onChange={(e) => onTt?.(e.target.value)} options={TT_SESSIONS} />
      {extra}
    </div>
  );
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/**
 * Open a print-ready weekly timetable grid (school header + meta lines) and
 * trigger the browser print dialog for "Save as PDF" — matching the video's
 * "Download as PDF". Each body cell may be a multi-line string ("time\nsubject").
 *
 *   printTimetableGrid({
 *     meta: [["Session", "2026-2027"], ["Class", "1st"]],
 *     columns: ["Day Name", "Period 1", ...],
 *     rows: [["Monday", "08:30 AM - 09:00 AM\nMaths", "X", ...]],
 *   })
 */
export function printTimetableGrid({ title = "Time Table", meta = [], columns = [], rows = [] }) {
  const school = getSchool();
  const win = window.open("", "_blank", "width=1100,height=900");
  if (!win) { alert("Please allow pop-ups for this site to save as PDF."); return false; }

  const head = columns.map((c) => `<th>${esc(c)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((cell, i) => {
      const html = String(cell ?? "").split("\n").map((ln) => esc(ln)).join("<br/>");
      return `<td class="${i === 0 ? "day" : ""}">${html || "X"}</td>`;
    }).join("")}</tr>`)
    .join("");
  const metaHtml = meta
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `<div><b>${esc(k)} :</b> ${esc(v)}</div>`)
    .join("");

  win.document.write(`<!doctype html><html><head><meta charset="utf-8"/><title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; margin: 22px; }
  .frame { border: 1.5px solid #111827; }
  .sch { text-align: center; padding: 12px; border-bottom: 1.5px solid #111827; }
  .sch h1 { margin: 0; font-size: 22px; font-weight: 800; }
  .sch p { margin: 2px 0 0; font-size: 12px; color: #374151; }
  .meta { padding: 12px 14px; font-size: 13px; line-height: 1.7; border-bottom: 1.5px solid #111827; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid #111827; padding: 8px 6px; font-size: 11.5px; text-align: center; vertical-align: middle; }
  th { background: #f3f4f6; font-weight: 700; }
  td.day { font-weight: 700; background: #fafafa; }
  @page { size: A4 landscape; margin: 10mm; }
  @media print { body { margin: 0; } th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
  <div class="frame">
    <div class="sch"><h1>${esc(school.name || "School")}</h1>${school.address ? `<p>${esc(school.address)}</p>` : ""}</div>
    ${metaHtml ? `<div class="meta">${metaHtml}</div>` : ""}
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  </div>
  <script>window.onload=function(){setTimeout(function(){window.focus();window.print();},300);};</script>
</body></html>`);
  win.document.close();
  return true;
}
