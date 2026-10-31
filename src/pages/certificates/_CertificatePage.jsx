/**
 * One page for each certificate type (School Leaving, Bonafide), in the
 * school's familiar shape: "Search Student For Certificate" — Session, Class,
 * Student — then the certificate's fields, prefilled from the student's
 * records for the clerk to check, and Submit, which issues and prints it.
 * Below, every certificate already issued, to reprint or remove.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Award, Eye, Printer, Trash2, AlertTriangle } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Modal, SearchInput, ExportButton } from "../../components/ui";
import { useGetAcademicYearsQuery, useGetClassesQuery } from "../../redux/api/attendanceApi";
import {
  useGetCertificateStudentsQuery, useGetCertificatePrefillQuery, useGetCertificatesQuery,
  useIssueCertificateMutation, useDeleteCertificateMutation,
} from "../../redux/api/certificatesApi";
import { CertificatePreview, printCertificate, dmy } from "./_print";

/** The fields of each certificate, in the order of the paper form. */
const FORMS = {
  SCHOOL_LEAVING: {
    title: "School Leaving Certificate",
    listTitle: "Issued School Leaving Certificates",
    fields: [
      { key: "referenceNo", label: "Reference No", required: true },
      { key: "enrollmentNo", label: "Enrollment Number", required: true },
      { key: "penNo", label: "PEN Number", required: true },
      { key: "apaarNo", label: "AAPAR Number", required: true },
      { key: "guardianRelation", label: "Guardian Relation" },
      { key: "qualifiedFor", label: "Candidate Qualified For Higher Classes", required: true },
      { key: "admissionDate", label: "Admission Date", required: true, type: "date" },
      { key: "leavingDate", label: "Leaving Date", required: true, type: "date" },
      { key: "totalWorkingDays", label: "Total Working Days", type: "number" },
      { key: "totalPresent", label: "Total Present", type: "number" },
      { key: "extraActivity", label: "Extra Activity(If Any)" },
      { key: "character", label: "Candidate Character", required: true },
      { key: "leavingReason", label: "Leaving Reason" },
      { key: "dueAmount", label: "Due Amount(If any)", type: "number" },
    ],
    extraColumn: { label: "Leaving Date", value: (c) => dmy(c.data?.fields?.leavingDate) },
  },
  BONAFIDE: {
    title: "Student Bonafide Certificate",
    listTitle: "Issued Bonafide Certificates",
    fields: [
      { key: "referenceNo", label: "Reference No", required: true },
      { key: "enrollmentNo", label: "Enrollment Number" },
      { key: "purpose", label: "Purpose", required: true, placeholder: "e.g. bank account, scholarship" },
      { key: "character", label: "Character & Conduct" },
    ],
    extraColumn: { label: "Purpose", value: (c) => c.data?.fields?.purpose || "" },
  },
};

const todayYmd = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
/** What the print needs, from an issued certificate. */
const printable = (c) => ({
  school: c.data?.school, student: c.data?.student, fields: c.data?.fields, referenceNo: c.referenceNo, issueDate: c.issueDate,
});

