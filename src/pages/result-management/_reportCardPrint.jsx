/**
 * The printed report card: letterhead with logo, Reg. no and UDISE; the
 * student's particulars beside the photo; scholastic and co-scholastic marks
 * with grades; total, percentage, grade, rank and attendance; subject-wise
 * bars, the grading scale, remarks and the signature line, on one A4 page
 * that is filled top to bottom whatever the number of subjects.
 *
 * One renderer serves the on-screen preview and the print. Cards generated
 * before the school, photo, rank and attendance were stored still print; the
 * missing parts are left out, and regenerating fills them in.
 */
import { useEffect, useRef, useState } from "react";
import { getSchool } from "../../utils/printPdf";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// A hosted image, or one saved inline as a base64 data URL; anything else is dropped.
const img = (u) => (/^(https?:\/\/|data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,)/i.test(String(u || "")) ? esc(u) : "");
const up = (s) => esc(String(s ?? "").toUpperCase());
/** "2013-11-24" → "24/11/2013" */
const dmy = (s) => (/^\d{4}-\d{2}-\d{2}/.test(s || "") ? s.slice(0, 10).split("-").reverse().join("/") : s || "");
const num = (n) => (n === null || n === undefined || n === "" ? "" : Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 }));
const pctOf = (scored, total) => (typeof scored === "number" && total ? Math.round((scored / total) * 10000) / 100 : null);
/** A bar's colour, by how well the subject went. */
const tone = (p) => (p >= 90 ? "#15803d" : p >= 75 ? "#16a34a" : p >= 60 ? "#2563eb" : p >= 40 ? "#d97706" : "#dc2626");

