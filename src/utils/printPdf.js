/**
 * printPdf.js — open a clean, print-ready view of a record in a new window and
 * trigger the browser's print dialog (where the user can "Save as PDF").
 *
 *   printRecord({
 *     title: "Student Admission",
 *     subtitle: "Roll No 12",
 *     photo: "https://…",            // optional image URL
 *     sections: [
 *       { heading: "Basic", rows: [["Name", "Asha"], ["Gender", "Female"]] },
 *     ],
 *   })
 *
 * Empty / null values are skipped so the printout stays tidy.
 */
function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/**
 * The current school's name for the printout header. Read from the persisted
 * auth user (populated on login). Callers may override via the `school` option.
 */
export function getSchoolName() {
  try {
    return JSON.parse(localStorage.getItem("erp_auth"))?.user?.schoolName || "";
  } catch {
    return "";
  }
}

/**
 * Full school identity for printed bills/receipts — name, address, phone, email
 * and logo. Read from the persisted auth user (populated on login). Fields that
 * weren't captured at login simply come back empty and are omitted on the bill.
 */
export function getSchool() {
  try {
    const u = JSON.parse(localStorage.getItem("erp_auth"))?.user || {};
    return {
      name: u.schoolName || "",
      address: u.schoolAddress || "",
      phone: u.schoolPhone || "",
      email: u.schoolEmail || "",
      logo: u.schoolLogo || "",
      // Dedicated bill watermark image; falls back to the main logo.
      watermark: u.schoolWatermark || u.schoolLogo || "",
      // UPI payment QR shown on demand bills ("Pay on this QR").
      upiQr: u.schoolUpiQr || "",
    };
  } catch {
    return { name: "", address: "", phone: "", email: "", logo: "", watermark: "", upiQr: "" };
  }
}

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
const amt = (v) => (typeof v === "number" ? inr(v) : esc(v));

// ── Shared single-bill markup ────────────────────────────────────────────────
// The demand-bill / receipt look lives in ONE place so that the on-screen
// download (printBill → browser print) and the WhatsApp PDF (billToPdfBase64 →
// html2canvas) are pixel-identical. Both render the exact same HTML + CSS.
const BILL_CSS = `
  * { box-sizing: border-box; }
  .bill { position: relative; width: 460px; margin: 0 auto; background: #fff; border: 2px solid #111827; padding: 14px 16px 18px; overflow: hidden; font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; }
  .bill .wm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .bill .wm img { width: 68%; max-width: 320px; opacity: 0.07; filter: grayscale(100%); }
  .bill .content { position: relative; z-index: 1; }
  .bill .phone { text-align: right; font-size: 12px; font-weight: 600; letter-spacing: .3px; min-height: 16px; }
  .bill .sname { text-align: center; font-size: 26px; font-weight: 800; letter-spacing: 1px; margin: 2px 0 0; text-transform: uppercase; }
  .bill .addr { text-align: center; font-size: 12px; color: #374151; margin-top: 2px; }
  .bill .btype { text-align: center; font-size: 14px; font-weight: 600; color: #374151; margin: 8px 0 10px; }
  .bill .meta { display: flex; border: 1.5px solid #111827; }
  .bill .meta > div { flex: 1; padding: 8px 10px; }
  .bill .meta > div + div { border-left: 1.5px solid #111827; }
  .bill .mrow { display: flex; gap: 8px; font-size: 12.5px; padding: 1.5px 0; }
  .bill .mk { flex: 0 0 78px; font-weight: 700; }
  .bill .mv { flex: 1; }
  .bill table { width: 100%; border-collapse: collapse; border: 1.5px solid #111827; border-top: 0; }
  .bill th { background: #f3f4f6; font-size: 14px; font-weight: 700; padding: 8px 10px; border-bottom: 1.5px solid #111827; }
  .bill th.d, .bill td.d { text-align: left; border-right: 1.5px solid #111827; }
  .bill th.a, .bill td.a { text-align: right; width: 40%; }
  .bill td { padding: 6px 10px; font-size: 13px; }
  .bill tr.total td { border-top: 1.5px solid #111827; font-size: 16px; font-weight: 800; padding: 10px; }
  .bill tr.total td.d { text-align: center; }
  .bill .note { font-size: 11.5px; color: #374151; border: 1.5px solid #111827; border-top: 0; padding: 6px 10px; }
  .bill .qr { display: flex; align-items: center; gap: 8px; border: 1.5px solid #111827; border-top: 0; padding: 3px 4px; min-height: 128px; }
  .bill .qr img { width: 122px; height: 122px; object-fit: contain; flex: 0 0 122px; }
  .bill .qr .qrText { display: flex; flex-direction: column; justify-content: center; gap: 6px; min-width: 0; }
  .bill .qr .note { border: 0; padding: 0; font-size: 11.5px; line-height: 1.35; }
  .bill .qr .pay { font-size: 13px; font-weight: 700; }
  .bill .thanks { text-align: right; font-size: 16px; font-weight: 700; margin-top: 8px; }
`;

