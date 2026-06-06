/**
 * CreditCardTemplatePage.jsx — Image 4 (Add Id Card) & Image 6 (Id Card List)
 * URL: /cards/id-template
 * List columns: SL, NAME, APPLICABLE USER, PAGE LAYOUT, BACKGROUND IMAGE, CREATED AT, ACTION
 * Add form: Id Card Name*, Applicable User*, Page Layout*, User Photo Style*, Layout Spacing*, Signature/Logo/Background images, Certificate Content* (rich editor)
 */
import { useState } from "react";
import {
  Copy, FileText, FileDown, Printer,
  Search, Edit2, Trash2, Plus, AlignJustify,
  ChevronLeft, ChevronRight
} from "lucide-react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

const TOOLBAR_ITEMS = ["⚡▾","Arial▾","14▾","T▾","B","I","U","abc","A","▾","≡","≡","☰","🔗","⊞","✕","↩","</>"];

function RichTextEditor({ value, onChange }) {
  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-0.5 p-2 bg-slate-50 border-b border-slate-200">
        {TOOLBAR_ITEMS.map((t, i) => (
          <button key={i} type="button" className="px-1.5 py-1 text-xs hover:bg-slate-200 rounded font-medium text-slate-600 transition-colors min-w-[24px]">{t}</button>
        ))}
      </div>
      <textarea
        className="w-full px-3 py-2 text-sm focus:outline-none min-h-[140px] resize-y"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="Enter certificate/ID card content here..."
      />
    </div>
  );
}

