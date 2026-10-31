/**
 * Print layouts of the School Leaving and Bonafide certificates, reproducing
 * the school's paper format: letterhead with logo, Reg. no and UDISE; the
 * numbered particulars with the student's photo; a faded logo watermark; and
 * the Clerk / Date of Issue / Principal Signature line.
 *
 * One renderer serves the on-screen preview and the print, so what the office
 * checks is what comes out of the printer. A certificate is a full HTML
 * document in an iframe, which also keeps the ERP's own table/form styles out.
 */
import { useEffect, useRef, useState } from "react";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const img = (u) => (/^https?:\/\//i.test(String(u || "")) ? esc(u) : "");
/** "2026-10-05" → "05/10/2026" */
export const dmy = (s) => (/^\d{4}-\d{2}-\d{2}$/.test(s || "") ? s.split("-").reverse().join("/") : s || "");
const up = (s) => esc(String(s ?? "").toUpperCase());

/** He / his / son, from the gender on the record. */
function words(gender) {
  const m = /^m/i.test(gender || "");
  const f = /^f/i.test(gender || "");
  const pick = (a, b, c) => (m ? a : f ? b : c);
  return {
    child: pick("son", "daughter", "son/daughter"), He: pick("He", "She", "He/She"),
    His: pick("His", "Her", "His/Her"), his: pick("his", "her", "his/her"), him: pick("him", "her", "him/her"),
  };
}

const CSS = `
@page { size: A4 portrait; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; background: #fff; }
body { font-family: "Times New Roman", Times, serif; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 210mm; height: 297mm; padding: 12mm 13mm 14mm; overflow: hidden; display: flex; flex-direction: column; }
.page > .wm { position: absolute; left: 50%; top: 56%; width: 120mm; transform: translate(-50%, -50%); opacity: .09; z-index: 0; pointer-events: none; }
.page > :not(.wm) { position: relative; z-index: 1; }
.head { display: grid; grid-template-columns: 34mm 1fr 34mm; align-items: start; gap: 4mm; }
.logo img { width: 32mm; max-height: 30mm; object-fit: contain; display: block; margin-top: 2mm; }
.mid { text-align: center; }
.sname { font-size: 27px; font-weight: 700; letter-spacing: .3px; line-height: 1.15; text-transform: uppercase; }
.sline { font-size: 15px; line-height: 1.3; }
.title { margin-top: 7px; font-size: 17px; font-weight: 700; letter-spacing: .4px; }
.phones { font-size: 14px; line-height: 1.25; display: flex; gap: 6px; padding-top: 3mm; }
.phones .ic { font-size: 17px; line-height: 1; }
.rule { border-top: 2.5px solid #000; margin: 5mm 0 4mm; }
.ref { display: flex; justify-content: space-between; align-items: baseline; font-style: italic; margin: 0 2mm 2mm; }
.ref .l { font-size: 20px; } .ref .l b { font-size: 20px; }
.ref .r { font-size: 15px; }
table.p { width: 100%; border-collapse: collapse; font-style: italic; font-size: 16px; }
table.p td { border: 1px solid #000; padding: 6px 10px; vertical-align: middle; }
table.p td b { text-transform: uppercase; }
td.photo { width: 52mm; text-align: center; padding: 4px !important; }
td.photo img { width: 42mm; height: 50mm; object-fit: cover; border: 1px solid #999; display: block; margin: 0 auto; }
td.photo .ph { width: 42mm; height: 50mm; margin: 0 auto; border: 1px dashed #777; display: flex; align-items: center; justify-content: center; font-size: 12px; font-style: normal; color: #555; }
table.att { width: 100%; border-collapse: collapse; margin: 10px 0 6px; font-size: 16px; }
table.att th, table.att td { border: 1.5px solid #000; padding: 5px 6px; text-align: center; }
table.att th { font-weight: 700; }
.body { font-size: 18px; line-height: 2.05; text-align: justify; margin: 4mm 2mm 0; }
.body b { font-style: italic; text-transform: uppercase; }
.bphoto { float: right; margin: 0 0 4mm 6mm; }
.bphoto img, .bphoto .ph { width: 34mm; height: 41mm; object-fit: cover; border: 1px solid #999; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #555; }
.spacer { flex: 1; }
.foot { display: flex; justify-content: space-around; font-size: 17px; padding: 0 4mm; }
`;

function letterhead(school, title) {
  const phones = String(school?.phone || "").split(/[,/]/).map((p) => p.trim()).filter(Boolean);
  return `
  <div class="head">
    <div class="logo">${img(school?.logo) ? `<img src="${img(school.logo)}" alt="">` : ""}</div>
    <div class="mid">
      <div class="sname">${esc(school?.name)}</div>
      ${school?.address ? `<div class="sline">${esc(school.address)}</div>` : ""}
      ${school?.registrationNo ? `<div class="sline">Reg.no -${esc(school.registrationNo)}</div>` : ""}
      ${school?.udise ? `<div class="sline">UDISE- ${esc(school.udise)}</div>` : ""}
      <div class="title">${esc(title)}</div>
    </div>
    <div class="phones">${phones.length ? `<span class="ic">&#9742;</span><span>${phones.map(esc).join(",<br>")}</span>` : ""}</div>
  </div>
  <div class="rule"></div>`;
}

const watermark = (school) => (img(school?.watermark) ? `<img class="wm" src="${img(school.watermark)}" alt="">` : "");
const photoCell = (student) =>
  img(student?.photo) ? `<img src="${img(student.photo)}" alt="">` : `<div class="ph">Photo</div>`;
const foot = `<div class="spacer"></div><div class="foot"><span>Clerk</span><span>Date of Issue</span><span>Principal Signature</span></div>`;

/** School Leaving Certificate — the 17 particulars of the paper format. */
function schoolLeavingPage({ school, student, fields, referenceNo, issueDate }) {
  const f = fields || {};
  const s = student || {};
  const row = (n, label, value) => `<tr><td colspan="2"><b style="text-transform:none">${n}.</b> ${label} <b>${esc(value ?? "")}</b></td></tr>`;
  const classSession = [s.className, s.session ? `(${s.session})` : ""].filter(Boolean).join(" ");
  return `<section class="page">
  ${watermark(school)}
  ${letterhead(school, "SCHOOL LEAVING CERTIFICATE")}
  <div class="ref"><span class="l">Reference No: <b>${esc(referenceNo)}</b></span><span class="r">Date: ${issueDate ? `<b>${esc(dmy(issueDate))}</b>` : "………………"}</span></div>
  <table class="p">
    <tr><td><b style="text-transform:none">1.</b> Name of Candidate <b>${esc(s.name)}</b></td><td class="photo" rowspan="4">${photoCell(s)}</td></tr>
    <tr><td><b style="text-transform:none">2.</b> Name of Guardian/Father <b>${esc(s.fatherName || s.guardianName)}</b></td></tr>
    <tr><td><b style="text-transform:none">3.</b> Name of Mother <b>${esc(s.motherName)}</b></td></tr>
    <tr><td style="height:16mm"><b style="text-transform:none">4.</b> Relation of Candidate with Guardian <b>${esc(f.guardianRelation)}</b></td></tr>
    ${row(5, "Permanent Address", s.permanentAddress)}
    ${row(6, "Temporary Address", s.temporaryAddress)}
    ${row(7, "Enrolment Number", f.enrollmentNo)}
    ${row(8, "P.E.N Number", f.penNo)}
    ${row(9, "AAPAR Number", f.apaarNo)}
    ${row(10, "Date of Birth", dmy(s.dob))}
    ${row(11, "Class with Session", classSession)}
    ${row(12, "Whether candidate qualified for promotion to the higher class", f.qualifiedFor)}
    <tr><td colspan="2"><b style="text-transform:none">13.</b> Attendance of Student after school leaving before end of the session in present year
      <table class="att"><tr><th>Date of Admission</th><th>Date of Leaving</th><th>Total Working Days</th><th>Total Present</th></tr>
      <tr><td>${esc(dmy(f.admissionDate))}</td><td>${esc(dmy(f.leavingDate))}</td><td>${esc(f.totalWorkingDays)}</td><td>${esc(f.totalPresent)}</td></tr></table>
    </td></tr>
    ${row(14, "Extra Activities(If Any)", f.extraActivity)}
    ${row(15, "Character (During Study Period)", f.character)}
    ${row(16, "Reason for leaving the school", f.leavingReason)}
    ${row(17, "Due Amount (If any remained)", f.dueAmount ? `Rs. ${Number(f.dueAmount).toLocaleString("en-IN")}` : "")}
  </table>
  ${foot}
</section>`;
}

/** Bonafide Certificate — same letterhead, the certificate in words. */
function bonafidePage({ school, student, fields, referenceNo, issueDate }) {
  const f = fields || {};
  const s = student || {};
  const w = words(s.gender);
  const parents = [s.fatherName, s.motherName].filter(Boolean).map((n) => `<b>${up(n)}</b>`).join(" and ");
  const cls = s.section ? `${s.className}-${s.section}` : s.className;
  // Most schools name classes "Class 5"; others "5TH" — say "Class" only once.
  const inClass = /^class\b/i.test(cls || "") ? `<b>${up(cls)}</b>` : `Class <b>${up(cls)}</b>`;
  return `<section class="page">
  ${watermark(school)}
  ${letterhead(school, "BONAFIDE CERTIFICATE")}
  <div class="ref"><span class="l">Reference No: <b>${esc(referenceNo)}</b></span><span class="r">Date: ${issueDate ? `<b>${esc(dmy(issueDate))}</b>` : "………………"}</span></div>
  <div class="body">
    <div class="bphoto">${img(s.photo) ? `<img src="${img(s.photo)}" alt="">` : `<div class="ph">Photo</div>`}</div>
    <p>This is to certify that <b>${up(s.name)}</b>${parents ? `, ${w.child} of ${parents}` : ""}${s.permanentAddress ? `, resident of <b>${up(s.permanentAddress)}</b>` : ""},
    is a bonafide student of this school. ${w.He} is studying in ${inClass}${s.session ? ` in the session <b>${up(s.session)}</b>` : ""}${f.enrollmentNo ? `, with Enrollment Number <b>${up(f.enrollmentNo)}</b>` : ""}${s.rollNumber ? ` and Roll Number <b>${up(s.rollNumber)}</b>` : ""}.
    ${s.dob ? `${w.His} date of birth as per the school records is <b>${esc(dmy(s.dob))}</b>.` : ""}</p>
    ${f.character ? `<p>${w.His} character and conduct in the school are <b>${up(f.character)}</b>.</p>` : ""}
    <p>This certificate is issued to ${w.him} on ${w.his} request for the purpose of <b>${up(f.purpose)}</b>.</p>
  </div>
  ${foot}
</section>`;
}

const PAGES = { SCHOOL_LEAVING: schoolLeavingPage, BONAFIDE: bonafidePage };

/** A full printable document for one certificate. */
export function certificateDocument(type, cert) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(cert.referenceNo || "Certificate")}</title><style>${CSS}</style></head><body>${PAGES[type](cert)}</body></html>`;
}

/**
 * Print through a hidden iframe (no pop-up to block), once every image —
 * logo, watermark, photo — has loaded.
 */
export function printCertificate(type, cert) {
  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.open();
  doc.write(certificateDocument(type, cert));
  doc.close();
  const pending = [...doc.images].filter((im) => !im.complete).map((im) => new Promise((r) => { im.onload = im.onerror = r; }));
  Promise.race([Promise.all(pending), new Promise((r) => setTimeout(r, 8000))]).then(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1500);
  });
}

/** The certificate as it will print, scaled to the width it is given (scripts cannot run in it). */
export function CertificatePreview({ type, cert }) {
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
          <iframe title="Certificate preview" sandbox="allow-same-origin" srcDoc={certificateDocument(type, cert)}
            style={{ width: pxW, height: pxH, border: 0, transform: `scale(${scale})`, transformOrigin: "0 0", display: "block" }} />
        )}
      </div>
    </div>
  );
}
