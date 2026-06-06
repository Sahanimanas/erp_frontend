/**
 * CustomFieldPage — Image 1
 * Tabs: Custom Field List | Add Custom Field
 * Add form: Custom Field For*, Field Label*, Field Label (type)*, Grid (Bootstrap Column)*,
 *            Order*, Default Value, checkboxes: This Field is Required? / Show on table / Active
 */
import { useState } from "react";
import { Edit2, Trash2, Plus, Search } from "lucide-react";

const inp = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";

function F({ label, req, children }) {
  return (
    <div className="grid grid-cols-3 items-start gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium pt-2 text-right">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

function AddCustomField({ onSave, onCancel }) {
  const [form, setForm] = useState({
    fieldFor:"", fieldLabel:"", fieldType:"", gridCol:"",
    order:"", defaultValue:"", required:false, showOnTable:false, active:true
  });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  return (
    <div className="max-w-2xl">
      <F label="Custom Field For" req>
        <select className={sel} value={form.fieldFor} onChange={set("fieldFor")}>
          <option value="">Select</option>
          <option>Student</option><option>Employee</option><option>Parent</option>
          <option>Admission</option><option>Guardian</option>
        </select>
      </F>
      <F label="Field Label" req>
        <input className={inp} value={form.fieldLabel} onChange={set("fieldLabel")} placeholder="Enter field label"/>
      </F>
      <F label="Field Label" req>
        <select className={sel} value={form.fieldType} onChange={set("fieldType")}>
          <option value="">Select</option>
          <option>Text</option><option>Number</option><option>Date</option>
          <option>Dropdown</option><option>Textarea</option><option>File</option><option>Checkbox</option>
        </select>
      </F>
      <F label="Grid (Bootstrap Column)" req>
        <select className={sel} value={form.gridCol} onChange={set("gridCol")}>
          <option value="">Select</option>
          {[1,2,3,4,6,12].map(c=><option key={c}>col-md-{c}</option>)}
        </select>
      </F>
      <F label="Order" req>
        <input className={inp} type="number" min="1" value={form.order} onChange={set("order")} placeholder="Display order"/>
      </F>
      <F label="Default Value">
        <input className={inp} value={form.defaultValue} onChange={set("defaultValue")} placeholder="Optional default value"/>
      </F>
      <div className="grid grid-cols-3 items-start gap-4 mb-6">
        <div/>
        <div className="col-span-2 space-y-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.required} onChange={e=>setForm(p=>({...p,required:e.target.checked}))} className="rounded"/>
            <span className="text-sm text-slate-600">This Field is Required ?</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.showOnTable} onChange={e=>setForm(p=>({...p,showOnTable:e.target.checked}))} className="rounded"/>
            <span className="text-sm text-slate-600">Show on table</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} className="rounded accent-amber-500"/>
            <span className="text-sm text-slate-600 font-medium">Active</span>
          </label>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={onCancel} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
        <button onClick={()=>{if(!form.fieldFor||!form.fieldLabel||!form.fieldType||!form.gridCol||!form.order)return;onSave(form);}}
          className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
          <Plus size={13}/> Save
        </button>
      </div>
    </div>
  );
}

export default function CustomFieldPage() {
  const [tab, setTab] = useState("list");
  const [fields, setFields] = useState([]);
  const [search, setSearch] = useState("");

  const filtered = fields.filter(f => !search ||
    f.fieldLabel.toLowerCase().includes(search.toLowerCase()) ||
    f.fieldFor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">Custom Field</h1>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 border-b border-slate-100 flex gap-0">
          {[{k:"list",l:"Custom Field List",i:"☰"},{k:"add",l:"Add Custom Field",i:"✎"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              {t.i} {t.l}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab==="list" ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="flex gap-2">
                  {["©","C","E","P","🖨","⊞"].map((ic,i)=>(
                    <button key={i} className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded text-slate-500 hover:bg-slate-50 text-xs font-bold">{ic}</button>
                  ))}
                </div>
                <div className="relative">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
                    className="pl-7 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"/>
                </div>
              </div>
              <div className="border border-slate-100 rounded-xl overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-slate-50">
                    {["SL","CUSTOM FIELD FOR","FIELD LABEL","FIELD TYPE","GRID COLUMN","ORDER","REQUIRED","ACTIVE","ACTION"].map(h=>(
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">{h}</th>
                    ))}
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.length===0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                    ) : filtered.map((r,i)=>(
                      <tr key={r.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3 text-slate-500">{i+1}</td>
                        <td className="px-4 py-3 text-slate-700">{r.fieldFor}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{r.fieldLabel}</td>
                        <td className="px-4 py-3 text-slate-600">{r.fieldType}</td>
                        <td className="px-4 py-3 text-slate-600">{r.gridCol}</td>
                        <td className="px-4 py-3 text-slate-600">{r.order}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.required?"bg-indigo-100 text-indigo-700":"bg-slate-100 text-slate-600"}`}>{r.required?"Yes":"No"}</span></td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${r.active?"bg-emerald-100 text-emerald-700":"bg-red-100 text-red-600"}`}>{r.active?"Active":"Inactive"}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                            <button onClick={()=>setFields(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
                <span>Showing 0 to {filtered.length} of {filtered.length} entries</span>
                <div className="flex gap-1">
                  <button className="p-1 rounded hover:bg-slate-100">‹</button>
                  <button className="p-1 rounded hover:bg-slate-100">›</button>
                </div>
              </div>
            </>
          ) : (
            <AddCustomField
              onSave={f=>{setFields(p=>[...p,{id:Date.now(),...f}]);setTab("list");}}
              onCancel={()=>setTab("list")}
            />
          )}
        </div>
      </div>
    </div>
  );
}