/** The inner markup of a single bill card (without the outer `.bill` wrapper). */
function billInner({
  billType = "Demand Bill", billNo = "", date = "", month = "", year = "",
  party = {}, rows = [], total = 0, totalLabel = "Grand Total",
  note = "Kindly pay fee before 10th of the Month.", footer = "Thanks",
}, school) {
  // Father's name sits directly under the student's, where parents look for it
  // when several siblings' bills come home together. Dropped from the layout
  // when absent (metaCol filters empties), so nothing shifts for a record
  // that has no father on file.
  const left = [
    ["Bill No", billNo],
    ["Name", party.name],
    ["Father Name", party.fatherName],
    ["Class", party.className],
    ["Batch", party.batch],
  ];
  const right = [["Date", date], ["Month", month], ["Year", year], ["ID No", party.idNo]];
  const metaCol = (pairs) =>
    pairs
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([l, v]) => `<div class="mrow"><span class="mk">${esc(l)}</span><span class="mv">${esc(v)}</span></div>`)
      .join("");
  const bodyRows = rows.map(([d, a]) => `<tr><td class="d">${esc(d)}</td><td class="a">${amt(a)}</td></tr>`).join("");
  return `
    ${(school.watermark || school.logo) ? `<div class="wm"><img src="${esc(school.watermark || school.logo)}" alt="" crossorigin="anonymous" /></div>` : ""}
    <div class="content">
      <div class="phone">${esc(school.phone || "")}</div>
      <h1 class="sname">${esc(school.name || "School")}</h1>
      ${school.address ? `<div class="addr">${esc(school.address)}</div>` : ""}
      <div class="btype">${esc(billType)}</div>
      <div class="meta"><div>${metaCol(left)}</div><div>${metaCol(right)}</div></div>
      <table>
        <thead><tr><th class="d">Description</th><th class="a">Amount</th></tr></thead>
        <tbody>
          ${bodyRows}
          <tr class="total"><td class="d">${esc(totalLabel)}</td><td class="a">${amt(total)}</td></tr>
        </tbody>
      </table>
      ${school.upiQr
        ? `<div class="qr"><img src="${esc(school.upiQr)}" alt="UPI QR" crossorigin="anonymous" /><div class="qrText">${note ? `<div class="note">Note : ${esc(note)}</div>` : ""}<span class="pay">Pay on this QR</span></div></div>`
        : note ? `<div class="note">Note : ${esc(note)}</div>` : ""}
      ${footer ? `<div class="thanks">${esc(footer)}</div>` : ""}
    </div>`;
}

/**
 * Render a demand bill / fee receipt to a PDF and return its base64 (no data:
 * prefix) — ready to POST to `/whatsapp/send-media` as a document. Uses the SAME
 * markup as the on-screen download (printBill), so the WhatsApp copy is
 * pixel-identical to what the office prints. Accepts the exact same options as
 * printBill().
 */
