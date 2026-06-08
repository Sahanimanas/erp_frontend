/**
 * Payments → Create Fee Payment
 * Ad-hoc payment: pick a student (class-wise) + fee type + amount → record it.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input, Badge } from "../../components/ui";
import { ReceiptText } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery } from "../../redux/api/attendanceApi";
import { useGetFeeTypesQuery } from "../../redux/api/feeMgmtApi";
import { useCollectPaymentMutation } from "../../redux/api/paymentsApi";

export default function CreateFeePaymentPage() {
  usePageTitle("Create Fee Payment");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("CASH");
  const [last, setLast] = useState(null);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: studentList } = useGetStudentsQuery({ classId, limit: 200 }, { skip: !classId });
  const { data: feeTypes = [] } = useGetFeeTypesQuery(undefined);
  const [collect, { isLoading }] = useCollectPaymentMutation();

  const students = studentList?.data ?? [];

  const submit = async () => {
    if (!studentId) { toast.error("Select a student"); return; }
    if (!feeTypeId || !(Number(amount) > 0)) { toast.error("Select fee type and amount"); return; }
    const ft = feeTypes.find((t) => t.id === feeTypeId);
    try {
      const res = await collect({ studentId, mode, lines: [{ feeTypeId, name: ft?.name, amount: Number(amount) }] }).unwrap();
      setLast(res.receiptNo);
      toast.success(`Payment recorded — ${res.receiptNo}`);
      setAmount("");
    } catch (e) { toast.error(e?.data?.error || "Payment failed"); }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <PageHeader title="Create Fee Payment" subtitle="Record a payment for a student" icon={<ReceiptText size={18} />} />
      {last && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2">Last receipt: <b>{last}</b></div>}
      <Card title="Select Student">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}
            options={[{ value: "", label: "Select Class" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
          <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
            options={[{ value: "", label: classId ? "Select Student" : "Pick a class first" },
              ...students.map((s) => ({ value: s.id, label: `${s.rollNumber} · ${s.user?.firstName} ${s.user?.lastName}` }))]} />
        </div>
      </Card>
      <Card title="Select Fee Type And Amount">
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Fee Type" value={feeTypeId} onChange={(e) => setFeeTypeId(e.target.value)}
            options={[{ value: "", label: "Select…" }, ...feeTypes.map((t) => ({ value: t.id, label: t.name }))]} />
          <Input label="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Select label="Mode" value={mode} onChange={(e) => setMode(e.target.value)}
            options={["CASH", "ONLINE", "CHEQUE", "BANK"].map((m) => ({ value: m, label: m }))} />
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button loading={isLoading} onClick={submit}>Submit</Button>
        </div>
      </Card>
    </div>
  );
}
