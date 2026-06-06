/**
 * AdmissionListPage.jsx
 * Module : admission
 * Page   : Online Admission List (matches Student List / Online Admission screenshot)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, Button, Select, Badge, DataTable, SearchInput,
} from "../../components/ui";

const STATUS_OPTIONS = [
  { value: "", label: "— All —" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const CLASS_OPTIONS = [
  { value: "", label: "Select" },
  ...[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` })),
];

const SAMPLE_DATA = []; // Empty as per screenshot

export default function AdmissionListPage() {
  usePageTitle("Online Admission List");

  const [filterClass, setFilterClass] = useState("");
  const [search, setSearch] = useState("");
  const [data] = useState(SAMPLE_DATA);

  const filtered = data.filter((r) => {
    const matchClass = !filterClass || r.class === filterClass;
    const matchSearch =
      !search ||
      r.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.referenceNo?.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const columns = [
    { key: "sl", label: "SL", sortable: false, render: (_, __, i) => i + 1 },
    { key: "referenceNo", label: "Reference No" },
    { key: "name", label: "Name" },
    { key: "gender", label: "Gender" },
    { key: "class", label: "Class" },
    { key: "mobileNo", label: "Mobile No" },
    { key: "enrollNo", label: "Enroll No" },
    {
      key: "status",
      label: "Status",
      render: (v) =>
        v ? (
          <Badge variant={v === "approved" ? "success" : v === "rejected" ? "danger" : "warning"}>
            {v}
          </Badge>
        ) : "—",
    },
    {
      key: "paymentStatus",
      label: "Payment Status",
      render: (v) =>
        v ? (
          <Badge variant={v === "paid" ? "success" : "warning"}>{v}</Badge>
        ) : "—",
    },
    { key: "applyDate", label: "Apply Date" },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="outline">View</Button>
          <Button size="xs" variant="success">Approve</Button>
          <Button size="xs" variant="danger">Reject</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student List"
        subtitle="Online Admission List"
        icon="🎓"
      />

      {/* Filter */}
      <Card className="mb-4">
        <div className="p-5">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
            Select Ground
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Select
              label="Class (Optional)"
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              options={CLASS_OPTIONS}
            />
            <Button
              variant="secondary"
              className="self-end"
              onClick={() => setFilterClass("")}
            >
              🔍 Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card
        title="Online Admission List"
        action={
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
          />
        }
      >
        <DataTable
          columns={columns}
          data={filtered.map((r, i) => ({ ...r, sl: i + 1 }))}
          emptyText="No data available in table"
        />
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex gap-1">
            <Button size="xs" variant="secondary">‹</Button>
            <Button size="xs" variant="secondary">›</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