function Field({ label, req, full = false, children }) {
  return (
    <div className={`grid gap-4 mb-4 items-start ${full ? "grid-cols-1" : "grid-cols-3"}`}>
      {!full && (
        <label className="text-sm text-slate-600 font-medium pt-2 text-right">
          {label}{req && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      {full && (
        <label className="text-sm text-slate-600 font-medium">
          {label}{req && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className={full ? "" : "col-span-2"}>{children}</div>
    </div>
  );
}

function FileField({ label }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium text-right">{label}</label>
      <div className="col-span-2 flex gap-2 items-center">
        <input readOnly className={inp + " flex-1 cursor-pointer bg-slate-50"} value="" placeholder="No file chosen" />
        <button type="button" className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg whitespace-nowrap">Select file</button>
      </div>
    </div>
  );
}

function AddCreditCardForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name:"", applicableUser:"", width:"", height:"", photoStyle:"Square", photoSize:"", topSpace:"", bottomSpace:"", rightSpace:"", leftSpace:"" });
  const [content, setContent] = useState("");
  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  return (
    <div className="max-w-3xl">
      <div className="grid grid-cols-3 items-center gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right">Id Card Name <span className="text-red-500">*</span></label>
        <div className="col-span-2"><input className={inp} value={form.name} onChange={set("name")} /></div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right">Applicable User <span className="text-red-500">*</span></label>
        <div className="col-span-2">
          <select className={sel} value={form.applicableUser} onChange={set("applicableUser")}>
            <option value="">Select</option>
            <option>Student</option><option>Employee</option><option>Parent</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right">Page Layout <span className="text-red-500">*</span></label>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <input className={inp} placeholder="Layout Width (mm)" value={form.width} onChange={set("width")} />
          <input className={inp} placeholder="Layout Height (mm)" value={form.height} onChange={set("height")} />
        </div>
      </div>

      <div className="grid grid-cols-3 items-center gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right">User Photo Style <span className="text-red-500">*</span></label>
        <div className="col-span-2 grid grid-cols-2 gap-2">
          <select className={sel} value={form.photoStyle} onChange={set("photoStyle")}>
            <option>Square</option><option>Circle</option><option>Rounded</option>
          </select>
          <input className={inp} placeholder="Photo Size (px)" value={form.photoSize} onChange={set("photoSize")} />
        </div>
      </div>

      <div className="grid grid-cols-3 items-start gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right pt-2">Layout Spacing <span className="text-red-500">*</span></label>
        <div className="col-span-2 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} placeholder="Top Space (px)"    value={form.topSpace}    onChange={set("topSpace")} />
            <input className={inp} placeholder="Bottom Space (px)" value={form.bottomSpace} onChange={set("bottomSpace")} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input className={inp} placeholder="Right Space (px)"  value={form.rightSpace}  onChange={set("rightSpace")} />
            <input className={inp} placeholder="Left Space (px)"   value={form.leftSpace}   onChange={set("leftSpace")} />
          </div>
        </div>
      </div>

      <FileField label="Signature Image" />
      <FileField label="Logo Image" />
      <FileField label="Background Image" />

      <div className="grid grid-cols-3 items-start gap-4 mb-4">
        <label className="text-sm text-slate-600 font-medium text-right pt-2">Certificate Content <span className="text-red-500">*</span></label>
        <div className="col-span-2">
          <RichTextEditor value={content} onChange={setContent} />
        </div>
      </div>

      <div className="flex justify-center gap-3 mt-6">
        <button onClick={onCancel} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
        <button
          onClick={() => { if (!form.name || !form.applicableUser) return; onSave(form, content); }}
          className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm"
        >
          <Plus size={13} /> Save
        </button>
      </div>
    </div>
  );
}

const INIT_DATA = [
  { id:1, name:"Templete1", applicableUser:"Student", width:54, height:85, hasBg:true,  createdAt:"13.Aug.2025" },
  { id:2, name:"Templete2", applicableUser:"Student", width:56, height:86, hasBg:true,  createdAt:"14.Aug.2025" },
];

export default function CreditCardTemplatePage() {
  const [tab, setTab] = useState("list");
  const [templates, setTemplates] = useState(INIT_DATA);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 25;

  const filtered = templates.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const total = Math.max(1, Math.ceil(filtered.length / PER));
  const rows  = filtered.slice((page-1)*PER, page*PER);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">Id Card Templete</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 border-b border-slate-100 flex gap-0">
          {[{k:"list",l:"Id Card List",i:"☰"},{k:"add",l:"Add Id Card",i:"✎"}].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab===t.k ? "border-amber-500 text-amber-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
              <span className="text-xs">{t.i}</span> {t.l}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "list" ? (
            <>
              {/* Export bar */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1">
                  {[Copy,FileText,FileDown,FileDown,Printer].map((Icon,i)=>(
                    <button key={i} className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><Icon size={13}/></button>
                  ))}
                  <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500 text-xs font-bold">⊞</button>
                </div>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                    className="pl-8 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"/>
                </div>
              </div>

              <div className="border border-slate-100 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      {["SL","NAME","APPLICABLE USER","PAGE LAYOUT","BACKGROUND IMAGE","CREATED AT","ACTION"].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {rows.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                    ) : rows.map((r, i) => (
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-slate-500">{(page-1)*PER+i+1}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                        <td className="px-4 py-3 text-slate-600">{r.applicableUser}</td>
                        <td className="px-4 py-3 text-slate-600">
                          Width <strong>{r.width}mm</strong> x Height <strong>{r.height}mm</strong>
                        </td>
                        <td className="px-4 py-3">
                          {r.hasBg ? (
                            <div className="w-12 h-9 bg-blue-100 border border-blue-300 rounded flex items-center justify-center text-blue-400 text-xl">🖼</div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">{r.createdAt}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600"><AlignJustify size={13}/></button>
                            <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                            <button onClick={() => setTemplates(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Showing {filtered.length===0?0:(page-1)*PER+1} to {Math.min(page*PER,filtered.length)} of {filtered.length} entries</span>
                <div className="flex items-center gap-2">
                  <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"><option>25</option><option>50</option></select>
                  <span>rows per page</span>
                  <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={14}/></button>
                  {[...Array(total)].map((_,i)=>(
                    <button key={i} onClick={()=>setPage(i+1)} className={`w-7 h-7 rounded text-[11px] font-semibold ${page===i+1?"bg-indigo-600 text-white":"hover:bg-slate-100 text-slate-600"}`}>{i+1}</button>
                  ))}
                  <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={14}/></button>
                </div>
              </div>
            </>
          ) : (
            <AddCreditCardForm
              onSave={(form, content) => {
                setTemplates(p => [...p, { id: Date.now(), name: form.name, applicableUser: form.applicableUser, width: parseInt(form.width)||54, height: parseInt(form.height)||85, hasBg: false, createdAt: "27.May.2026" }]);
                setTab("list");
              }}
              onCancel={() => setTab("list")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
