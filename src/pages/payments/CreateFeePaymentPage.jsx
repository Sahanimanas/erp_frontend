/**
 * Payments → Add Fee Payment (Create Fee Payment)
 * Assign a fee amount that students must pay — Session-wise (all students),
 * Class-wise (all in a class) or a particular student. This adds an EXTRA charge
 * to each selected student's ledger so the system knows how much each owes.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Input } from "../../components/ui";
import { ReceiptText, AlertTriangle } from "lucide-react";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";
import { useGetClassesQuery, useGetAcademicYearsQuery } from "../../redux/api/attendanceApi";
import { useGetFeeTypesQuery } from "../../redux/api/feeMgmtApi";
import { useBulkExtraMutation } from "../../redux/api/paymentsApi";

const MODES = [
  { value: "session", label: "Session Wise Student" },
  { value: "class", label: "Class Wise Student" },
  { value: "particular", label: "Class Wise Particular Student" },
];

export default function CreateFeePaymentPage() {
  usePageTitle("Create Fee Payment");
  const [mode, setMode] = useState("particular");
  const [session, setSession] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [feeTypeId, setFeeTypeId] = useState("");
  const [frequency, setFrequency] = useState("Monthly");
  const [amount, setAmount] = useState("");

  const { data: years = [] } = useGetAcademicYearsQuery();
  const { data: classes = [] } = useGetClassesQuery();
  // Session-wise → all students; class/particular → students of the class.
  const { data: studentList } = useGetStudentsQuery(
    { ...(mode === "session" ? {} : { classId }), limit: 1000 },
    { skip: mode !== "session" && !classId }
  );
  const { data: feeTypes = [] } = useGetFeeTypesQuery(undefined);
  const [bulkExtra, { isLoading }] = useBulkExtraMutation();

  const students = studentList?.data ?? [];

  const onFeeType = (e) => {
    const id = e.target.value;
    setFeeTypeId(id);
    const ft = feeTypes.find((t) => t.id === id);
    if (ft) setFrequency(ft.frequency === "Session" ? "Session" : (ft.frequency === "Monthly" || ft.frequency === "Quarterly") ? "Monthly" : "Other");
  };

  const targetCount = mode === "particular" ? (studentId ? 1 : 0)
    : mode === "class" ? (classId ? students.length : 0)
    : students.length;

  const submit = async () => {
    if (!feeTypeId) { toast.error("Select a fee type"); return; }
    if (!(Number(amount) > 0)) { toast.error("Enter a valid fee amount"); return; }
    const body = { feeTypeId, amount: Number(amount), note: `Added via Add Fee Payment (${frequency})` };
    if (mode === "particular") {
      if (!studentId) { toast.error("Select a student"); return; }
      body.studentIds = [studentId];
    } else if (mode === "class") {
      if (!classId) { toast.error("Select a class"); return; }
      body.classId = classId;
    } else {
      if (!students.length) { toast.error("No students found for this session"); return; }
      body.studentIds = students.map((s) => s.id);
    }
    try {
      const res = await bulkExtra(body).unwrap();
      toast.success(`Fee of ₹${Number(amount)} added to ${res.applied} student(s)`);
      setAmount("");
    } catch (e) { toast.error(e?.data?.error || "Failed to add fee"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create Fee Payment" subtitle="Assign a fee amount students must pay" icon={<ReceiptText size={18} />} />

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
        <AlertTriangle size={16} /> Please select Student or Class details carefully — the fee is added to every matched student.
      </div>

      <Card title="Select Student">
        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-5">
            {MODES.map((m) => (
              <label key={m.value} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="radio" name="mode" checked={mode === m.value} onChange={() => { setMode(m.value); setStudentId(""); }} className="accent-emerald-600" />
                {m.label}
              </label>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select label="Select Session" value={session} onChange={(e) => setSession(e.target.value)}
              options={[{ value: "", label: "Select…" }, ...years.map((y) => ({ value: y.id, label: y.name }))]} />
            {mode !== "session" && (
              <Select label="Select Class" value={classId} onChange={(e) => { setClassId(e.target.value); setStudentId(""); }}
                options={[{ value: "", label: "Select…" }, ...classes.map((c) => ({ value: c.id, label: c.name }))]} />
            )}
            {mode === "particular" && (
              <Select label="Select Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                options={[{ value: "", label: classId ? "Select…" : "Pick a class first" },
                  ...students.map((s) => ({ value: s.id, label: `${s.rollNumber} · ${s.user?.firstName} ${s.user?.lastName}` }))]} />
            )}
          </div>
          {mode !== "particular" && (
            <p className="text-[12px] text-slate-500">This will apply to <b>{targetCount}</b> student(s){mode === "class" && !classId ? " — pick a class" : ""}.</p>
          )}
        </div>
      </Card>

      <Card title="Select Fee Type And Amount">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-4">
            <Select label="Select Fee Type" value={feeTypeId} onChange={onFeeType}
              options={[{ value: "", label: "Select…" }, ...feeTypes.map((t) => ({ value: t.id, label: t.name }))]} />
            <Input label="Fee Amount *" type="number" min="0" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-2">Frequency *</label>
            <div className="flex flex-wrap gap-5">
              {["Monthly", "Session", "Other"].map((f) => (
                <label key={f} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="radio" name="freq" checked={frequency === f} onChange={() => setFrequency(f)} className="accent-emerald-600" />
                  {f}
                </label>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button loading={isLoading} onClick={submit}>Submit</Button>
      </div>
    </div>
  );
}