export async function billToPdfBase64(opts = {}) {
  const school = opts.school || getSchool();
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const holder = document.createElement("div");
  holder.style.cssText = "position:fixed;left:-10000px;top:0;width:492px;background:#fff;padding:16px;z-index:-1;";
  holder.innerHTML = `<style>${BILL_CSS}</style><div class="bill">${billInner(opts, school)}</div>`;
  document.body.appendChild(holder);

  try {
    // Let remote images (logo watermark / UPI QR) finish loading first, else
    // html2canvas captures an empty box where they should be.
    const imgs = [...holder.querySelectorAll("img")];
    await Promise.all(imgs.map((img) => (img.complete ? Promise.resolve() : new Promise((res) => { img.onload = res; img.onerror = res; }))));

    const canvas = await html2canvas(holder.querySelector(".bill"), {
      scale: 2, backgroundColor: "#ffffff", useCORS: true, logging: false,
    });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);

    const pdf = new jsPDF({ unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 36;
    let w = pageW - margin * 2;
    let h = (canvas.height / canvas.width) * w;
    const maxH = pageH - margin * 2;
    if (h > maxH) { h = maxH; w = (canvas.width / canvas.height) * h; }
    pdf.addImage(imgData, "JPEG", (pageW - w) / 2, margin, w, h);

    return pdf.output("datauristring").split(",")[1];
  } finally {
    document.body.removeChild(holder);
  }
}

/**
 * printBill — open a print-ready single-party bill (demand bill / fee receipt)
 * in the compact "Demand Bill" layout and trigger the print dialog. The school
 * logo is rendered as a faint centered watermark behind the content.
 *
 *   printBill({
 *     billType: "Demand Bill",                 // or "Fee Receipt"
 *     billNo: "7767",
 *     date: "2026-05-31", month: "June", year: "2026-27",
 *     party: { name: "Riddhi Arya", className: "10TH", batch: "A", idNo: "CC874" },
 *     rows: [["Tuition Fee", 1200], ["Admission Fee", 0]],   // [description, amount]
 *     total: 1200,                              // grand total (number → ₹, or string)
 *     totalLabel: "Grand Total",
 *     note: "Kindly pay fee before 10th of the Month.",
 *     footer: "Thanks",
 *   })
 */
export function printBill({
  billType = "Demand Bill",
  billNo = "",
  date = "",
  month = "",
  year = "",
  party = {},
  rows = [],
  total = 0,
  totalLabel = "Grand Total",
  note = "Kindly pay fee before 10th of the Month.",
  footer = "Thanks",
  school = getSchool(),
} = {}) {
  const win = window.open("", "_blank", "width=720,height=1000");
  if (!win) {
    alert("Please allow pop-ups for this site to save as PDF.");
    return false;
  }

  const inner = billInner({ billType, billNo, date, month, year, party, rows, total, totalLabel, note, footer }, school);

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(billType)}${billNo ? ` #${esc(billNo)}` : ""}</title>
<style>
  ${BILL_CSS}
  body { margin: 0; padding: 24px; background: #f3f4f6; }
  /* On paper the bill sits at the TOP-LEFT of the sheet (the office cuts it out
     and files it), not floated in the middle of an A4 page. The on-screen
     preview keeps its centred card look. */
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .bill { border-width: 2px; margin: 0; }
  }
</style>
</head>
<body>
  <div class="bill">${inner}</div>
  <script>
    window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 300); };
  </script>
