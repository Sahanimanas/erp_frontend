/**
 * Employee → Pay Salary  (wired to /payroll/employees + /payroll/payments)
 *
 * Every employee with their department, designation and the monthly salary
 * that applies to them. "Pay Salary" opens a modal: pick one or more months of
 * a year, the total is months × monthly salary, choose a payment mode, then
 * either Pay (disbursed now) or Save (parked as pending).
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { Wallet, IndianRupee, CheckCircle2, Clock } from "lucide-react";
import { usePageTitle } from "../../../hooks";
import {
  PageHeader, Card, Button, Input, Select, DataTable, Badge, Modal,
  SearchInput, Pagination, SummaryCards, ExportButton,
} from "../../../components/ui";
import apiClient from "../../../services/axios";
import { MONTHS, PAYMENT_MODES, money, yearOptions, monthLabel } from "./_salaryShared";

const PAGE_SIZE = 10;

export default function SalaryManagementPage() {
  usePageTitle("Pay Salary");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  // Pay modal — `payFor` is the employee row being paid.
  const [payFor, setPayFor] = useState(null);
  const [months, setMonths] = useState([]);
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Filter lists (departments/designations) — loaded once.
  useEffect(() => {
    (async () => {
      try {
        const [d, g] = await Promise.all([
          apiClient.get("/employees/departments"),
          apiClient.get("/employees/designations"),
        ]);
        if (d.data.success) setDepartments(d.data.data || []);
        if (g.data.success) setDesignations(g.data.data || []);
      } catch { /* filters stay empty; the roster still loads */ }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), year });
      if (search) params.set("search", search);
      if (departmentId) params.set("departmentId", departmentId);
      if (designationId) params.set("designationId", designationId);

      const res = await apiClient.get(`/payroll/employees?${params.toString()}`);
      if (res.data.success) {
        setRows(res.data.data || []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [page, search, departmentId, designationId, year]);
  useEffect(() => { load(); }, [load]);

  // Re-point the open modal at the freshly loaded row. Without this, switching
  // the year inside the modal would keep showing the previous year's paid
  // months, since `payFor` is a snapshot taken when the modal opened.
  useEffect(() => {
    setPayFor((cur) => (cur ? rows.find((r) => r.id === cur.id) ?? cur : cur));
  }, [rows]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiClient.get(`/payroll/summary?year=${year}`);
      if (res.data.success) setSummary(res.data.data);
    } catch { /* summary is decorative */ }
  }, [year]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  // Filter changes must reset paging, else page 3 of a 1-page result looks empty.
  const onFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  // ── Pay modal ──────────────────────────────────────────────────────────

  const openPay = (row) => {
    setPayFor(row);
    setMonths([]);
    setPaymentMode("CASH");
    setRemarks("");
  };
  const closePay = () => setPayFor(null);

  const toggleMonth = (m) =>
    setMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b)));

  // Months already covered by a payment this year can't be selected again.
  const lockedMonths = useMemo(() => {
    if (!payFor) return {};
    const map = {};
    (payFor.paidMonths || []).forEach((m) => { map[m] = "Paid"; });
    (payFor.pendingMonths || []).forEach((m) => { map[m] = "Pending"; });
    return map;
  }, [payFor]);

  /** Months still available to pick for the selected year. */
  const selectableMonths = useMemo(
    () => MONTHS.map((m) => m.value).filter((m) => !lockedMonths[m]),
    [lockedMonths],
  );
  const allSelected = selectableMonths.length > 0 && months.length === selectableMonths.length;

  const totalPayable = (payFor?.monthlySalary || 0) * months.length;

  const submitPayment = async (status) => {
    if (!payFor) return;
    if (!months.length) { toast.error("Select at least one month"); return; }
    if (!payFor.monthlySalary) {
      toast.error("No salary configured for this employee — set a department salary first");
      return;
    }
    setSubmitting(true);
    try {
      await apiClient.post("/payroll/payments", {
        employeeId: payFor.id,
        year: Number(year),
        months,
        paymentMode,
        status,
        remarks,
      });
      toast.success(status === "PAID" ? "Salary paid" : "Salary saved as pending");
      closePay();
      load();
      loadSummary();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to record salary");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table ──────────────────────────────────────────────────────────────

  const columns = [
    {
      key: "name", label: "Employee",
      render: (v, r) => (
        <div>
          <p className="font-semibold text-slate-800">{v}</p>
          <p className="text-[11px] text-slate-400">{r.employeeCode}</p>
        </div>
      ),
    },
    { key: "departmentName", label: "Department", render: (v) => v || <span className="text-slate-300">—</span> },
    { key: "designationName", label: "Designation", render: (v) => v || <span className="text-slate-300">—</span> },
    {
      key: "monthlySalary", label: "Monthly Salary",
      render: (v, r) => (v > 0 ? (
        <div>
          <span className="font-semibold text-slate-800">{money(v)}</span>
          <span className="block text-[10px] text-slate-400">
            {r.source === "EMPLOYEE" ? "employee rate" : "department rate"}
          </span>
        </div>
      ) : <Badge variant="warning">Not set</Badge>),
    },
    {
      key: "paidMonths", label: `Paid (${year})`, sortable: false,
      sortValue: (r) => (r.paidMonths || []).length,
      render: (v, r) => (
        <div className="flex flex-wrap gap-1">
          {(v || []).length === 0 && (r.pendingMonths || []).length === 0 && <span className="text-slate-300">—</span>}
          {(v || []).map((m) => <Badge key={`p${m}`} variant="success">{MONTHS[m - 1].short}</Badge>)}
          {(r.pendingMonths || []).map((m) => <Badge key={`d${m}`} variant="warning">{MONTHS[m - 1].short}</Badge>)}
        </div>
      ),
    },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, r) => (
        <div className="flex justify-end">
          <Button size="sm" icon={<IndianRupee size={13} />} onClick={() => openPay(r)}>Pay Salary</Button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { label: "Employee Code", get: (r) => r.employeeCode },
    { label: "Name", get: (r) => r.name },
    { label: "Department", get: (r) => r.departmentName || "" },
    { label: "Designation", get: (r) => r.designationName || "" },
    { label: "Monthly Salary", get: (r) => r.monthlySalary },
    { label: `Paid Months ${year}`, get: (r) => (r.paidMonths || []).map(monthLabel).join("; ") },
    { label: `Paid Amount ${year}`, get: (r) => r.paidAmount },
  ];

  const fetchAll = async () => {
    const params = new URLSearchParams({ page: "1", limit: "200", year });
    if (search) params.set("search", search);
    if (departmentId) params.set("departmentId", departmentId);
    if (designationId) params.set("designationId", designationId);
    const res = await apiClient.get(`/payroll/employees?${params.toString()}`);
    return res.data.data || [];
  };

  const cards = summary ? [
    { label: "Employees", value: summary.employeeCount },
    { label: "Monthly Payroll", value: money(summary.monthlyPayroll) },
    { label: `Paid in ${summary.year}`, value: money(summary.totalPaid) },
    { label: "Pending", value: money(summary.totalPending) },
  ] : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Employee Salary"
        subtitle="Pay monthly salary by employee"
        icon={<Wallet size={18} />}
      >
        <ExportButton filename="employee-salary.csv" rows={rows} columns={exportColumns} fetchAll={fetchAll} />
      </PageHeader>

      {summary && <SummaryCards cards={cards} />}

      {summary?.unconfiguredEmployees > 0 && (
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-4 py-3 text-[12px] text-amber-700">
          {summary.unconfiguredEmployees} employee{summary.unconfiguredEmployees > 1 ? "s have" : " has"} no salary configured.
          Set a rate under <span className="font-semibold">Employee → Salary Structure</span>.
        </div>
      )}

      <Card noPadding>
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100">
          <SearchInput
            className="w-full sm:w-64"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name or code..."
          />
          <Select
            value={departmentId}
            onChange={onFilter(setDepartmentId)}
            options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <Select
            value={designationId}
            onChange={onFilter(setDesignationId)}
            options={[{ value: "", label: "All Designations" }, ...designations.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <Select value={year} onChange={onFilter(setYear)} options={yearOptions()} />
          {(search || departmentId || designationId) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDepartmentId(""); setDesignationId(""); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>

        <DataTable columns={columns} data={rows} loading={loading} emptyText="No employees found." />
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      {/* ── Pay Salary modal ───────────────────────────────────────────── */}
      <Modal open={!!payFor} onClose={closePay} title="Pay Salary" size="lg">
        {payFor && (
          <div className="space-y-5">
            <div className="rounded-xl bg-slate-50 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Field label="Employee" value={payFor.name} />
              <Field label="Code" value={payFor.employeeCode} />
              <Field label="Department" value={payFor.departmentName || "—"} />
              <Field label="Designation" value={payFor.designationName || "—"} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Year *"
                value={year}
                onChange={(e) => { setYear(e.target.value); setMonths([]); }}
                options={yearOptions()}
              />
              <Select
                label="Payment Mode *"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                options={PAYMENT_MODES}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-600">Select Month(s) *</p>
                <button
                  type="button"
                  onClick={() => setMonths(allSelected ? [] : selectableMonths)}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline"
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {MONTHS.map((m) => {
                  const locked = lockedMonths[m.value];
                  const selected = months.includes(m.value);
                  return (
                    <button
                      key={m.value}
                      type="button"
                      disabled={!!locked}
                      onClick={() => toggleMonth(m.value)}
                      title={locked ? `Already ${locked.toLowerCase()} for ${year}` : ""}
                      className={`px-2 py-2 rounded-lg text-[12px] font-semibold border transition-colors text-center
                        ${locked
                          ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                          : selected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                    >
                      {m.label}
                      {locked && (
                        <span className="block text-[9px] font-medium">
                          {locked === "Paid" ? <CheckCircle2 size={9} className="inline" /> : <Clock size={9} className="inline" />} {locked}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Greyed-out months are already recorded for {year}.
              </p>
            </div>

            {/* Amount breakdown — months × monthly salary. */}
            <div className="rounded-xl border border-slate-100 divide-y divide-slate-100">
              <Row label="Basic Salary (per month)" value={money(payFor.basicSalary)} />
              {payFor.allowances > 0 && <Row label="Allowances (per month)" value={`+ ${money(payFor.allowances)}`} />}
              {payFor.deductions > 0 && <Row label="Deductions (per month)" value={`− ${money(payFor.deductions)}`} />}
              <Row label="Monthly Salary" value={money(payFor.monthlySalary)} strong />
              <Row label="Months Selected" value={String(months.length)} />
              <div className="flex items-center justify-between px-4 py-3 bg-emerald-50 rounded-b-xl">
                <span className="text-[12px] font-semibold text-emerald-700">Total Payable</span>
                <span className="text-[18px] font-bold text-emerald-700">{money(totalPayable)}</span>
              </div>
            </div>

            <Input label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Optional note" />

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="secondary" onClick={closePay} disabled={submitting}>Cancel</Button>
              <Button
                variant="outline"
                loading={submitting}
                onClick={() => submitPayment("PENDING")}
              >
                Save
              </Button>
              <Button
                variant="success"
                icon={<IndianRupee size={14} />}
                loading={submitting}
                onClick={() => submitPayment("PAID")}
              >
                Pay {months.length > 0 ? money(totalPayable) : ""}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-[13px] font-semibold text-slate-700 mt-0.5">{value}</p>
    </div>
  );
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className={`text-[12px] ${strong ? "font-semibold text-slate-700" : "text-slate-500"}`}>{label}</span>
      <span className={`text-[13px] ${strong ? "font-bold text-slate-800" : "text-slate-600"}`}>{value}</span>
    </div>
  );
}