export default function CertificatePage({ type }) {
  const cfg = FORMS[type];
  usePageTitle(cfg.title);

  // ── Search student ─────────────────────────────────────────────────────────
  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  useEffect(() => {
    if (!sessionId && years.length) setSessionId((years.find((y) => y.isActive) || years[0]).id);
  }, [years, sessionId]);
  const sessionClasses = useMemo(
    () => classes.filter((c) => !sessionId || !c.academicYearId || c.academicYearId === sessionId),
    [classes, sessionId]
  );
  const { data: students = [], isFetching: studentsLoading } = useGetCertificateStudentsQuery(classId, { skip: !classId });

  // ── Form, prefilled from the student's records ─────────────────────────────
  const { data: prefill, isFetching: prefilling } = useGetCertificatePrefillQuery({ type, studentId }, { skip: !studentId });
  const blank = useMemo(() => Object.fromEntries(cfg.fields.map((f) => [f.key, ""])), [cfg]);
  const [form, setForm] = useState(blank);
  useEffect(() => {
    setForm(studentId && prefill ? { ...blank, ...prefill.fields } : blank);
  }, [prefill, studentId, blank]);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const ready = Boolean(studentId && prefill && !prefilling);

  const [issue, { isLoading: issuing }] = useIssueCertificateMutation();
  const [remove] = useDeleteCertificateMutation();
  const [preview, setPreview] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    try {
      const c = await issue({ type, studentId, fields: form }).unwrap();
      toast.success(`${cfg.title} ${c.referenceNo} issued`);
      printCertificate(type, printable(c));
    } catch (err) {
      toast.error(err?.data?.error || "Could not issue the certificate");
    }
  };
  const showPreview = () =>
    setPreview({ school: prefill.school, student: prefill.student, fields: form, referenceNo: form.referenceNo, issueDate: todayYmd(), draft: true });

  // ── Issued list ────────────────────────────────────────────────────────────
  const { data: issued = [], isFetching: listLoading } = useGetCertificatesQuery(type);
  const [q, setQ] = useState("");
  const rows = issued.filter((c) => {
    const n = q.trim().toLowerCase();
    return !n || [c.referenceNo, c.studentName, c.className].some((v) => String(v || "").toLowerCase().includes(n));
  });
  const del = async (c) => {
    if (!window.confirm(`Remove certificate ${c.referenceNo} of ${c.studentName}?\nIts reference number will not be given out again.`)) return;
    try {
      await remove(c.id).unwrap();
      toast.success("Certificate removed");
    } catch (err) {
      toast.error(err?.data?.error || "Could not remove");
    }
  };

  const studentLabel = (s) => `${s.name}${s.rollNumber ? ` — Roll ${s.rollNumber}` : ""}${s.section ? ` (${s.section})` : ""}${s.isActive ? "" : " · Left"}`;

  return (
    <div>
      <PageHeader title={cfg.title} subtitle="Search the student, check the details, submit and print" icon={<Award />} />

      <Card title="Search Student For Certificate">
        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select label="Session" value={sessionId}
              onChange={(e) => { setSessionId(e.target.value); setClassId(""); setStudentId(""); }}
              options={[{ value: "", label: "Select..." }, ...years.map((y) => ({ value: y.id, label: `${y.name}${y.isActive ? " (Active)" : ""}` }))]} />
            <Select label="Class" value={classId}
              onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}
              options={[{ value: "", label: "Select..." }, ...sessionClasses.map((c) => ({ value: c.id, label: c.name }))]} />
            <div className="sm:col-span-2">
              <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)} disabled={!classId}
                options={[
                  { value: "", label: !classId ? "Select class first" : studentsLoading ? "Loading…" : students.length ? "Select..." : "No students in this class" },
                  ...students.map((s) => ({ value: s.id, label: studentLabel(s) })),
                ]} />
            </div>
          </div>

          {prefill?.existing?.length > 0 && studentId && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-[13px] bg-amber-50 border border-amber-200 text-amber-900"
                 style={{ borderRadius: "var(--erp-radius)" }}>
              <AlertTriangle size={15} className="shrink-0" />
              Already issued to this student: {prefill.existing.map((x) => `${x.referenceNo} (${dmy(x.issueDate)})`).join(", ")}.
              Submitting again issues another certificate.
            </div>
          )}

          {/* items-end: a label that wraps to two lines keeps its box level with the row. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {cfg.fields.map((f) => (
              <Input key={f.key} label={f.label} required={f.required} type={f.type || "text"} min={f.type === "number" ? 0 : undefined}
                value={form[f.key] ?? ""} onChange={set(f.key)} disabled={!ready} placeholder={f.placeholder} />
            ))}
          </div>

          {studentId && prefilling && <p className="text-[13px] text-slate-600">Filling in the student's details…</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" icon={<Eye size={14} />} onClick={showPreview} disabled={!ready}>Preview</Button>
            <Button type="submit" loading={issuing} disabled={!ready}>Submit</Button>
          </div>
        </form>
      </Card>

      <Card className="mt-4" title={cfg.listTitle}
        action={
          <div className="flex items-center gap-2">
            <SearchInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" />
            <ExportButton filename={`${type.toLowerCase()}-certificates.csv`} rows={rows}
              columns={[
                { label: "Reference No", get: (c) => c.referenceNo }, { label: "Student", get: (c) => c.studentName },
                { label: "Class", get: (c) => c.className }, { label: "Session", get: (c) => c.session },
                { label: cfg.extraColumn.label, get: cfg.extraColumn.value }, { label: "Issue Date", get: (c) => dmy(c.issueDate) },
                { label: "Issued By", get: (c) => c.issuedBy },
              ]} />
          </div>
        }
        noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[820px]">
            <thead>
              <tr>
                {["Sl", "Reference No", "Student", "Class", "Session", cfg.extraColumn.label, "Issue Date", "Issued By", "Action"].map((h) => (
                  <th key={h} className="px-4 py-2.5 text-left">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((c, i) => (
                <tr key={c.id}>
                  <td className="px-4">{i + 1}</td>
                  <td className="px-4 font-semibold whitespace-nowrap">{c.referenceNo}</td>
                  <td className="px-4">{c.studentName}</td>
                  <td className="px-4">{c.className}</td>
                  <td className="px-4">{c.session}</td>
                  <td className="px-4">{cfg.extraColumn.value(c)}</td>
                  <td className="px-4 whitespace-nowrap">{dmy(c.issueDate)}</td>
                  <td className="px-4">{c.issuedBy || "—"}</td>
                  <td className="px-4">
                    <div className="flex gap-1.5">
                      <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={() => printCertificate(type, printable(c))}>Print</Button>
                      <Button size="sm" variant="secondary" icon={<Eye size={13} />} onClick={() => setPreview(printable(c))} aria-label={`View ${c.referenceNo}`} />
                      <Button size="sm" variant="danger" icon={<Trash2 size={13} />} onClick={() => del(c)} aria-label={`Remove ${c.referenceNo}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!listLoading && rows.length === 0 && (
            <p className="px-4 py-10 text-center text-[14px] text-slate-600">{issued.length ? "No certificate matches your search." : "No certificate issued yet."}</p>
          )}
        </div>
      </Card>

      <Modal open={!!preview} onClose={() => setPreview(null)} title={`${cfg.title}${preview?.referenceNo ? ` — ${preview.referenceNo}` : ""}`} size="lg">
        {preview && (
          <>
            <CertificatePreview type={type} cert={preview} />
            <div className="mt-4 flex items-center justify-end gap-3">
              {preview.draft ? (
                // Only an issued certificate prints, so every printed copy is in the register.
                <p className="text-[13px] text-slate-600">This is a preview — close it and press Submit to issue and print.</p>
              ) : (
                <Button icon={<Printer size={14} />} onClick={() => printCertificate(type, preview)}>Print</Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
