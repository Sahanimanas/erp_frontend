/**
 * Employee Leave → Approve Leave
 *
 * School-wide approval queue split into three tables, exactly as the reference:
 * To Approve (actionable) / Approved / Cancelled.
 *   GET   /employees/leaves?status=…
 *   PATCH /employees/:employeeId/leaves/:leaveId/{approve|cancel}
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../../hooks";
import { PageHeader, Card, Select, Input, Button, SummaryCards, ExportButton } from "../../../components/ui";
import { CalendarCheck2, RotateCcw } from "lucide-react";
import apiClient from "../../../services/axios";
import { LeaveTransactions, leaveExportColumns, empOptions } from "./shared";

export default function ApproveLeavePage() {
  usePageTitle("Approve Leave");
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [filters, setFilters] = useState({ employeeId: "", departmentId: "", startDate: "", endDate: "" });

  useEffect(() => {
    (async () => {
      try {
        const [emp, dept] = await Promise.all([
          apiClient.get("/employees?limit=500"),
          apiClient.get("/employees/departments"),
        ]);
        if (emp.data.success) setEmployees(emp.data.data || []);
        if (dept.data.success) setDepartments(dept.data.data || []);
      } catch { /* filters degrade to "all" */ }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const res = await apiClient.get("/employees/leaves", { params });
      if (res.data.success) setLeaves(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load leave transactions");
    } finally { setLoading(false); }
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const act = async (leave, action) => {
    const remarks = action === "cancel" ? window.prompt("Remarks (optional):") ?? "" : undefined;
    setBusyId(leave.id);
    try {
      await apiClient.patch(`/employees/${leave.employeeId}/leaves/${leave.id}/${action}`, action === "cancel" ? { remarks } : {});
      toast.success(action === "approve" ? "Leave approved" : "Leave cancelled");
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || `Failed to ${action} leave`);
    } finally { setBusyId(""); }
  };

  const { pending, approved, cancelled } = useMemo(() => ({
    pending: leaves.filter((l) => l.status === "PENDING"),
    approved: leaves.filter((l) => l.status === "APPROVED"),
    cancelled: leaves.filter((l) => l.status === "CANCELLED" || l.status === "REJECTED"),
  }), [leaves]);

  const deptOptions = [{ value: "", label: "All departments" }, ...departments.map((d) => ({ value: d.id, label: d.name }))];
  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-5">
      <PageHeader title="Approve Employee Leave" subtitle="Review and action staff leave requests" icon={<CalendarCheck2 size={18} />} />

      <SummaryCards cards={[
        { label: "To Approve", value: pending.length },
        { label: "Approved", value: approved.length },
        { label: "Cancelled / Rejected", value: cancelled.length },
        { label: "Approved Days", value: approved.reduce((s, l) => s + (l.actualDays ?? l.days ?? 0), 0) },
      ]} />

      <Card>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Select label="Employee" value={filters.employeeId} options={empOptions(employees, "All employees")}
            onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))} />
          <Select label="Department" value={filters.departmentId} options={deptOptions}
            onChange={(e) => setFilters((f) => ({ ...f, departmentId: e.target.value }))} />
          <Input label="From" type="date" value={filters.startDate}
            onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input label="To" type="date" value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            {hasFilters && (
              <Button size="sm" variant="ghost" icon={<RotateCcw size={13} />} title="Clear filters"
                onClick={() => setFilters({ employeeId: "", departmentId: "", startDate: "", endDate: "" })} />
            )}
          </div>
        </div>
      </Card>

      <Card noPadding title="To Approve Leave Transactions" subtitle={`${pending.length} awaiting action`}
        action={<ExportButton filename="to-approve-leaves.csv" rows={pending} columns={leaveExportColumns(true)} />}>
        <LeaveTransactions rows={pending} loading={loading} showEmployee onAction={act} busyId={busyId}
          emptyText="Nothing awaiting approval." />
      </Card>

      <Card noPadding title="Approved Leave Transactions" subtitle={`${approved.length} approved`}
        action={<ExportButton filename="approved-leaves.csv" rows={approved} columns={leaveExportColumns(true)} />}>
        <LeaveTransactions rows={approved} loading={loading} showEmployee emptyText="No approved leave yet." />
      </Card>

      <Card noPadding title="Cancelled Leave Transactions" subtitle={`${cancelled.length} cancelled or rejected`}
        action={<ExportButton filename="cancelled-leaves.csv" rows={cancelled} columns={leaveExportColumns(true)} />}>
        <LeaveTransactions rows={cancelled} loading={loading} showEmployee emptyText="No cancelled leave." />
      </Card>
    </div>
  );
}
