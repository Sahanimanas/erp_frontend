/**
 * VisitorLogPage.jsx
 * URL: /reception/visitor-log
 * Images 13 (Add Visitor form) & 14 (Visitor List table)
 */
import { useState } from "react";
import {
  Copy, FileText, FileDown, Printer,
  Search, Eye, Edit2, Trash2, Plus, ChevronLeft, ChevronRight
} from "lucide-react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

const NOW_DATE = "2026-05-27";
const NOW_TIME = "3:23 PM";

const VISITING_PURPOSES = ["Admission Enquiry", "Meeting with Teacher", "Official Work", "Personal Visit", "Parent Meeting", "Other"];

function ExportBar({ search, setSearch }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex gap-1">
        {[Copy, FileText, FileDown, FileDown, Printer].map((Icon, i) => (
          <button key={i} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Icon size={13} /></button>
        ))}
        <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 text-xs font-bold">⊞</button>
      </div>
      <div className="relative">
        <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="pl-8 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"
        />
      </div>
    </div>
  );
}

function Field({ label, req, children }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium pt-2 text-right">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function AddVisitorForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    visitingPurpose: "", name: "", mobile: "",
    date: NOW_DATE, entryTime: "15:23", exitTime: "15:23",
    numVisitors: "", idNumber: "", tokenPass: "", note: ""
  });
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-2xl">
      <Field label="Visiting Purpose" req>
        <select className={sel} value={form.visitingPurpose} onChange={set("visitingPurpose")}>
          <option value="">Select</option>
          {VISITING_PURPOSES.map(p => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Name" req>
        <input className={inp} value={form.name} onChange={set("name")} />
      </Field>
      <Field label="Mobile No">
        <input className={inp} value={form.mobile} onChange={set("mobile")} />
      </Field>
      <Field label="Date" req>
        <div className="flex">
          <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400 text-base">📅</span>
          <input className={inp + " rounded-l-none"} type="date" value={form.date} onChange={set("date")} />
        </div>
      </Field>
      <Field label="Entry Time" req>
        <div className="flex">
          <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400 text-base">🕐</span>
          <input className={inp + " rounded-l-none"} type="time" value={form.entryTime} onChange={set("entryTime")} />
        </div>
      </Field>
      <Field label="Exit Time" req>
        <div className="flex">
          <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400 text-base">🕐</span>
          <input className={inp + " rounded-l-none"} type="time" value={form.exitTime} onChange={set("exitTime")} />
        </div>
      </Field>
      <Field label="Number Of Visitor" req>
        <input className={inp} type="number" min="1" value={form.numVisitors} onChange={set("numVisitors")} />
      </Field>
      <Field label="Id Number">
        <input className={inp} value={form.idNumber} onChange={set("idNumber")} />
      </Field>
      <Field label="Token/pass">
        <input className={inp} value={form.tokenPass} onChange={set("tokenPass")} />
      </Field>
      <Field label="Note">
        <textarea className={inp} rows={3} value={form.note} onChange={set("note")} />
      </Field>
      <div className="flex justify-center gap-3 mt-4">
        <button onClick={onCancel} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
        <button
          onClick={() => { if (!form.visitingPurpose || !form.name || !form.numVisitors) return; onSave(form); }}
          className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg"
        >
          <Plus size={13} /> Save
        </button>
      </div>
    </div>
  );
}

const COLS = ["SL","NAME","VISITING PURPOSE","DATE","ENTRY TIME","EXIT TIME","NUMBER OF VISITOR","TOKEN/PASS","NOTE","ACTION"];

export default function VisitorLogPage() {
  const [tab, setTab] = useState("list");
  const [visitors, setVisitors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 25;

  const filtered = visitors.filter(v =>
    !search ||
    v.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.visitingPurpose?.toLowerCase().includes(search.toLowerCase())
  );
  const total = Math.max(1, Math.ceil(filtered.length / PER));
  const rows = filtered.slice((page - 1) * PER, page * PER);

  const handleSave = (form) => {
    const t = v => v?.replace(":", "") ? new Date(`2000-01-01 ${v}`).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : v;
    setVisitors(p => [...p, { ...form, id: Date.now(), entryTime: t(form.entryTime), exitTime: t(form.exitTime) }]);
    setTab("list");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">Visitor Log</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        {/* Tab bar */}
        <div className="px-5 border-b border-slate-100 flex gap-0">
          {[{ k: "list", l: "Visitor List", i: "☰" }, { k: "add", l: "Add Visitor", i: "✎" }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab === t.k ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <span className="text-xs">{t.i}</span> {t.l}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "list" ? (
            <>
              <ExportBar search={search} setSearch={setSearch} />
              <div className="border border-slate-100 rounded-xl overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="bg-slate-50">
                      {COLS.map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.length === 0 ? (
                      <tr><td colSpan={COLS.length} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                    ) : rows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-slate-500">{(page-1)*PER+i+1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.visitingPurpose}</td>
                        <td className="px-4 py-3 text-slate-600">{r.date}</td>
                        <td className="px-4 py-3 text-slate-600">{r.entryTime}</td>
                        <td className="px-4 py-3 text-slate-600">{r.exitTime}</td>
                        <td className="px-4 py-3 text-slate-600">{r.numVisitors}</td>
                        <td className="px-4 py-3 text-slate-600">{r.tokenPass || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 max-w-[120px] truncate">{r.note || "—"}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded hover:bg-indigo-50 text-indigo-600"><Eye size={13}/></button>
                            <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                            <button onClick={() => setVisitors(p => p.filter(x => x.id !== r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Showing {filtered.length === 0 ? 0 : (page-1)*PER+1} to {Math.min(page*PER, filtered.length)} of {filtered.length} entries</span>
                <div className="flex items-center gap-2">
                  <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"><option>25</option><option>50</option><option>100</option></select>
                  <span>rows per page</span>
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={14}/></button>
                  {[...Array(total)].map((_,i) => (
                    <button key={i} onClick={() => setPage(i+1)} className={`w-7 h-7 rounded text-[11px] font-semibold ${page===i+1?"bg-indigo-600 text-white":"hover:bg-slate-100 text-slate-600"}`}>{i+1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(total,p+1))} disabled={page===total} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={14}/></button>
                </div>
              </div>
            </>
          ) : (
            <AddVisitorForm onSave={handleSave} onCancel={() => setTab("list")} />
          )}
        </div>
      </div>
    </div>
  );
}
