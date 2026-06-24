/**
 * Student → Student ID Print
 * Pick a class and one of the templates designed in the ID Card Editor, then
 * print real ID cards for the whole class.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CreditCard as IdCard, Printer, Pencil } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { selectUser } from "../../redux/slices/authSlice";
import { IdCardFace, loadTemplates } from "./_idCardShared";

export default function StudentIdPrintPage() {
  usePageTitle("Student ID Print");
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [classId, setClassId] = useState("");
  const [templates] = useState(() => loadTemplates());
  const [templateId, setTemplateId] = useState(() => loadTemplates()[0]?.id || "");

  const { data: classes = [] } = useGetClassesQuery();
  const { data, isFetching } = useGetStudentsQuery({ classId, limit: 200 }, { skip: !classId });
  const rows = data?.data ?? [];

  const cfg = templates.find((t) => t.id === templateId)?.cfg || null;

  // Group students into fixed pages of 4 so printing never splits a card across sheets.
  const pages = [];
  for (let i = 0; i < rows.length; i += 4) pages.push(rows.slice(i, i + 4));

  // No templates designed yet → point the admin to the editor.
  if (!templates.length) {
    return (
      <div className="space-y-4">
        <PageHeader title="Student ID Print" subtitle="Generate printable student ID cards" icon={<IdCard size={18} />} />
        <EmptyState icon="🪪" title="No ID card templates yet"
          description="Design a template in the ID Card Editor first — it will appear here for printing."
          action={<Button icon={<Pencil size={14} />} onClick={() => navigate("/students/id-editor")}>Open ID Card Editor</Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>{`
        /* Keep background colors/images (header, footer, accents, watermark, barcode)
           when printing — browsers strip them by default. */
        .id-page, .id-page * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @media print {
          /* Zero page margin makes browsers drop their auto date/title/URL/page-number
             headers & footers — then we re-add breathing room via padding below. */
          @page { size: A4; margin: 0; }
          /* Hide the app shell (dark topbar + sidebar) and the on-page controls so
             only the ID cards print. */
          header, aside, .no-print { display:none !important; }
          body { background:#fff; margin:0 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          /* Each group is exactly one A4 sheet (4 cards, 2×2) with a hard break after it,
             so no card ever bleeds onto the next page. */
          .id-page {
            height:100vh !important; box-sizing:border-box !important; overflow:hidden !important;
            padding:10mm !important; gap:10mm !important;
            justify-content:center !important; align-content:flex-start !important;
            break-after:page !important; page-break-after:always !important;
            break-inside:avoid !important; page-break-inside:avoid !important;
          }
          .id-page:last-child { break-after:auto !important; page-break-after:auto !important; }
        }
      `}</style>
      <div className="no-print">
        <PageHeader title="Student ID Print" subtitle="Generate printable student ID cards" icon={<IdCard size={18} />}>
          <Button icon={<Printer size={14} />} disabled={!rows.length} onClick={() => window.print()}>Print</Button>
        </PageHeader>

        <Card title="Choose Class & Template">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
                options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Templates (from ID Card Editor)</p>
                <button className="text-[11px] font-semibold text-indigo-600 hover:underline" onClick={() => navigate("/students/id-editor")}>+ New template</button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {templates.map((t) => (
                  <button key={t.id} onClick={() => setTemplateId(t.id)}
                    className={`rounded-xl border-2 p-2 transition-all text-left ${templateId === t.id ? "border-indigo-500" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="h-8 rounded-md mb-1 overflow-hidden flex flex-col">
                      <div className="flex-1" style={{ backgroundColor: t.cfg?.headerColor }} />
                      <div className="h-2" style={{ backgroundColor: t.cfg?.footerColor }} />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 truncate">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {!classId ? (
        <EmptyState icon="🪪" title="Pick a class" description="Select a class to generate ID cards." />
      ) : isFetching ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon="🪪" title="No students" description="No students in this class." />
      ) : (
        <div className="space-y-3">
          {pages.map((pg, i) => (
            <div key={i} className="id-page flex flex-wrap justify-center content-start gap-3">
              {pg.map((r) => <IdCardFace key={r.id} cfg={cfg} student={r} face="front" logo={user?.schoolLogo} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