const CSS = `
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: Georgia, "Times New Roman", Times, serif; color: #1c1917; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 210mm; height: 297mm; padding: 10mm 11mm 9mm; overflow: hidden; display: flex; flex-direction: column; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.page > .frame { position: absolute; inset: 4.5mm; border: 2.2px solid #b45309; outline: .6px solid #b45309; outline-offset: -2.2mm; pointer-events: none; z-index: 0; }
.page > .wm { position: absolute; left: 50%; top: 55%; width: 118mm; transform: translate(-50%, -50%); opacity: .07; z-index: 0; pointer-events: none; }
.page > :not(.wm):not(.frame) { position: relative; z-index: 1; }

.head { display: grid; grid-template-columns: 28mm 1fr 30mm; align-items: center; gap: 3mm; }
.logo img { width: 26mm; max-height: 26mm; object-fit: contain; display: block; }
.mid { text-align: center; }
.sname { font-size: 25px; font-weight: 700; letter-spacing: .5px; line-height: 1.1; text-transform: uppercase; color: #7c2d12; }
.sline { font-size: 11.5px; line-height: 1.35; color: #44403c; }
.phones { font-size: 12px; line-height: 1.3; display: flex; gap: 5px; align-self: start; padding-top: 2mm; }
.phones .ic { font-size: 15px; line-height: 1; color: #9a3412; }

.ribbon { display: flex; justify-content: center; margin: 3mm 0 1.2mm; }
.ribbon span { color: #fff; font-size: 14px; font-weight: 700; letter-spacing: 3px; padding: 1.3mm 12mm;
  background: linear-gradient(90deg, #c2410c, #ea580c 50%, #c2410c);
  clip-path: polygon(0 0, 100% 0, calc(100% - 4mm) 50%, 100% 100%, 0 100%, 4mm 50%); }
.sub { text-align: center; font-size: 12.5px; color: #292524; margin-bottom: 3mm; }
.sub b { color: #7c2d12; }
.sub .dot { color: #ea580c; padding: 0 2mm; }

table { width: 100%; border-collapse: collapse; }
table.info td { border: 1px solid #57534e; padding: 1.6mm 2.4mm; font-size: 12px; vertical-align: middle; }
table.info td.k { background: #fde4cc; font-weight: 700; width: 25mm; white-space: nowrap; }
table.info td.v { text-transform: uppercase; }
table.info td.photo { width: 30mm; padding: 1mm; text-align: center; background: #fff; }
td.photo img, td.photo .ph { width: 27mm; height: 32mm; object-fit: cover; display: block; margin: 0 auto; border: 1px solid #a8a29e; }
td.photo .ph { background: #ececec; }
td.photo .ph svg { width: 100%; height: 100%; display: block; }

table.marks { margin-top: 3mm; }
table.marks th, table.marks td { border: 1px solid #57534e; text-align: center; font-size: var(--fs); padding: var(--rp) 2mm; }
table.marks thead th { background: #f6b073; font-weight: 700; color: #1c1917; }
table.marks thead tr.top th { background: #f39a4f; }
table.marks td.s { text-align: left; font-weight: 700; text-transform: uppercase; }
table.marks td.g { font-weight: 700; color: #7c2d12; }
table.marks tbody tr:nth-child(even) td { background: rgba(255, 237, 213, .55); }
table.marks td.ab { color: #b91c1c; font-weight: 700; }
table.marks tr.grand td { background: #fde4cc !important; font-weight: 700; font-size: 12.5px; }
table.marks tr.band td { background: #fff7ed !important; font-weight: 700; letter-spacing: 1px; color: #9a3412; text-align: left; }

.tiles { display: grid; grid-template-columns: repeat(5, 1fr); gap: 2.4mm; margin-top: 3mm; }
.tile { border: 1px solid #57534e; border-top: 3px solid #ea580c; border-radius: 2.4mm; background: #fff7ed; text-align: center; padding: 1.6mm 1mm 1.4mm; }
.tile .l { font-size: 9.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #78716c; }
.tile .v { font-size: 17px; font-weight: 700; color: #1c1917; line-height: 1.25; }
.tile .v small { font-size: 10.5px; font-weight: 400; color: #57534e; }

.scale { display: flex; flex-wrap: wrap; align-items: center; gap: 1mm 1.5mm; margin-top: 2.4mm; padding: 1.4mm 2.4mm; border: 1px solid #57534e; background: #fff7ed; font-size: 10.5px; }
.scale .k { font-weight: 700; color: #7c2d12; margin-right: .6mm; }
.scale .chip { border: 1px solid #fdba74; background: #fff; border-radius: 99px; padding: .2mm 1.6mm; white-space: nowrap; }
.scale .chip b { color: #9a3412; }
.lower { flex: 1; display: grid; grid-template-columns: 1fr 50mm; gap: 3mm; margin-top: 3mm; min-height: 0; }
.lower.solo { grid-template-columns: 1fr; }
.panel { border: 1px solid #a8a29e; border-radius: 2.4mm; padding: 2.4mm 3mm; display: flex; flex-direction: column; min-height: 0; background: rgba(255, 255, 255, .78); }
.ptitle { font-size: 10.5px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; color: #9a3412; border-bottom: 1px solid #fed7aa; padding-bottom: 1.2mm; margin-bottom: 1.6mm; }
.bars { flex: 1; display: flex; flex-direction: column; justify-content: space-evenly; }
.bars.two { display: grid; grid-template-columns: 1fr 1fr; grid-auto-flow: column; grid-template-rows: repeat(var(--br), 1fr); column-gap: 5mm; align-items: center; }
.bars.two .bar { grid-template-columns: 24mm 1fr 10mm; }
.bar { display: grid; grid-template-columns: 30mm 1fr 15mm; align-items: center; gap: 2mm; font-size: 10px; }
.bar .n { font-weight: 700; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bar .t { height: 3.4mm; border-radius: 2mm; background: #f5f5f4; border: .5px solid #e7e5e4; overflow: hidden; }
.bar .f { height: 100%; border-radius: 2mm; }
.bar .p { text-align: right; font-weight: 700; }
.att { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: space-evenly; gap: 2mm; }
.ring { width: 20mm; height: 20mm; border-radius: 50%; display: grid; place-items: center; flex: none; }
.ring b { width: 14.5mm; height: 14.5mm; border-radius: 50%; background: #fff; display: grid; place-items: center; font-size: 12.5px; }
.att table td { font-size: 11px; padding: .5mm 1.4mm; }
.att table td:last-child { text-align: right; font-weight: 700; }

.remarks { margin-top: 3mm; border: 1px solid #a8a29e; border-radius: 2.4mm; padding: 2mm 3mm; font-size: 12.5px; min-height: 13mm; background: rgba(255, 255, 255, .78); }
.remarks b { color: #9a3412; }
.sign { display: grid; grid-template-columns: repeat(5, 1fr); gap: 4mm; align-items: end; margin-top: 9mm; font-size: 12px; text-align: center; }
.sign div { border-top: 1px solid #44403c; padding-top: 1.2mm; font-weight: 700; }
.sign div small { display: block; font-weight: 400; font-size: 10px; color: #57534e; }
.sign .date { border-top: 0; font-weight: 400; }
`;