</body>
</html>`);
  win.document.close();
  return true;
}

/**
 * printBills — print MANY compact demand bills laid out in a grid, `perPage`
 * to a sheet (default 6, like ID cards), with a page break after each sheet.
 * Each entry is the same shape printBill() takes.
 *
 *   printBills({ bills: [{ billType, billNo, date, month, year, party, rows, total, note }, ...], perPage: 6 })
 */
export function printBills({ bills = [], perPage = 6, school = getSchool() } = {}) {
  if (!bills.length) { alert("No bills to print."); return false; }
  const win = window.open("", "_blank", "width=900,height=1100");
  if (!win) { alert("Please allow pop-ups for this site to save as PDF."); return false; }

  // Each bill carries a UPI QR block when one is configured, which is taller —
  // cap at 4 per sheet so the QR always fits (a QR-less sheet keeps its layout).
  if (school.upiQr && perPage > 4) perPage = 4;

  const metaCol = (pairs) =>
    pairs
      .filter(([, v]) => v !== null && v !== undefined && v !== "")
      .map(([l, v]) => `<div class="mrow"><span class="mk">${esc(l)}</span><span class="mv">${esc(v)}</span></div>`)
      .join("");

  const billCard = (b) => {
    // Father's name sits right under the student's — same order as the single
    // bill layout — so parents can tell siblings' slips apart. metaCol drops it
    // for a record with no father on file.
    const left = [
      ["Bill No", b.billNo],
      ["Name", b.party?.name],
      ["Father Name", b.party?.fatherName],
      ["Class", b.party?.className],
      ["Batch", b.party?.batch],
    ];
    const right = [["Date", b.date], ["Month", b.month], ["Year", b.year], ["ID No", b.party?.idNo]];
    const body = (b.rows || []).map(([d, a]) => `<tr><td class="d">${esc(d)}</td><td class="a">${amt(a)}</td></tr>`).join("");
    return `<div class="bill">
      ${(school.watermark || school.logo) ? `<div class="wm"><img src="${esc(school.watermark || school.logo)}" alt="" /></div>` : ""}
      <div class="content">
        <div class="phone">${esc(school.phone || "")}</div>
        <h1 class="sname">${esc(school.name || "School")}</h1>
        ${school.address ? `<div class="addr">${esc(school.address)}</div>` : ""}
        <div class="btype">${esc(b.billType || "Demand Bill")}</div>
        <div class="meta"><div>${metaCol(left)}</div><div>${metaCol(right)}</div></div>
        <table>
          <thead><tr><th class="d">Description</th><th class="a">Amount</th></tr></thead>
          <tbody>${body}<tr class="total"><td class="d">${esc(b.totalLabel || "Grand Total")}</td><td class="a">${amt(b.total)}</td></tr></tbody>
        </table>
        ${school.upiQr
          ? `<div class="qr"><img src="${esc(school.upiQr)}" alt="UPI QR" /><div class="qrText">${b.note ? `<div class="note">Note : ${esc(b.note)}</div>` : ""}<span class="pay">Pay on this QR</span></div></div>`
          : b.note ? `<div class="note">Note : ${esc(b.note)}</div>` : ""}
      </div>
    </div>`;
  };

  // Chunk the bills into sheets of `perPage`; each sheet is a grid that breaks.
  const cols = perPage <= 2 ? 1 : 2;
  const pages = [];
  for (let i = 0; i < bills.length; i += perPage) pages.push(bills.slice(i, i + perPage));
  // A single bill must come out the SAME physical size as one card on a full
  // sheet (the office cuts them all to the same slip) — so it keeps the grid
  // and simply sits in the top-left cell instead of being blown up or floated
  // into the middle of the sheet.
  const pagesHtml = pages
    .map((pg) => `<div class="page${bills.length === 1 ? " sparse" : ""}" style="grid-template-columns: repeat(${cols}, 1fr);">${pg.map(billCard).join("")}</div>`)
    .join("");

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Demand Bills (${bills.length})</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #111827; margin: 0; padding: 6mm; background: #f3f4f6; }
  /* Fill the printable A4 height (297mm − 2×10mm top/bottom margin ≈ 277mm) and
     center the rows so the top and bottom whitespace is always equal — for both
     4-per-page and 6-per-page layouts — instead of clustering at the top. */
  .page { display: grid; gap: 6mm; height: 276mm; align-content: center; page-break-after: always; }
  .page:last-child { page-break-after: auto; }
  /* One lone bill: top-left of the sheet, card size unchanged. */
  .page.sparse { align-content: start; }
  .page.sparse .bill { align-self: start; }
  .bill { position: relative; background: #fff; border: 1.5px solid #111827; padding: 10px 14px 12px; overflow: hidden; break-inside: avoid; }
  .wm { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; }
  .wm img { width: 70%; max-width: 200px; opacity: 0.06; filter: grayscale(100%); }
  .content { position: relative; z-index: 1; }
  .phone { text-align: right; font-size: 9px; font-weight: 600; min-height: 11px; }
  .sname { text-align: center; font-size: 15px; font-weight: 800; letter-spacing: .5px; margin: 0; text-transform: uppercase; }
  .addr { text-align: center; font-size: 9px; color: #374151; margin-top: 1px; }
  .btype { text-align: center; font-size: 10px; font-weight: 600; color: #374151; margin: 4px 0 6px; }
  .meta { display: flex; border: 1.2px solid #111827; }
  .meta > div { flex: 1; padding: 4px 6px; }
  .meta > div + div { border-left: 1.2px solid #111827; }
  .mrow { display: flex; gap: 5px; font-size: 9.5px; padding: 1px 0; }
  .mk { flex: 0 0 52px; font-weight: 700; }
  .mv { flex: 1; word-break: break-word; }
  table { width: 100%; border-collapse: collapse; border: 1.2px solid #111827; border-top: 0; }
  th { background: #f3f4f6; font-size: 10px; font-weight: 700; padding: 4px 6px; border-bottom: 1.2px solid #111827; }
  th.d, td.d { text-align: left; border-right: 1.2px solid #111827; }
  th.a, td.a { text-align: right; width: 40%; }
  td { padding: 3px 6px; font-size: 9.5px; }
  tr.total td { border-top: 1.2px solid #111827; font-size: 11.5px; font-weight: 800; padding: 5px 6px; }
  tr.total td.d { text-align: center; }
  .note { font-size: 8.5px; color: #374151; border: 1.2px solid #111827; border-top: 0; padding: 3px 6px; }
  .qr { display: flex; align-items: center; gap: 5px; border: 1.2px solid #111827; border-top: 0; padding: 2px 3px; min-height: 82px; }
  .qr img { width: 78px; height: 78px; object-fit: contain; flex: 0 0 78px; }
  .qr .qrText { display: flex; flex-direction: column; justify-content: center; gap: 4px; min-width: 0; }
  .qr .note { border: 0; padding: 0; font-size: 8.5px; line-height: 1.25; }
  .qr .pay { font-size: 9.5px; font-weight: 700; }
  @page { size: A4 portrait; margin: 10mm 6mm; }
  @media print {
    body { background: #fff; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
  ${pagesHtml}
  <script>
    window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 350); };
  </script>
</body>
</html>`);
  win.document.close();
  return true;
}

