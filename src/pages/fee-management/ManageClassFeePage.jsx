/**
 * Fee Management → Manage Class Fee
 * For a class, enable fee types and set their amounts → saves the fee structure.
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge, EmptyState, Skeleton } from "../../components/ui";
import { Wallet, Save } from "lucide-react";
import { useGetClassStructureQuery, useSaveClassStructureMutation } from "../../redux/api/feeMgmtApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";

export default function ManageClassFeePage() {
  usePageTitle("Manage Class Fee");
  const [session, setSession] = useState("");
  const [feePlan, setFeePlan] = useState("REGULAR");
  const [classId, setClassId] = useState("");
  const [rowsState, setRowsState] = useState({}); // feeTypeId -> { amount, enabled }

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  const { data: rows = [], isFetching } = useGetClassStructureQuery({ classId, includeTransport: true, academicYearId: session }, { skip: !classId || !session });
  const [save, { isLoading }] = useSaveClassStructureMutation();

  useEffect(() => {
    const seed = {};
    rows.forEach((r) => { seed[r.feeTypeId] = { amount: r.amount || 0, enabled: r.enabled }; });
    setRowsState(seed);
  }, [rows]);

  const set = (id, patch) => setRowsState((s) => ({ ...s, [id]: { ...s[id], ...patch } }));

  const submit = async () => {
    if (!session) { toast.error("Select a session first"); return; }
    const items = rows.map((r) => ({ feeTypeId: r.feeTypeId, ...rowsState[r.feeTypeId] }));
    try {
      const res = await save({ classId, items, academicYearId: session }).unwrap();
      toast.success(`Saved ${res.saved} fee row(s)`);
    } catch (e) { toast.error(e?.data?.error || "Failed to save"); }
  };

  const className = classes.find((c) => c.id === classId)?.name;

  return (
    <div className="space-y-4">
      <PageHeader title="Manage Class Fee" subtitle="Set fee amounts per class" icon={<Wallet size={18} />}>
        <Button variant="success" icon={<Save size={14} />} loading={isLoading} disabled={!classId || !session || !rows.length} onClick={submit}>Save Fee Structure</Button>
      </PageHeader>

      <Card title="Search Course Fee">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Session" value={session} onChange={(e) => setSession(e.target.value)}
            options={[{ value: "", label: "Select" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
          <Select label="Fee Plan" value={feePlan} onChange={(e) => setFeePlan(e.target.value)}
            options={["REGULAR", "PROMOTION", "FREE_ADMISSION"].map((p) => ({ value: p, label: p }))} />
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>

      <Card noPadding title={className ? `${className} Class Fee List Structure` : "Class Fee List Structure"}>
        {!session || !classId ? (
          <EmptyState icon="💰" title="Pick session & class" description="Select a session and class to configure its fee structure." />
        ) : isFetching ? (
          <div className="p-4 space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="💰" title="No fee types" description="Create fee types first under Class/Transport Fee Type." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Name", "Fee Type Active", "Fee Amount Enabled", "Frequency", "Month Name", "Fee Amount"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((r) => {
                  const st = rowsState[r.feeTypeId] || {};
                  return (
                    <tr key={r.feeTypeId} className="hover:bg-slate-50/70">
                      <td className="px-4 py-2.5 font-semibold text-slate-800 text-[12.5px]">{r.name}</td>
                      <td className="px-4 py-2.5"><Badge variant={r.feeTypeActive ? "success" : "default"}>{r.feeTypeActive ? "Yes" : "No"}</Badge></td>
                      <td className="px-4 py-2.5">
                        <input type="checkbox" checked={!!st.enabled} onChange={(e) => set(r.feeTypeId, { enabled: e.target.checked })} className="accent-indigo-600 w-4 h-4" />
                      </td>
                      <td className="px-4 py-2.5 text-slate-600 text-[12px]">{r.frequency}</td>
                      <td className="px-4 py-2.5 text-slate-500 text-[11px] max-w-[260px]">{["Monthly", "Quarterly"].includes(r.frequency) ? (r.months?.join(", ") || "—") : "Only Once"}</td>
                      <td className="px-4 py-2.5">
                        <input type="number" min="0" value={st.amount ?? 0} onChange={(e) => set(r.feeTypeId, { amount: e.target.value })}
                          className="w-28 px-2 py-1 text-[12px] border border-slate-200 rounded-md focus:outline-none focus:border-indigo-400" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