function letterhead(school) {
  const phones = String(school?.phone || "").split(/[,/]/).map((p) => p.trim()).filter(Boolean);
  return `
  <div class="head">
    <div class="logo">${img(school?.logo) ? `<img src="${img(school.logo)}" alt="">` : ""}</div>
    <div class="mid">
      <div class="sname">${esc(school?.name || "School")}</div>
      ${school?.address ? `<div class="sline">${esc(school.address)}</div>` : ""}
      ${school?.registrationNo ? `<div class="sline">Reg.no - ${esc(school.registrationNo)}</div>` : ""}
      ${school?.udise ? `<div class="sline">UDISE - ${esc(school.udise)}</div>` : ""}
    </div>
    <div class="phones">${phones.length ? `<span class="ic">&#9742;</span><span>${phones.map(esc).join(",<br>")}</span>` : ""}</div>
  </div>`;
}

// Stand-in when the student has no photo — the same figure the admission form shows.
const SILHOUETTE = `<svg viewBox="0 0 100 120" aria-hidden="true"><circle cx="50" cy="44" r="21" fill="#a4a6a9"/><path d="M8 120 C 10 88 28 76 50 76 C 72 76 90 88 92 120 Z" fill="#a4a6a9"/></svg>`;

const tile = (label, value) => `<div class="tile"><div class="l">${esc(label)}</div><div class="v">${value || "—"}</div></div>`;

/** One report card page. */
function cardPage(d) {
  // The letterhead saved with the card, with any blank part (often the logo)
  // taken from the school the user is signed in to.
  const own = getSchool();
  const saved = d.school || {};
  const school = {
    ...saved,
    name: saved.name || own.name, address: saved.address || own.address, phone: saved.phone || own.phone,
    logo: saved.logo || own.logo, watermark: saved.watermark || own.watermark || saved.logo || own.logo,
  };
  const st = d.student || {};
  const subjects = (d.subjects || []).map((s) => ({ ...s, pct: s.percentage ?? pctOf(s.scored, s.total) }));
  const nonSubjects = (d.nonSubjects || []).filter((n) => n.scored !== null && n.scored !== undefined);
  const scale = d.gradingScale || [];
  const term = d.exam || d.term || "";
  const att = d.attendance && d.attendance.total ? d.attendance : null;
  const attPct = att ? Math.round((att.attended / att.total) * 1000) / 10 : null;
  // The marks table and the lower panels share what the fixed parts leave
  // (~126mm). The panels need room for every bar (two columns past ten
  // subjects) and for the attendance ring; the table rows get the rest, so
  // fewer subjects get roomier rows. A name too long for one line counts twice.
  const longNames = [...subjects.map((s) => s.subject), ...nonSubjects.map((n) => n.name)].filter((n) => String(n || "").length > 24).length;
  const rows = subjects.length + (nonSubjects.length ? nonSubjects.length + 1 : 0) + longNames;
  const twoCol = subjects.length > 10;
  const barRows = twoCol ? Math.ceil(subjects.length / 2) : subjects.length;
  const lowerNeed = Math.max(barRows * 3.8 + 12, att ? 46 : 0);
  const rp = `${Math.max(0.3, Math.min(2.4, ((126 - lowerNeed) / Math.max(rows, 1) - 4.6) / 2)).toFixed(2)}mm`;
  const fs = rows > 16 ? "10.5px" : rows > 13 ? "11px" : "12px";

  const subjRows = subjects.map((s) => `
    <tr><td class="s">${esc(s.subject)}</td><td>${num(s.total)}</td>
      ${s.scored === null ? `<td class="ab">AB</td><td>—</td>` : `<td>${num(s.scored)}</td><td>${s.pct === null ? "" : `${num(s.pct)}%`}</td>`}
      <td class="g">${esc(s.grade || "")}</td></tr>`).join("");
  const nonRows = nonSubjects.length
    ? `<tr class="band"><td colspan="5">CO-SCHOLASTIC AREAS</td></tr>` + nonSubjects.map((n) => `
      <tr><td class="s">${esc(n.name)}</td><td>${num(n.total)}</td><td>${num(n.scored)}</td><td>${n.total ? `${num(pctOf(n.scored, n.total))}%` : ""}</td><td class="g">${esc(n.grade || "")}</td></tr>`).join("")
    : "";

  const bars = subjects.map((s) => `
    <div class="bar"><span class="n">${esc(s.subject)}</span>
      <span class="t">${s.pct === null ? "" : `<span class="f" style="display:block;width:${Math.min(100, s.pct)}%;background:${tone(s.pct)}"></span>`}</span>
      <span class="p">${s.pct === null ? "AB" : `${Math.round(s.pct)}%`}</span></div>`).join("");

  const scaleStrip = scale.length
    ? `<div class="scale"><span class="k">Grading Scale:</span>${scale.map((b) => `<span class="chip"><b>${esc(b.grade)}</b> ${esc(b.min)}–${esc(b.max)}%${b.remarks ? ` · ${esc(b.remarks)}` : ""}</span>`).join("")}</div>`
    : "";
  const side = att ? `
    <div class="panel"><div class="ptitle">Attendance</div>
      <div class="att"><span class="ring" style="background:conic-gradient(${tone(attPct)} ${attPct * 3.6}deg,#f5f5f4 0)"><b>${num(attPct)}%</b></span>
        <table><tr><td>Working days</td><td>${num(att.total)}</td></tr><tr><td>Days present</td><td>${num(att.attended)}</td></tr><tr><td>Days absent</td><td>${num(att.total - att.attended)}</td></tr></table></div></div>` : "";

  return `<section class="page" style="--rp:${rp};--fs:${fs};--br:${barRows}">
  <div class="frame"></div>
  ${img(school.watermark) ? `<img class="wm" src="${img(school.watermark)}" alt="">` : ""}
  ${letterhead(school)}
  <div class="ribbon"><span>REPORT CARD</span></div>
  <div class="sub">Class: <b>${esc(d.className)}</b>${d.session ? `<span class="dot">◆</span>Academic Session: <b>${esc(d.session)}</b>` : ""}${term ? `<span class="dot">◆</span><b>${esc(term)}</b>` : ""}</div>

  <table class="info">
    <tr><td class="k">Name</td><td class="v">${esc(st.name)}</td><td class="k">DOB</td><td class="v">${esc(dmy(st.dateOfBirth))}</td>
      <td class="photo" rowspan="4">${img(st.photo) ? `<img src="${img(st.photo)}" alt="">` : `<div class="ph">${SILHOUETTE}</div>`}</td></tr>
    <tr><td class="k">Father's Name</td><td class="v">${esc(st.fatherName)}</td><td class="k">Mother's Name</td><td class="v">${esc(st.motherName)}</td></tr>
    <tr><td class="k">Class / Section</td><td class="v">${esc(d.className)}${d.sectionName ? ` / ${esc(d.sectionName)}` : ""}</td><td class="k">Session</td><td class="v">${esc(d.session)}</td></tr>
    <tr><td class="k">Roll No</td><td class="v">${esc(st.rollNumber)}</td><td class="k">${st.admissionNumber ? "Adm. / Reg. No" : "Reg No"}</td><td class="v">${esc([st.admissionNumber, st.registrationNo !== "N/A" ? st.registrationNo : ""].filter(Boolean).join(" / "))}</td></tr>
  </table>

  <table class="marks">
    <thead>
      <tr class="top"><th rowspan="2" style="width:58mm">SCHOLASTIC AREAS</th><th colspan="3">${up(term)}</th><th rowspan="2" style="width:20mm">GRADE</th></tr>
      <tr><th>Max. Marks</th><th>Marks Obtained</th><th>Percentage</th></tr>
    </thead>
    <tbody>
      ${subjRows}
      <tr class="grand"><td class="s">GRAND TOTAL</td><td colspan="3">${num(d.obtained)} out of ${num(d.total)} (${num(d.percentage)} %)</td><td class="g">${esc(d.grade || "")}</td></tr>
      ${nonRows}
    </tbody>
  </table>
  ${scaleStrip}

  <div class="tiles">
    ${tile("Total Marks", `${num(d.obtained)} <small>/ ${num(d.total)}</small>`)}
    ${tile("Percentage", `${num(d.percentage)}%`)}
    ${tile("Grade", esc(d.grade || ""))}
    ${tile("Rank", d.rank ? `${num(d.rank)}${d.classStrength ? ` <small>of ${num(d.classStrength)}</small>` : ""}` : "")}
    ${tile("Attendance", att ? `${num(attPct)}%` : "")}
  </div>

  <div class="lower${side ? "" : " solo"}">
    <div class="panel"><div class="ptitle">Subject-wise Performance</div><div class="bars${twoCol ? " two" : ""}">${bars}</div></div>
    ${side}
  </div>

  <div class="remarks"><b>Remarks:</b> ${esc(d.remark || "")}</div>
  <div class="sign">
    <div class="date">Date : ${esc(dmy(d.issueDate) || new Date().toLocaleDateString("en-GB"))}</div>
    <div>Exam Controller</div>
    <div>Class Teacher</div>
    <div>Principal${school.principalName ? `<small>${esc(school.principalName)}</small>` : ""}</div>
    <div>Parent's Signature</div>
  </div>
</section>`;
}

/** A printable document holding one page per card. */
export function reportCardDocument(cards) {
  const list = Array.isArray(cards) ? cards : [cards];
  const title = list.length === 1 ? `Report Card — ${list[0]?.student?.name || ""}` : `Report Cards (${list.length})`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title><style>${CSS}</style></head><body>${list.map(cardPage).join("")}</body></html>`;
}

/**
 * Print through a hidden iframe (no pop-up to block), once every image —
 * logo, watermark, photos — has loaded.
 */
export function printReportCards(cards) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(reportCardDocument(cards));
  doc.close();
  const pending = [...doc.images].filter((im) => !im.complete).map((im) => new Promise((r) => { im.onload = im.onerror = r; }));
  Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 8000))]).then(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1500);
  });
}

/** The card as it will print, scaled to the width it is given (scripts cannot run in it). */
export function ReportCardPreview({ card }) {
  const wrap = useRef(null);
  const [width, setWidth] = useState(0);
  const pxW = 794; // 210mm at 96dpi
  const pxH = 1123; // 297mm
  useEffect(() => {
    const el = wrap.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = width ? width / pxW : 0;
  return (
    <div ref={wrap}>
      <div style={{ height: pxH * scale, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,.18)", background: "#fff" }}>
        {scale > 0 && (
          <iframe title="Report card preview" sandbox="allow-same-origin" srcDoc={reportCardDocument(card)}
            style={{ width: pxW, height: pxH, border: 0, transform: `scale(${scale})`, transformOrigin: "0 0", display: "block" }} />
        )}
      </div>
    </div>
  );
}
