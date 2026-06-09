/**
 * FeeCollectionPage.jsx — Fee collection and payment management
 * Integrated with /api/v1/fees endpoint
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, DataTable, Badge, Button,
  SearchInput, Select, Pagination, Modal, Input, ExportButton,
} from "../../components/ui";
import { DollarSign, Plus, Receipt, Check, X } from "lucide-react";
import apiClient from "../../services/axios";

const FEE_BADGE = { PAID: "success", PENDING: "danger", PARTIAL: "warning" };
const STATUS_OPT = [{ value: "", label: "All Status" }, { value: "PAID", label: "Paid" }, { value: "PENDING", label: "Pending" }, { value: "PARTIAL", label: "Partial" }];
const PAYMENT_MODES = [{ value: "cash", label: "Cash" }, { value: "upi", label: "UPI" }, { value: "online", label: "Online Transfer" }, { value: "cheque", label: "Cheque" }];

export default function FeeCollectionPage() {
  usePageTitle("Fee Collection");

  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [collectOpen, setCollectOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  const PAGE_SIZE = 10;

  // Fetch fee data from API
  useEffect(() => {
    const fetchFeeData = async () => {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(search && { search }),
          ...(status && { status }),
        });

        const response = await apiClient.get(`/v1/fees/pending-dues?${params}`);
        if (response.data.success || response.data.data) {
          const feeData = Array.isArray(response.data.data) ? response.data.data : response.data;
          setStudents(feeData);
          setTotal(response.data.pagination?.total || feeData.length || 0);
        }
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to fetch fee data");
        console.error("Fee fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeeData();
  }, [page, search, status]);

  // Handle fee collection
  const handleCollectFee = async (formData) => {
    try {
      setLoading(true);
      const payload = {
        studentId: formData.studentId,
        feeId: formData.feeId,
        amount: formData.amount,
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId,
        remarks: formData.remarks,
      };

      const response = await apiClient.post("/v1/fees/collections", payload);

      if (response.data.success || response.data.data) {
        setCollectOpen(false);
        setPage(1);
        setError("");
        // Refresh fee data
        const refreshResponse = await apiClient.get(`/v1/fees/pending-dues?page=1&limit=${PAGE_SIZE}`);
        const feeData = Array.isArray(refreshResponse.data.data) ? refreshResponse.data.data : refreshResponse.data;
        setStudents(feeData);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to collect fee");
    } finally {
      setLoading(false);
    }
  };

  // Calculate total and due amounts from fee type amounts
  const calculateAmounts = (feeRecord) => {
    const group = feeRecord.fee?.group;
    const feeTypes = group?.feeTypes || [];
    const total = feeTypes.reduce((sum, ft) => sum + Number(ft.amount || 0), 0);
    const paid = feeRecord.amount ? Number(feeRecord.amount) : 0;
    const due = total - paid;

    return { total, paid, due };
  };

  // Transform API data for display
  const displayStudents = students.map((record) => {
    const { total, paid, due } = calculateAmounts(record);
    const lastPaidDate = record.paidDate ? new Date(record.paidDate).toLocaleDateString('en-IN') : "—";
    let paymentStatus = "PENDING";
    if (due <= 0) paymentStatus = "PAID";
    else if (paid > 0) paymentStatus = "PARTIAL";

    return {
      id: record.id,
      studentId: record.student?.id,
      feeId: record.fee?.id,
      roll: record.student?.rollNumber || "—",
      name: `${record.student?.user?.firstName || ""} ${record.student?.user?.lastName || ""}`.trim() || "—",
      class: record.fee?.class || "—",
      total,
      paid,
      due: Math.max(0, due),
      status: paymentStatus,
      date: lastPaidDate,
      dueDate: record.fee?.dueDate ? new Date(record.fee.dueDate).toLocaleDateString('en-IN') : "—",
      original: record,
    };
  });

  const COLUMNS = [
    { key: "roll", label: "Roll No", render: (v) => <span className="font-mono text-[11px] text-indigo-600 font-semibold">{v}</span> },
    { key: "name", label: "Student", render: (v) => <span className="font-semibold text-slate-800">{v}</span> },
    { key: "class", label: "Class" },
    { key: "total", label: "Total", render: (v) => `₹${v.toLocaleString()}` },
    { key: "paid", label: "Paid", render: (v) => <span className="text-emerald-600 font-semibold">₹{v.toLocaleString()}</span> },
    { key: "due", label: "Due", render: (v) => <span className={v > 0 ? "text-red-500 font-semibold" : "text-slate-400"}>₹{v.toLocaleString()}</span> },
    { key: "status", label: "Status", render: (v) => <Badge variant={FEE_BADGE[v] || "default"}>{v.charAt(0).toUpperCase() + v.slice(1)}</Badge> },
    { key: "date", label: "Last Paid" },
    {
      key: "id",
      label: "Actions",
      sortable: false,
      render: (_, r) => (
        <div className="flex gap-1">
          <Button size="xs" icon={<Receipt size={11} />} onClick={() => setViewRow(r)}>Receipt</Button>
          {r.due > 0 && <Button size="xs" variant="warning" onClick={() => handleCollectClick(r)}>Collect</Button>}
        </div>
      ),
    },
  ];

  const EXPORT_COLUMNS = [
    { label: "Roll No", get: (r) => r.roll },
    { label: "Student", get: (r) => r.name },
    { label: "Class", get: (r) => r.class },
    { label: "Total", get: (r) => r.total },
    { label: "Paid", get: (r) => r.paid },
    { label: "Due", get: (r) => r.due },
    { label: "Status", get: (r) => r.status },
    { label: "Last Paid", get: (r) => r.date },
  ];

  const handleCollectClick = (row) => {
    setViewRow(row);
    setCollectOpen(true);
  };

  function CollectFeeForm({ onSubmit, onCancel, selectedStudent }) {
    const [form, setForm] = useState({
      studentId: selectedStudent?.studentId || "",
      feeId: selectedStudent?.feeId || "",
      amount: selectedStudent?.due || "",
      paymentMode: "cash",
      transactionId: "",
      remarks: "",
    });
    const [submitLoading, setSubmitLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!form.studentId || !form.feeId || !form.amount || form.amount <= 0) {
        setError("Please fill all required fields");
        return;
      }
      setSubmitLoading(true);
      try {
        await onSubmit(form);
      } finally {
        setSubmitLoading(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-[12px] text-blue-600 font-semibold">Student: {selectedStudent?.name}</p>
          <p className="text-[11px] text-blue-500">Roll: {selectedStudent?.roll} | Due: ₹{selectedStudent?.due?.toLocaleString()}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount *"
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || "" })}
            placeholder="₹0.00"
            max={selectedStudent?.due}
          />
          <Select
            label="Payment Mode *"
            value={form.paymentMode}
            onChange={e => setForm({ ...form, paymentMode: e.target.value })}
            options={PAYMENT_MODES}
          />
        </div>
        <Input
          label="Transaction ID"
          value={form.transactionId}
          onChange={e => setForm({ ...form, transactionId: e.target.value })}
          placeholder="Optional for online/cheque"
        />
        <Input
          label="Remarks"
          value={form.remarks}
          onChange={e => setForm({ ...form, remarks: e.target.value })}
          placeholder="Optional note"
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={submitLoading} className="flex-1" icon={<Check size={14} />}>
            {submitLoading ? "Processing..." : "Mark as Paid"}
          </Button>
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel} icon={<X size={14} />}>
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <PageHeader title="Student Accounting" subtitle="Fee collection and receipt management" icon={<DollarSign size={18} />}>
        <ExportButton filename="fee-collection.csv" rows={displayStudents} columns={EXPORT_COLUMNS} />
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setCollectOpen(true)}>Collect Fee</Button>
      </PageHeader>

      <Card noPadding>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-4 rounded-lg text-sm">{error}</div>}
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100">
          <SearchInput
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search student or roll..."
            className="w-52"
          />
          <Select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            options={STATUS_OPT}
            className="w-36"
          />
          <Button variant="secondary" size="sm" onClick={() => { setSearch(""); setStatus(""); setPage(1); }}>Clear</Button>
          <span className="ml-auto text-[11px] text-slate-500">{loading ? "Loading..." : `${total} records`}</span>
        </div>
        <DataTable columns={COLUMNS} data={displayStudents} loading={loading} />
        <Pagination page={page} total={total} pageSize={PAGE_SIZE} onPageChange={setPage} />
      </Card>

      <Modal open={collectOpen} onClose={() => { setCollectOpen(false); setViewRow(null); }} title="Collect Fee Payment" size="md">
        {viewRow && <CollectFeeForm onSubmit={handleCollectFee} onCancel={() => { setCollectOpen(false); setViewRow(null); }} selectedStudent={viewRow} />}
      </Modal>
    </div>
  );
}