/**
 * printCurrentPage — print the page exactly as it looks on screen (the user
 * picks "Save as PDF" in the browser dialog). The region to print must carry
 * the `print-area` class; index.css hides everything else while body has the
 * `printing` class. Long content flows across multiple pages automatically.
 */
export function printCurrentPage() {
  document.body.classList.add("printing");
  const cleanup = () => {
    document.body.classList.remove("printing");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  // Fallback: some browsers skip afterprint when the dialog is cancelled.
  setTimeout(cleanup, 60000);
  window.print();
}

export function printRecord({ title = "Record", subtitle = "", photo = "", sections = [], school = getSchoolName() }) {
  const win = window.open("", "_blank", "width=900,height=1000");
  if (!win) {
    alert("Please allow pop-ups for this site to save as PDF.");
    return false;
  }

  const sectionsHtml = sections
    .map((s) => {
      const rows = (s.rows || []).filter(([, v]) => v !== null && v !== undefined && v !== "");
      if (!rows.length) return "";
      const cells = rows
        .map(([label, value]) => `<tr><td class="l">${esc(label)}</td><td class="v">${esc(value)}</td></tr>`)
        .join("");
      return `<section><h2>${esc(s.heading)}</h2><table>${cells}</table></section>`;
    })
    .join("");

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1e293b; margin: 32px; }
  .school { text-align: center; font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: .3px; margin-bottom: 12px; }
  header { display: flex; align-items: center; gap: 20px; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
  header img { width: 92px; height: 112px; object-fit: cover; border: 1px solid #e2e8f0; border-radius: 8px; }
  header .t { flex: 1; }
  header h1 { font-size: 22px; margin: 0 0 4px; color: #0f172a; }
  header p { margin: 0; color: #64748b; font-size: 13px; }
  section { margin-bottom: 18px; break-inside: avoid; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .5px; color: #2563eb; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin: 0 0 8px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 5px 8px; font-size: 12.5px; vertical-align: top; border-bottom: 1px solid #f1f5f9; }
  td.l { width: 34%; color: #64748b; font-weight: 600; }
  td.v { color: #0f172a; }
  @media print { body { margin: 12mm; } header { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  ${school ? `<div class="school">${esc(school)}</div>` : ""}
  <header>
    ${photo ? `<img src="${esc(photo)}" alt="photo" />` : ""}
    <div class="t">
      <h1>${esc(title)}</h1>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
    </div>
  </header>
  ${sectionsHtml}
  <script>
    window.onload = function () {
      setTimeout(function () { window.focus(); window.print(); }, 250);
    };
  </script>
</body>
</html>`);
  win.document.close();
  return true;
}

/**
 * printTable — open a print-ready tabular report and trigger the print dialog.
 *
 *   printTable({
 *     title: "Demo Class Fee Structure",
 *     subtitle: "Session 2026-2027 · REGULAR",
 *     columns: ["Name", "Fee Type", "Payment Name", "Fee Amount", "Total Payment"],
 *     rows: [["TUITION FEE", "Monthly", "Apr-2026", "Rs. 600", "X 1 = Rs.600"], ...],
 *     footer: "Total Fee Amount: Rs. 8750",
 *   })
 */
export function printTable({ title = "Report", subtitle = "", columns = [], rows = [], footer = "", school = getSchoolName() }) {
  const win = window.open("", "_blank", "width=1000,height=1000");
  if (!win) {
    alert("Please allow pop-ups for this site to save as PDF.");
    return false;
  }

  const head = columns.map((c) => `<th>${esc(c)}</th>`).join("");
  const body = rows
    .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
    .join("");

  win.document.write(`<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Arial, sans-serif; color: #1e293b; margin: 28px; }
  .school { text-align: center; font-size: 19px; font-weight: 800; color: #0f172a; letter-spacing: .3px; margin-bottom: 10px; }
  header { border-bottom: 3px solid #4f46e5; padding-bottom: 12px; margin-bottom: 16px; }
  h1 { font-size: 20px; margin: 0 0 4px; color: #0f172a; }
  header p { margin: 0; color: #64748b; font-size: 12.5px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f1f5f9; text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .4px; color: #475569; padding: 8px 10px; border: 1px solid #e2e8f0; }
  td { padding: 7px 10px; font-size: 12px; border: 1px solid #eef2f7; color: #334155; }
  tr:nth-child(even) td { background: #fafbfc; }
  .footer { margin-top: 16px; font-size: 15px; font-weight: 800; color: #0f172a; text-align: right; }
  @media print { body { margin: 12mm; } th { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
  ${school ? `<div class="school">${esc(school)}</div>` : ""}
  <header>
    <h1>${esc(title)}</h1>
    ${subtitle ? `<p>${esc(subtitle)}</p>` : ""}
  </header>
  <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
  ${footer ? `<div class="footer">${esc(footer)}</div>` : ""}
  <script>
    window.onload = function () { setTimeout(function () { window.focus(); window.print(); }, 250); };
  </script>
</body>
</html>`);
  win.document.close();
  return true;
}
