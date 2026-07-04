/**
 * Exam Management → Setup Exam Grading
 * School-wide grade bands (A+/A/B…) with % ranges; used to grade exam results.
 */
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, EmptyState, Skeleton } from "../../components/ui";
import { Award, Plus, Save, Trash2 } from "lucide-react";
import { useGetGradesQuery, useSaveGradesMutation, useDeleteGradeMutation } from "../../redux/api/examMgmtApi";

const NEW_ROW = { id: null, grade: "", minPercent: 0, maxPercent: 0, gradePoint: "", remarks: "" };

export default function SetupExamGradingPage() {
  usePageTitle("Setup Exam Grading");
  const { data: grades = [], isFetching } = useGetGradesQuery();
  const [saveGrades, { isLoading: saving }] = useSaveGradesMutation();
  const [deleteGrade] = useDeleteGradeMutation();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    setRows(grades.map((g) => ({ id: g.id, grade: g.grade, minPercent: g.minPercent, maxPercent: g.maxPercent, gradePoint: g.gradePoint ?? "", remarks: g.remarks ?? "" })));
  }, [grades]);

  const set = (i, patch) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));

  const submit = async () => {
    const items = rows.filter((r) => r.grade.trim());
    if (!items.length) { toast.error("Add at least one grade row"); return; }
    for (const r of items) {
      if (Number(r.minPercent) > Number(r.maxPercent)) {
        toast.error(`Grade ${r.grade}: Percent From must be ≤ Percent Upto`);
        return;
      }
    }
    try {
      const res = await saveGrades(items).unwrap();
      toast.success(`Saved ${res.saved} grade(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save grading"); }
  };

  const remove = async (i) => {
    const row = rows[i];
    if (!row.id) { setRows((r) => r.filter((_, idx) => idx !== i)); return; }
    if (!confirm(`Delete grade "${row.grade}"?`)) return;
    try { await deleteGrade(row.id).unwrap(); toast.success("Grade deleted"); }
    catch (e) { toast.error(e?.data?.error || "Failed to delete grade"); }
  };

  const cell = "px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400";

  return (
    <div className="space-y-4">
      <PageHeader title="Setup Exam Grading" subtitle="Define grade bands used for exam results" icon={<Award size={18} />}>
        <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => setRows((r) => [...r, { ...NEW_ROW }])}>Add Grade</Button>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} disabled={!rows.length} onClick={submit}>Save Grading</Button>
      </PageHeader>

      <Card noPadding title="Grade Scale">
        {isFetching ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="🏅" title="No grades configured" description='Click "Add Grade" to define bands like A+ (91–100), A (81–90)…' />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[680px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Grade", "Percent From (%)", "Percent Upto (%)", "Grade Point", "Remarks", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r, i) => (
                  <tr key={r.id ?? `new-${i}`} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2"><input value={r.grade} onChange={(e) => set(i, { grade: e.target.value })} placeholder="A+" className={`${cell} w-20 font-semibold`} /></td>
                    <td className="px-4 py-2"><input type="number" min="0" max="100" value={r.minPercent} onChange={(e) => set(i, { minPercent: e.target.value })} className={`${cell} w-24`} /></td>
                    <td className="px-4 py-2"><input type="number" min="0" max="100" value={r.maxPercent} onChange={(e) => set(i, { maxPercent: e.target.value })} className={`${cell} w-24`} /></td>
                    <td className="px-4 py-2"><input type="number" step="0.1" value={r.gradePoint} onChange={(e) => set(i, { gradePoint: e.target.value })} placeholder="10" className={`${cell} w-20`} /></td>
                    <td className="px-4 py-2"><input value={r.remarks} onChange={(e) => set(i, { remarks: e.target.value })} placeholder="Outstanding" className={`${cell} w-full min-w-[160px]`} /></td>
                    <td className="px-4 py-2"><button title="Delete" onClick={() => remove(i)} className="p-1.5 rounded-md hover:bg-red-50 text-red-500"><Trash2 size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
