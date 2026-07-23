/**
 * Class Management → Add Class Details
 * Per-year (Year 1..N, where N = class "No. of Session") detail: name, code,
 * max internal exams, best-of count, elective subject count.
 */
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, EmptyState, Skeleton } from "../../components/ui";
import { Layers, Save } from "lucide-react";
import { useCmGetSessionsQuery, useCmGetClassesQuery, useCmGetClassDetailsQuery, useCmSaveClassDetailsMutation } from "../../redux/api/classMgmtApi";
import { sortClasses } from "./_cmShared";

const numOpts = (n) => Array.from({ length: n }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));

export default function AddClassDetailsPage() {
  usePageTitle("Add Class Details");
  const [academicYearId, setYear] = useState("");
  const [classId, setClassId] = useState("");
  const [rows, setRows] = useState([]); // per-year form

  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: classes = [] } = useCmGetClassesQuery(academicYearId || undefined);
  const { data: cd, isFetching } = useCmGetClassDetailsQuery(classId, { skip: !classId });
  const [save, { isLoading: saving }] = useCmSaveClassDetailsMutation();

  const years = cd?.class?.noOfSessions || 1;
  useEffect(() => {
    if (!cd) { setRows([]); return; }
    const byIdx = new Map((cd.details || []).map((d) => [d.yearIndex, d]));
    setRows(Array.from({ length: cd.class.noOfSessions || 1 }, (_, i) => {
      const d = byIdx.get(i + 1) || {};
      return {
        yearIndex: i + 1,
        name: d.name ?? cd.class.name ?? "",
        classCode: d.classCode ?? cd.class.classCode ?? "",
        maxInternalExam: d.maxInternalExam ?? "",
        bestInternalExamCount: d.bestInternalExamCount ?? "",
        noOfElectiveSubject: d.noOfElectiveSubject ?? "",
        enabled: d.enabled ?? true,
      };
    }));
  }, [cd]);

  const setRow = (i, patch) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = async () => {
    try { await save({ classId, details: rows }).unwrap(); toast.success("Class details saved"); }
    catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  const maxExam = useMemo(() => numOpts(10), []);
  const ready = !!classId;

  return (
    <div className="space-y-4">
      <PageHeader title="Add Class Details" subtitle="Per-year exam & elective configuration" icon={<Layers size={18} />}>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!ready} onClick={submit}>Submit</Button>
      </PageHeader>

      <Card noPadding>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          <Select label="Select Session" value={academicYearId} onChange={(e) => { setYear(e.target.value); setClassId(""); }}
            options={[{ value: "", label: "Active session" }, ...sessions.map((s) => ({ value: s.id, label: s.name }))]} />
          <Select label="Select Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select..." }, ...sortClasses(classes).map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>

      {!ready ? (
        <Card noPadding><EmptyState icon="🧩" title="Pick a class" description="Select a class to configure its per-year details." /></Card>
      ) : isFetching ? (
        <Card><div className="space-y-2">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div></Card>
      ) : (
        rows.map((row, i) => (
          <Card key={i} title={`Year ${row.yearIndex}`}>
            <div className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input label="Name" value={row.name} onChange={(e) => setRow(i, { name: e.target.value })} />
              <Input label="Class Code" value={row.classCode} onChange={(e) => setRow(i, { classCode: e.target.value })} />
              <Select label="Max Internal Exam" value={String(row.maxInternalExam || "")} onChange={(e) => setRow(i, { maxInternalExam: e.target.value })}
                options={[{ value: "", label: "Select..." }, ...maxExam]} />
              <Select label="Best Internal Exam Select Count" value={String(row.bestInternalExamCount || "")} onChange={(e) => setRow(i, { bestInternalExamCount: e.target.value })}
                options={[{ value: "", label: "Select..." }, ...maxExam]} />
              <Select label="No of Elective Subject" value={String(row.noOfElectiveSubject || "")} onChange={(e) => setRow(i, { noOfElectiveSubject: e.target.value })}
                options={[{ value: "", label: "Select..." }, ...numOpts(10)]} />
              <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none mt-6"><input type="checkbox" checked={row.enabled} onChange={(e) => setRow(i, { enabled: e.target.checked })} className="w-4 h-4 accent-emerald-600" /> Enabled</label>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
