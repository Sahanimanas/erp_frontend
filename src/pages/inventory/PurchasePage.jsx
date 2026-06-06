/**
 * PurchasePage.jsx
 * Module : inventory
 * Page   : Purchase List + Add Purchase — matches screenshot 2
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Badge, SearchInput } from "../../components/ui";

const SAMPLE_PURCHASES = [
  { id: 1339, supplier: "NAYA JEEVAN CENTRE", status: "Received", payment: "Partly Paid", date: "28.Mar.2026", netPayable: "₹130320.00", paid: "₹0.00", due: "₹130320.00", remarks: "" },
  { id: 1281, supplier: "NAYA JEEVAN CENTRE", status: "Received", payment: "Unpaid",      date: "25.Mar.2026", netPayable: "₹1231880.00", paid: "₹0.00", due: "₹1231880.00", remarks: "" },
  { id: 1393, supplier: "BOOKS WORLD",        status: "Received", payment: "Partly Paid", date: "23.Mar.2026", netPayable: "₹506045.00",  paid: "₹0.00", due: "₹506045.00",  remarks: "" },
  { id: 895,  supplier: "BOOKS WORLD",        status: "Received", payment: "Partly Paid", date: "23.Mar.2026", netPayable: "₹244950.30",  paid: "₹0.00", due: "₹244950.30",  remarks: "" },
  { id: 896,  supplier: "BOOKS WORLD",        status: "Received", payment: "Unpaid",      date: "23.Mar.2026", netPayable: "₹140760.00",  paid: "₹0.00", due: "₹140760.00",  remarks: "" },
  { id: 926,  supplier: "BOOKS WORLD",        status: "Received", payment: "Unpaid",      date: "28.Mar.2026", netPayable: "₹131220.00",  paid: "₹0.00", due: "₹131220.00",  remarks: "" },
];

const SUPPLIERS = ["NAYA JEEVAN CENTRE", "BOOKS WORLD"];

function PaymentBadge({ v }) {
  const variant = v === "Total Paid" ? "success" : v === "Partly Paid" ? "warning" : "danger";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border
      ${v === "Total Paid" ? "text-emerald-700 border-emerald-400 bg-white" :
        v === "Partly Paid" ? "text-amber-700 border-amber-400 bg-white" :
        "text-red-700 border-red-400 bg-white"}`}>
      {v}
    </span>
  );
}

function AddPurchaseForm({ onCancel }) {
  const [rows, setRows] = useState([{ id: 1, product: "", qty: 1, unit: "", price: "" }]);
  const [form, setForm] = useState({ supplier: "", date: new Date().toISOString().split("T")[0], billNo: "", discount: "", shipping: "", remarks: "" });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addRow = () => setRows(r => [...r, { id: Date.now(), product: "", qty: 1, unit: "", price: "" }]);
  const removeRow = (id) => setRows(r => r.filter(x => x.id !== id));

  return (
    <div className="p-5 space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select label="Supplier *" value={form.supplier} onChange={set("supplier")}
          options={SUPPLIERS.map(s => ({ value: s, label: s }))} />
        <Input label="Bill No *" value={form.billNo} onChange={set("billNo")} />
        <Input label="Date *" type="date" value={form.date} onChange={set("date")} />
        <Input label="Discount" value={form.discount} onChange={set("discount")} placeholder="0" />
        <Input label="Shipping Cost" value={form.shipping} onChange={set("shipping")} placeholder="0" />
        <Input label="Remarks" value={form.remarks} onChange={set("remarks")} />
      </div>

      {/* Product rows */}
      <div>
        <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 mb-1">
          <div className="col-span-5">Product *</div>
          <div className="col-span-2">Qty *</div>
          <div className="col-span-2">Unit</div>
          <div className="col-span-2">Price *</div>
          <div className="col-span-1"></div>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-12 gap-2 mb-2 items-center">
            <div className="col-span-5"><Input value={row.product} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, product: e.target.value } : x))} placeholder="Select product" /></div>
            <div className="col-span-2"><Input type="number" value={row.qty} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, qty: e.target.value } : x))} /></div>
            <div className="col-span-2"><Input value={row.unit} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, unit: e.target.value } : x))} placeholder="Piece" /></div>
            <div className="col-span-2"><Input value={row.price} onChange={e => setRows(r => r.map(x => x.id === row.id ? { ...x, price: e.target.value } : x))} placeholder="0" /></div>
            <div className="col-span-1"><button onClick={() => removeRow(row.id)} className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs">✕</button></div>
          </div>
        ))}
        <Button size="sm" variant="secondary" onClick={addRow}>+ Add Row</Button>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { alert("Purchase saved!"); onCancel(); }}>✚ Save</Button>
      </div>
    </div>
  );
}

export default function PurchasePage() {
  usePageTitle("Purchase");
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [data] = useState(SAMPLE_PURCHASES);

  const filtered = data.filter(r =>
    !search || r.supplier.toLowerCase().includes(search.toLowerCase()) || String(r.id).includes(search)
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
      <PageHeader title="Inventory" subtitle="Purchase management" icon="🛒" />
      <Card>
        <div className="flex border-b border-slate-100">
          <TabBtn id="list" label="Purchase List" />
          <TabBtn id="add" label="Add Purchase" />
        </div>
        {tab === "list" ? (
          <>
            <div className="p-4 flex justify-end">
              <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Bill No","Supplier Name","Purchase Status","Payment Status","Purchase Date","Net Payable","Paid","Due","Remarks","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(row => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.id}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.supplier}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.status}</td>
                      <td className="px-4 py-3"><PaymentBadge v={row.payment} /></td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.date}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.netPayable}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.paid}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.due}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.remarks || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded bg-slate-600 hover:bg-slate-700 text-white flex items-center justify-center text-xs">≡</button>
                          <button className="w-7 h-7 rounded bg-slate-500 hover:bg-slate-600 text-white flex items-center justify-center text-xs">✏</button>
                          <button className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs">🗑</button>
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
          <AddPurchaseForm onCancel={() => setTab("list")} />
        )}
      </Card>
    </div>
  );
}
