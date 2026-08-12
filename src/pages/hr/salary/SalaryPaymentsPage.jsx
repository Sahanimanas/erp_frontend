/**
 * Employee → Salary Payments  (wired to /payroll/payments)
 *
 * History of every salary disbursement. Payments saved as PENDING from the Pay
 * Salary screen can be disbursed or deleted here.
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Receipt, Trash2, IndianRupee, Printer } from "lucide-react";
import { usePageTitle } from "../../../hooks";
import {
  PageHeader, Card, Button, Select, DataTable, Badge, Modal,
  SearchInput, Pagination, SummaryCards, ExportButton,
} from "../../../components/ui";
import apiClient from "../../../services/axios";
import { printTable } from "../../../utils/printPdf";
import { MONTHS, PAYMENT_MODES, money, modeLabel, yearOptions } from "./_salaryShared";

const PAGE_SIZE = 10;

export default function SalaryPaymentsPage() {
  usePageTitle("Salary Payments");

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);

  const [search, setSearch] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [departments, setDepartments] = useState([]);

  // Confirm-pay modal for a pending payment.
  const [payRow, setPayRow] = useState(null);
  const [payMode, setPayMode] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiClient.get("/employees/departments");
        if (res.data.success) setDepartments(res.data.data || []);
      } catch { /* filter stays empty */ }
    })();
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), year });
      if (search) params.set("search", search);
      if (departmentId) params.set("departmentId", departmentId);
      if (status) params.set("status", status);
      if (month) params.set("month", month);

      const res = await apiClient.get(`/payroll/payments?${params.toString()}`);
      if (res.data.success) {
        setRows(res.data.data || []);
        setTotal(res.data.pagination?.total ?? 0);
      }
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [page, search, departmentId, status, month, year]);
  useEffect(() => { load(); }, [load]);

  const loadSummary = useCallback(async () => {
    try {
      const res = await apiClient.get(`/payroll/summary?year=${year}`);
      if (res.data.success) setSummary(res.data.data);
    } catch { /* summary is decorative */ }
  }, [year]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const onFilter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  const confirmPay = async () => {
    if (!payRow) return;
    setSubmitting(true);
    try {
      await apiClient.patch(`/payroll/payments/${payRow.id}/pay`, { paymentMode: payMode });
      toast.success("Salary paid");
      setPayRow(null);
      load();
      loadSummary();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to pay");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (r) => {
    if (!window.confirm(`Delete the ${r.monthNames.join(", ")} ${r.year} salary payment for ${r.employeeName}?`)) return;
    try {
      await apiClient.delete(`/payroll/payments/${r.id}`);
      toast.success("Deleted");
      load();
      loadSummary();
    } catch (e) {
      toast.error(e.response?.data?.error || "Failed to delete");
    }
  };

  const columns = [
    {
      key: "employeeName", label: "Employee",
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
      key: "monthNames", label: "Period", sortable: false,
      render: (v, r) => (
        <div>
          <div className="flex flex-wrap gap-1">
            {(r.months || []).map((m) => <Badge key={m} variant="info">{MONTHS[m - 1].short}</Badge>)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{r.year} · {r.monthCount} month{r.monthCount > 1 ? "s" : ""}</p>
        </div>
      ),
    },
    { key: "monthlySalary", label: "Rate / Month", sortValue: (r) => r.monthlySalary, render: (_v, r) => money(r.monthlySalary + r.allowances - r.deductions) },
    { key: "totalAmount", label: "Total", render: (v) => <span className="font-semibold text-slate-800">{money(v)}</span> },
    { key: "paymentMode", label: "Mode", render: (v) => modeLabel(v) },
    {
      key: "status", label: "Status",
      render: (v) => <Badge variant={v === "PAID" ? "success" : "warning"}>{v === "PAID" ? "Paid" : "Pending"}</Badge>,
    },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, r) => (
        <div className="flex gap-1 justify-end">
          {r.status === "PENDING" && (
            <button
              onClick={() => { setPayRow(r); setPayMode(r.paymentMode || "CASH"); }}
              title="Mark as paid"
              className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600"
            >
              <IndianRupee size={13} />
            </button>
          )}
          <button onClick={() => remove(r)} title="Delete" className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { label: "Employee Code", get: (r) => r.employeeCode },
    { label: "Employee", get: (r) => r.employeeName },
    { label: "Department", get: (r) => r.departmentName || "" },
    { label: "Designation", get: (r) => r.designationName || "" },
    { label: "Year", get: (r) => r.year },
    { label: "Months", get: (r) => r.monthNames.join("; ") },
    { label: "Month Count", get: (r) => r.monthCount },
    { label: "Monthly Salary", get: (r) => r.monthlySalary + r.allowances - r.deductions },
    { label: "Total", get: (r) => r.totalAmount },
    { label: "Mode", get: (r) => modeLabel(r.paymentMode) },
    { label: "Status", get: (r) => r.status },
    { label: "Paid Date", get: (r) => (r.paidDate ? new Date(r.paidDate).toLocaleDateString() : "") },
  ];

  /** Print exactly what the table currently shows. */
  const print = () => {
    if (!rows.length) { toast.error("Nothing to print"); return; }
    printTable({
      title: "Salary Payments",
      subtitle: `Year ${year}${status ? ` · ${status}` : ""}`,
      columns: ["Code", "Employee", "Department", "Designation", "Period", "Months", "Total", "Mode", "Status"],
      rows: rows.map((r) => [
        r.employeeCode, r.employeeName, r.departmentName || "—", r.designationName || "—",
        `${r.monthNames.join(", ")} ${r.year}`, r.monthCount, money(r.totalAmount),
        modeLabel(r.paymentMode), r.status === "PAID" ? "Paid" : "Pending",
      ]),
      footer: `Total on this page: ${money(rows.reduce((s, r) => s + r.totalAmount, 0))}`,
    });
  };

  const cards = summary ? [
    { label: `Paid in ${summary.year}`, value: money(summary.totalPaid) },
    { label: "Pending", value: money(summary.totalPending) },
    { label: "Payments", value: summary.paidCount + summary.pendingCount },
    { label: "Monthly Payroll", value: money(summary.monthlyPayroll) },
  ] : [];

  return (
    <div className="space-y-5">
      <PageHeader title="Salary Payments" subtitle="All salary disbursements" icon={<Receipt size={18} />}>
        <Button size="sm" variant="secondary" icon={<Printer size={13} />} onClick={print}>Print</Button>
        <ExportButton filename="salary-payments.csv" rows={rows} columns={exportColumns} />
      </PageHeader>

      {summary && <SummaryCards cards={cards} />}

      <Card noPadding>
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100">
          <SearchInput
            className="w-full sm:w-56"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search employee..."
          />
          <Select
            value={departmentId}
            onChange={onFilter(setDepartmentId)}
            options={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]}
          />
          <Select value={year} onChange={onFilter(setYear)} options={yearOptions()} />
          <Select
            value={month}
            onChange={onFilter(setMonth)}
            options={[{ value: "", label: "All Months" }, ...MONTHS.map((m) => ({ value: String(m.value), label: m.label }))]}
          />
          <Select
            value={status}
            onChange={onFilter(setStatus)}
            options={[{ value: "", label: "All Status" }, { value: "PAID", label: "Paid" }, { value: "PENDING", label: "Pending" }]}
          />
          {(search || departmentId || status || month) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(""); setDepartmentId(""); setStatus(""); setMonth(""); setPage(1); }}>
              Clear
            </Button>
          )}
        </div>

        <DataTable columns={columns} data={rows} loading={loading} emptyText="No salary payments yet." />
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <Modal open={!!payRow} onClose={() => setPayRow(null)} title="Pay Pending Salary" size="sm">
        {payRow && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4 space-y-1">
              <p className="text-[13px] font-semibold text-slate-800">{payRow.employeeName}</p>
              <p className="text-[11px] text-slate-500">{payRow.monthNames.join(", ")} {payRow.year}</p>
              <p className="text-[18px] font-bold text-emerald-600">{money(payRow.totalAmount)}</p>
            </div>
            <Select label="Payment Mode" value={payMode} onChange={(e) => setPayMode(e.target.value)} options={PAYMENT_MODES} />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setPayRow(null)} disabled={submitting}>Cancel</Button>
              <Button variant="success" loading={submitting} onClick={confirmPay}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
