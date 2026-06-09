/**
 * _payShared.jsx — shared Payments UI: the bulk discount / extra-fee applier.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader, Card, Button, Select, Input } from "../../components/ui";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetFeeTypesQuery } from "../../redux/api/feeMgmtApi";

export function BulkFeeApply({ title, subtitle, icon, amountLabel, mutation, actionLabel }) {
  const [classId, setClassId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const { data: classes = [] } = useGetClassesQuery();
  const { data: feeTypes = [] } = useGetFeeTypesQuery(undefined);
  const [apply, { isLoading }] = mutation();

  const submit = async () => {
    if (!classId) { toast.error("Select a class"); return; }
    if (!feeTypeId) { toast.error("Select a fee type"); return; }
    if (!(Number(amount) > 0)) { toast.error("Enter an amount"); return; }
    try {
      const res = await apply({ classId, feeTypeId, amount: Number(amount), note }).unwrap();
      toast.success(`${actionLabel} applied to ${res.applied} student(s)`);
      setAmount(""); setNote("");
    } catch (e) { toast.error(e?.data?.error || "Failed to apply"); }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      <Card title="Select Student (class-wise)">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Class" value={classId} onChange={(e) => setClassId(e.target.value)}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
        </div>
      </Card>
      <Card title={`Select Fee Type And ${amountLabel}`}>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Fee Type" value={feeTypeId} onChange={(e) => setFeeTypeId(e.target.value)}
            options={[{ value: "", label: "Select…" }, ...feeTypes.map((t) => ({ value: t.id, label: t.name }))]} />
          <Input label={amountLabel} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input label="Note (optional)" value={note} onChange={(e) => setNote(e.target.value)} className="md:col-span-2" />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button loading={isLoading} onClick={submit}>{actionLabel}</Button>
        </div>
      </Card>
      <p className="text-[11px] text-amber-600">⚠ Applies to every student in the selected class. This cannot be reverted automatically.</p>
    </div>
  );
}
