/**
 * Employee Leave → Apply Leave  (self-service)
 *
 * The signed-in staff member applies for their own leave — no employee picker,
 * the server resolves the applicant from the token.
 *   GET/POST /employees/me/leaves, GET /employees/me/leave-summary
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Select, Input, Textarea, Button } from "../../../components/ui";
import { CalendarClock, Save, AlertCircle } from "lucide-react";
import apiClient from "../../../services/axios";
import { LeaveAssignedDetails, LeaveTransactions, dayCount } from "./shared";

const BLANK = { leaveTypeId: "", startDate: "", endDate: "", reason: "" };

export default function ApplyLeavePage() {
  usePageTitle("Apply Leave");
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [summary, setSummary] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // Set when the login has no Employee record — the page can't work then.
  const [noProfile, setNoProfile] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const types = await apiClient.get("/employees/leave-types?enabled=true");
      if (types.data.success) setLeaveTypes(types.data.data || []);

      const [sum, txn] = await Promise.all([
        apiClient.get("/employees/me/leave-summary"),
        apiClient.get("/employees/me/leaves"),
      ]);
      if (sum.data.success) setSummary(sum.data.data || []);
      if (txn.data.success) setLeaves(txn.data.data || []);
      setNoProfile("");
    } catch (e) {
      const msg = e.response?.data?.error || "Failed to load your leave details";
      if (e.response?.status === 404) setNoProfile(msg);
      else toast.error(msg);
    } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const days = dayCount(form.startDate, form.endDate);

  const submit = async () => {
    if (!form.leaveTypeId) return toast.error("Select a leave type");
    if (!form.startDate || !form.endDate) return toast.error("Select the leave dates");
    if (days === 0) return toast.error("To Date cannot be before From Date");

    setSaving(true);
    try {
      await apiClient.post("/employees/me/leaves", {
        leaveTypeId: form.leaveTypeId,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim() || "Applied by employee",
      });
      toast.success("Leave applied — awaiting approval");
      setForm(BLANK);
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Leave apply failed");
    } finally { setSaving(false); }
  };

  if (noProfile) {
    return (
      <div className="space-y-5">
        <PageHeader title="Apply Leave" subtitle="Apply for your own leave" icon={<CalendarClock size={18} />} />
        <Card>
          <div className="p-10 text-center space-y-2">
            <AlertCircle size={22} className="mx-auto text-amber-500" />
            <p className="text-sm font-semibold text-slate-700">{noProfile}</p>
            <p className="text-[12px] text-slate-400">
              Apply Leave is for staff with an employee profile. An admin can book leave for anyone from Add Leave.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Apply Leave" subtitle="Apply for your own leave" icon={<CalendarClock size={18} />} />

      <Card title="Apply Leave">
        <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Select label="Leave Type *" value={form.leaveTypeId}
            options={[{ value: "", label: "Select..." }, ...leaveTypes.map((t) => ({
              value: t.id, label: `${t.name}${t.maxDays > 0 ? ` (${t.maxDays})` : ""}`,
            }))]}
            onChange={(e) => setForm((f) => ({ ...f, leaveTypeId: e.target.value }))} />
          <Input label="From Date *" type="date" value={form.startDate}
            onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
          <Input label="To Date *" type="date" value={form.endDate} min={form.startDate || undefined}
            onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} />
          <Textarea label="Reason" rows={2} value={form.reason} className="lg:col-span-3"
            onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))} />
          {days > 0 && <p className="text-[12px] font-semibold text-slate-600 lg:col-span-3">{days} day(s) selected</p>}
        </div>
        <div className="px-5 pb-5 flex justify-end">
          <Button icon={<Save size={14} />} loading={saving} onClick={submit}>Submit</Button>
        </div>
      </Card>

      <Card noPadding title="My Leave Balance">
        <LeaveAssignedDetails rows={summary} loading={loading} />
      </Card>

      <Card noPadding title="My Leave Transactions" subtitle={`${leaves.length} record(s)`}>
        <LeaveTransactions rows={leaves} loading={loading} emptyText="You have not applied for any leave yet." />
      </Card>
    </div>
  );
}
