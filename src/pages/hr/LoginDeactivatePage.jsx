/**
 * LoginDeactivatePage.jsx
 * Module : hr
 * Page   : Deactivate Account (matches screenshot 10)
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, DataTable, SearchInput, Avatar } from "../../components/ui";

const ROLES = ["Admin", "Teacher", "Accountant", "Librarian", "Receptionist", "4th Grade"];

export default function LoginDeactivatePage() {
  usePageTitle("Deactivate Account");

  const [role, setRole] = useState("Admin");
  const [search, setSearch] = useState("");
  const [data] = useState([]);

  const columns = [
    { key: "check", label: "", sortable: false, render: () => <input type="checkbox" className="rounded" /> },
    { key: "photo", label: "Photo", sortable: false, render: (_, row) => <Avatar name={row.name || "E"} size="sm" /> },
    { key: "branch", label: "Branch" },
    { key: "name", label: "Name" },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    { key: "mobileNo", label: "Mobile No" },
    {
      key: "action",
      label: "Action",
      sortable: false,
      render: () => (
        <Button size="xs" variant="danger">Deactivate</Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Deactivate Account" subtitle="Manage employee login access" icon="🔒" />

      {/* Filter */}
      <Card className="mb-4">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Select Ground</p>
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <Select
            label="Role *"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={ROLES.map((r) => ({ value: r, label: r }))}
          />
          <Button variant="secondary" className="self-end">🔍 Filter</Button>
        </div>
      </Card>

      {/* Table */}
      <Card
        title="Employee List"
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

      {/* Authentication Activate button (bottom right, as in screenshot) */}
      <div className="flex justify-end mt-4">
        <Button variant="secondary">
          🔐 Authentication Activate
        </Button>
      </div>
    </div>
  );
}
