/**
 * RegistrationListPage.jsx
 * Module : admission
 * Page   : Registration List (matches Registration List screenshot)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import {
  PageHeader, Card, Button, Select, Input, Badge, DataTable, SearchInput,
} from "../../components/ui";

const CLASS_OPTIONS = [
  { value: "", label: "Select" },
  ...[...Array(12)].map((_, i) => ({ value: String(i + 1), label: `Class ${i + 1}` })),
];

const STATUS_OPTIONS = [
  { value: "", label: "— All —" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function RegistrationListPage() {
  usePageTitle("Registration List");

  const [filters, setFilters] = useState({
    class: "", status: "", fromDate: "", toDate: "",
  });
  const [search, setSearch] = useState("");
  const [data] = useState([]);

  const set = (k) => (e) => setFilters((f) => ({ ...f, [k]: e.target.value }));

  const columns = [
    { key: "sl", label: "SL", sortable: false },
    { key: "registrationNo", label: "Registration No" },
    { key: "name", label: "Name" },
    { key: "class", label: "Class" },
    { key: "fatherName", label: "Father Name" },
    { key: "mobileNo", label: "Mobile No" },
    { key: "fee", label: "Fee" },
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
    { key: "date", label: "Date" },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: (_, row) => (
        <div className="flex gap-1.5">
          <Button size="xs" variant="outline">View</Button>
          <Button size="xs" variant="danger">Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Registration List"
        subtitle="All student registrations"
        icon="📋"
      />

      {/* Filters */}
      <Card className="mb-4">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            🔍 Select Ground
          </p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Class"
            value={filters.class}
            onChange={set("class")}
            options={CLASS_OPTIONS}
          />
          <Select
            label="Status"
            value={filters.status}
            onChange={set("status")}
            options={STATUS_OPTIONS}
          />
          <Input
            label="From Date"
            type="date"
            value={filters.fromDate}
            onChange={set("fromDate")}
          />
          <Input
            label="To Date"
            type="date"
            value={filters.toDate}
            onChange={set("toDate")}
          />
        </div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          <Button variant="secondary">🔍 Filter</Button>
          <Button onClick={() => alert("New registration form")}>+ New Registration</Button>
          <Button variant="outline">₹ Registration Fee Setup</Button>
        </div>
      </Card>

      {/* Table */}
      <Card
        title="Registration List"
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
          data={data}
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
