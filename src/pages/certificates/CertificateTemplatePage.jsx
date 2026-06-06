/**
 * CertificateTemplatePage.jsx
 * Module : certificates
 * Page   : Certificate Template List + Add Certificate — matches screenshot 9
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, SearchInput } from "../../components/ui";

const SAMPLE_CERTS = [
  { id: 1, name: "TC", applicableUser: "Student", layout: "A4 (Portrait)", bgImage: true, createdAt: "05.Feb.2026" },
];

const USERS = ["Student", "Employee"];
const LAYOUTS = ["A4 (Portrait)", "A4 (Landscape)", "A5 (Portrait)", "A5 (Landscape)"];

function AddCertForm({ onCancel }) {
  const [form, setForm] = useState({ name: "", user: "", layout: "", bgImage: null });
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  return (
    <div className="p-5 space-y-4 max-w-xl">
      <Input label="Certificate Name *" value={form.name} onChange={set("name")} required />
      <Select label="Applicable User *" value={form.user} onChange={set("user")} options={USERS.map(u => ({ value: u, label: u }))} />
      <Select label="Page Layout *" value={form.layout} onChange={set("layout")} options={LAYOUTS.map(l => ({ value: l, label: l }))} />
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Background Image</label>
        <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-8 cursor-pointer">
          <span className="text-3xl">🖼</span>
          <span className="text-sm text-slate-500">Click to upload background image</span>
          <input type="file" accept="image/*" className="hidden" onChange={e => setForm(f => ({ ...f, bgImage: e.target.files[0] }))} />
        </label>
      </div>
      <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { alert("Certificate template saved!"); onCancel(); }}>Save</Button>
      </div>
    </div>
  );
}

export default function CertificateTemplatePage() {
  usePageTitle("Certificate Template");
  const [tab, setTab] = useState("list");
  const [search, setSearch] = useState("");
  const [data] = useState(SAMPLE_CERTS);

  const TabBtn = ({ id, label }) => (
    <button onClick={() => setTab(id)}
      className={`flex items-center gap-1.5 px-4 py-3 text-[12px] font-semibold border-b-2 transition-colors
        ${tab === id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
      {id === "list" ? "☰" : "✏"} {label}
    </button>
  );

  return (
    <div>
      <PageHeader title="Certificate Template" subtitle="Manage certificate templates" icon="📜" />
      <Card>
        <div className="flex border-b border-slate-100">
          <TabBtn id="list" label="Certificate List" />
          <TabBtn id="add" label="Add Certificate" />
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
                    {["SL","Certificate Name","Applicable User","Page Layout","Background Image","Created At","Action"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase())).map((row, i) => (
                    <tr key={row.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{i + 1}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700 font-medium">{row.name}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.applicableUser}</td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.layout}</td>
                      <td className="px-4 py-3">
                        {row.bgImage && (
                          <div className="w-10 h-8 rounded border border-slate-200 bg-blue-50 flex items-center justify-center text-blue-500">🖼</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.createdAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded bg-slate-600 text-white flex items-center justify-center text-xs">☰</button>
                          <button className="w-7 h-7 rounded bg-slate-500 text-white flex items-center justify-center text-xs">✏</button>
                          <button className="w-7 h-7 rounded bg-red-600 text-white flex items-center justify-center text-xs">🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Showing 1 to {data.length} of {data.length} entries</span>
              <div className="flex gap-1">
                <Button size="xs" variant="secondary">‹</Button>
                <Button size="xs">1</Button>
                <Button size="xs" variant="secondary">›</Button>
              </div>
            </div>
          </>
        ) : (
          <AddCertForm onCancel={() => setTab("list")} />
        )}
      </Card>
    </div>
  );
}
