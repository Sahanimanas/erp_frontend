/**
 * Employee Leave → Add Leave  ("Add/Approve Employee Leave")
 *
 * Admin books leave on behalf of an employee, then sees that employee's
 * entitlement summary and full transaction history with approve/cancel actions.
 *   POST  /employees/:employeeId/leaves
 *   GET   /employees/:employeeId/leave-summary
 *   GET   /employees/:employeeId/leaves
 *   PATCH /employees/:employeeId/leaves/:leaveId/{approve|cancel}
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Select, Input, Textarea, Button, ExportButton } from "../../../components/ui";
import { CalendarPlus, Save } from "lucide-react";
import apiClient from "../../../services/axios";
import {
  EmployeeInfoCard, LeaveAssignedDetails, LeaveTransactions,
  empOptions, dayCount, leaveExportColumns,
} from "./shared";

const BLANK = { leaveTypeId: "", startDate: "", endDate: "", reason: "" };

export default function AddLeavePage() {
  usePageTitle("Add Leave");
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [form, setForm] = useState(BLANK);
  const [summary, setSummary] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [emp, types] = await Promise.all([
          apiClient.get("/employees?limit=500"),
          apiClient.get("/employees/leave-types?enabled=true"),
        ]);
        if (emp.data.success) setEmployees(emp.data.data || []);
        if (types.data.success) setLeaveTypes(types.data.data || []);
      } catch (e) {
        toast.error(e.response?.data?.error || "Failed to load reference data");
      }
    })();
  }, []);

  const load = useCallback(async () => {
    if (!employeeId) { setSummary([]); setLeaves([]); return; }
    setLoading(true);
    try {
      const [sum, txn] = await Promise.all([
        apiClient.get(`/employees/${employeeId}/leave-summary`),
        apiClient.get(`/employees/${employeeId}/leaves`),
      ]);
      if (sum.data.success) setSummary(sum.data.data || []);
      if (txn.data.success) setLeaves(txn.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load leave details");
    } finally { setLoading(false); }
  }, [employeeId]);
  useEffect(() => { load(); }, [load]);

  const employee = employees.find((e) => e.id === employeeId);
  const days = dayCount(form.startDate, form.endDate);

  const submit = async () => {
    if (!employeeId) return toast.error("Select an employee");
    if (!form.leaveTypeId) return toast.error("Select a leave type");
    if (!form.startDate || !form.endDate) return toast.error("Select the leave dates");
    if (days === 0) return toast.error("To Date cannot be before From Date");

    setSaving(true);
    try {
      await apiClient.post(`/employees/${employeeId}/leaves`, {
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim() || "Added by admin",
      });
      toast.success("Leave added");
      setForm(BLANK);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to add leave");
    } finally { setSaving(false); }
  };

  const act = async (leave, action) => {
    const remarks = action === "cancel" ? window.prompt("Remarks (optional):") ?? "" : undefined;
    setBusyId(leave.id);
    try {
      await apiClient.patch(`/employees/${employeeId}/leaves/${leave.id}/${action}`, action === "cancel" ? { remarks } : {});
      toast.success(action === "approve" ? "Leave approved" : "Leave cancelled");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || `Failed to ${action} leave`);
    } finally { setBusyId(""); }
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Add/Approve Employee Leave" subtitle="Book leave for a staff member" icon={<CalendarPlus size={18} />} />

      <Card title="Add Employee Leave">
        <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          <Select label="Select Employee *" value={employeeId} options={empOptions(employees)}
            onChange={(e) => setEmployeeId(e.target.value)} />

          <Select label="Leave Type *" value={form.leaveTypeId}
            options={[{ value: "", label: "Select..." }, ...leaveTypes.map((t) => ({
              value: t.id, label: `${t.name}${t.maxDays > 0 ? ` (${t.maxDays})` : ""}`,
            }))]}
            onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="From Date *" type="date" value={form.startDate}
              onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
            <Input label="To Date *" type="date" value={form.endDate} min={form.startDate || undefined}
              onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          </div>

          <Textarea label="Reason" rows={2} value={form.reason}
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />

          {days > 0 && <p className="text-[12px] font-semibold text-slate-600 lg:col-span-2">{days} day(s) selected</p>}
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button icon={<Save size={14} />} loading={saving} onClick={submit}>Submit</Button>
        </div>
      </Card>

      {employee && <Card><EmployeeInfoCard employee={employee} /></Card>}

      {employeeId && (
        <>
          <Card noPadding title="Leave Assigned Details">
            <LeaveAssignedDetails rows={summary} loading={loading} />
          </Card>

          <Card noPadding title="Leave Transactions" subtitle={`${leaves.length} record(s)`}
            action={<ExportButton filename="leave-transactions.csv" rows={leaves} columns={leaveExportColumns(false)} />}>
            <LeaveTransactions rows={leaves} loading={loading} onAction={act} busyId={busyId}
              emptyText="No leave transactions for this employee." />
          </Card>
        </>
      )}
    </div>
  );
}
