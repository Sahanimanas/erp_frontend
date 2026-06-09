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

export function printRecord({ title = "Record", subtitle = "", photo = "", sections = [] }) {
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
