/**
 * ParentDeactivatePage.jsx
 * Module : parents
 * Page   : Deactivate Account (Parents) — matches screenshot 8
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, DataTable, SearchInput } from "../../components/ui";

export default function ParentDeactivatePage() {
  usePageTitle("Deactivate Account");
  const [search, setSearch] = useState("");
  const [data] = useState([]);

  const columns = [
    { key: "check", label: "", sortable: false, render: () => <input type="checkbox" className="rounded" /> },
    { key: "name", label: "Guardian Name" },
    { key: "occupation", label: "Occupation" },
    { key: "mobile", label: "Mobile No" },
    { key: "email", label: "Email" },
    { key: "action", label: "Action", sortable: false, render: () => <Button size="xs" variant="danger">Deactivate</Button> },
  ];

  return (
    <div>
      <PageHeader title="Deactivate Account" subtitle="Manage parent login access" icon="🔒" />
      <Card title="Parents List" action={
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
      }>
        <DataTable columns={columns} data={data} emptyText="No data available in table" />
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Showing 0 to 0 of 0 entries</span>
          <div className="flex gap-1">
            <Button size="xs" variant="secondary">‹</Button>
            <Button size="xs" variant="secondary">›</Button>
          </div>
        </div>
      </Card>
      <div className="flex justify-end mt-4">
        <Button variant="secondary">🔐 Authentication Activate</Button>
      </div>
    </div>
  );
}
