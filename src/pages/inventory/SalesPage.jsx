/**
 * SalesPage.jsx
 * Module : inventory
 * Page   : Sales List + Add Sales — matches screenshot 3
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, SearchInput } from "../../components/ui";

const SAMPLE_SALES = [
  { id: "0001", role: "Student", saleTo: "",                  payment: "Total Paid", date: "29.Mar.2026", netPayable: "₹2322.00",  paid: "₹2322.00",  due: "₹0.00" },
  { id: "0002", role: "Student", saleTo: "ANNANYA KUMARI",    payment: "Total Paid", date: "29.Mar.2026", netPayable: "₹1360.00",  paid: "₹1360.00",  due: "₹0.00" },
  { id: "0003", role: "Student", saleTo: "",                  payment: "Total Paid", date: "29.Mar.2026", netPayable: "₹2962.00",  paid: "₹2962.00",  due: "₹0.00" },
  { id: "0003", role: "Student", saleTo: "",                  payment: "Total Paid", date: "29.Mar.2026", netPayable: "₹1930.00",  paid: "₹1930.00",  due: "₹0.00" },
  { id: "0004", role: "Student", saleTo: "PRIYANSHU KUMAR YADAV", payment: "Unpaid", date: "24.Apr.2026", netPayable: "₹3062.00",  paid: "₹0.00",     due: "₹3062.00" },
];

const ROLES = ["Student", "Employee", "Other"];

function PaymentBadge({ v }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
      ${v === "Total Paid" ? "text-emerald-700 border-emerald-400" :
        v === "Partly Paid" ? "text-amber-700 border-amber-400" :
        "text-red-700 border-red-400"}`}>
      {v}
    </span>
  );
}

function AddSalesForm({ onCancel }) {
  const [form, setForm] = useState({ role: "", saleTo: "", discount: "", remarks: "" });
  const [rows, setRows] = useState([{ id: 1, product: "", qty: 1, price: "" }]);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
  const addRow = () => setRows(r => [...r, { id: Date.now(), product: "", qty: 1, price: "" }]);

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Role *" value={form.role} onChange={set("role")} options={ROLES.map(r => ({ value: r, label: r }))} />
        <Input label="Sale To" value={form.saleTo} onChange={set("saleTo")} placeholder="Search student/employee..." />
        <Input label="Discount" value={form.discount} onChange={set("discount")} placeholder="0" />
        <Input label="Remarks" value={form.remarks} onChange={set("remarks")} />
      </div>
      <div>
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
          <div className="col-span-6">Product *</div>
          <div className="col-span-2">Qty *</div>
          <div className="col-span-3">Price *</div>
          <div className="col-span-1"></div>
        </div>
        {rows.map(row => (
          <div key={row.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
            <div className="col-span-6"><Input value={row.product} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, product: e.target.value } : x))} placeholder="Select product" /></div>
            <div className="col-span-2"><Input type="number" value={row.qty} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, qty: e.target.value } : x))} /></div>
            <div className="col-span-3"><Input value={row.price} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, price: e.target.value } : x))} placeholder="0" /></div>
            <div className="col-span-1"><button onClick={() => setRows(r => r.filter(x => x.id !== row.id))} className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center text-xs">✕</button></div>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={addRow}>+ Add Row</Button>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { alert("Sale saved!"); onCancel(); }}>✚ Save</Button>
      </div>
    </div>
  );
}

export default function SalesPage() {
  usePageTitle("Sales");
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [data] = useState(SAMPLE_SALES);

  const filtered = data.filter(r =>
    !search || r.saleTo.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search)
  );

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors
        ${tab === id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
      {id === "list" ? "☰" : "✏"} {label}
    </button>
  );

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Sales management" icon="📈" />
      <Card>
        <div className="flex border-b border-slate-100">
          <TabBtn id="list" label="Sales List" />
          <TabBtn id="add" label="Add Sales" />
        </div>
        {tab === "list" ? (
          <>
            <div className="p-4 flex justify-end">
              <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Bill No","Role","Sale To","Payment Status","Date","Net Payable","Paid","Due","Remarks","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.id}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.role}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.saleTo || "—"}</td>
                      <td className="px-4 py-3"><PaymentBadge v={row.payment} /></td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.date}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.netPayable}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.paid}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.due}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">—</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded bg-slate-600 text-white flex items-center justify-center text-xs">≡</button>
                          <button className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center text-xs">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Showing 1 to {filtered.length} of {filtered.length} entries</span>
              <div className="flex gap-1">
                <Button size="xs" variant="secondary">‹</Button>
                <Button size="xs">1</Button>
                <Button size="xs" variant="secondary">›</Button>
              </div>
            </div>
          </>
        ) : (
          <AddSalesForm onCancel={() => setTab("list")} />
        )}
      </Card>
    </div>
  );
}
