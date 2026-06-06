/**
 * IssuePage.jsx
 * Module : inventory
 * Page   : Issue List + Add Issue — matches screenshots 4 & 5
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, SearchInput } from "../../components/ui";

const ROLES = ["Student", "Employee", "Other"];
const CATEGORIES = ["Books", "Stationery", "Sports", "Lab Equipment"];

function AddIssueForm({ onCancel }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ role: "", saleTo: "", dateOfIssue: today, dueDate: "", remark: "" });
  const [rows, setRows] = useState([{ id: 1, category: "", product: "", qty: 1 }]);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addRow = () => setRows(r => [...r, { id: Date.now(), category: "", product: "", qty: 1 }]);
  const removeRow = (id) => setRows(r => r.filter(x => x.id !== id));
  const updateRow = (id, k, v) => setRows(r => r.map(x => x.id === id ? { ...x, [k]: v } : x));

  return (
    <div className="p-5 space-y-5">
      {/* Fields laid out as in screenshot — centered/narrow */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm text-slate-600">Role *</label>
          <div className="col-span-2">
            <Select value={form.role} onChange={set("role")} options={ROLES.map(r => ({ value: r, label: r }))} />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm text-slate-600">Sale To *</label>
          <div className="col-span-2">
            <Select value={form.saleTo} onChange={set("saleTo")} options={[{ value: "", label: "Select" }]} />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm text-slate-600">Date Of Issue *</label>
          <div className="col-span-2">
            <Input type="date" value={form.dateOfIssue} onChange={set("dateOfIssue")} />
          </div>
        </div>
        <div className="grid grid-cols-3 items-center gap-4">
          <label className="text-right text-sm text-slate-600">Due Date *</label>
          <div className="col-span-2">
            <Input type="date" value={form.dueDate} onChange={set("dueDate")} />
          </div>
        </div>
        <div className="grid grid-cols-3 items-start gap-4">
          <label className="text-right text-sm text-slate-600 pt-2">Remark</label>
          <div className="col-span-2">
            <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" rows={3} value={form.remark} onChange={set("remark")} />
          </div>
        </div>
      </div>

      {/* Product rows */}
      <div className="border border-slate-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-0 bg-slate-50 border-b border-slate-200">
          <div className="col-span-4 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category *</div>
          <div className="col-span-5 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200">Product *</div>
          <div className="col-span-3 px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-l border-slate-200">Quantity *</div>
        </div>
        {rows.map(row => (
          <div key={row.id} className="grid grid-cols-12 gap-0 border-b border-slate-100">
            <div className="col-span-4 p-2">
              <Select value={row.category} onChange={e => updateRow(row.id, "category", e.target.value)}
                options={[{ value: "", label: "Select" }, ...CATEGORIES.map(c => ({ value: c, label: c }))]} />
            </div>
            <div className="col-span-5 p-2 border-l border-slate-100">
              <Select value={row.product} onChange={e => updateRow(row.id, "product", e.target.value)}
                options={[{ value: "", label: row.category ? "Select" : "First Select The Category" }]} />
            </div>
            <div className="col-span-3 p-2 border-l border-slate-100 flex gap-2 items-center">
              <Input type="number" value={row.qty} onChange={e => updateRow(row.id, "qty", e.target.value)} />
              {rows.length > 1 && (
                <button onClick={() => removeRow(row.id)} className="w-7 h-7 rounded bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center text-xs flex-shrink-0">−</button>
              )}
            </div>
          </div>
        ))}
      </div>
      <Button size="sm" variant="secondary" onClick={addRow}>✚ Add Rows</Button>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { alert("Issue saved!"); onCancel(); }}>✚ Save</Button>
      </div>
    </div>
  );
}

export default function IssuePage() {
  usePageTitle("Issue");
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [data] = useState([]);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors
        ${tab === id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
      {id === "list" ? "☰" : "✏"} {label}
    </button>
  );

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Issue management" icon="📤" />
      <Card>
        <div className="flex border-b border-slate-100">
          <TabBtn id="list" label="Issue List" />
          <TabBtn id="add" label="Add Issue" />
        </div>
        {tab === "list" ? (
          <>
            <div className="p-4 flex justify-end">
              <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Role","Issue To","Mobile No","Date Of Issue","Due Date","Return Date","Issued By","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-xs text-slate-400">No data available in table</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Showing 0 to 0 of 0 entries</span>
              <div className="flex gap-1">
                <Button size="xs" variant="secondary">‹</Button>
                <Button size="xs" variant="secondary">›</Button>
              </div>
            </div>
          </>
        ) : (
          <AddIssueForm onCancel={() => setTab("list")} />
        )}
      </Card>
    </div>
  );
}
