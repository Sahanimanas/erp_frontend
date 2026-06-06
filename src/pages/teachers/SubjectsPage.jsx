/**
 * SubjectsPage.jsx — Images 2, 3, 4
 * Tabs: Subject List | Create Subject
 * List cols: SL, BRANCH, SUBJECT NAME, SUBJECT CODE, SUBJECT TYPE, SUBJECT AUTHOR, ACTION
 * Create form: Subject Name*, Subject Code*, Subject Author, Subject Type* (Theory default)
 */
import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { inp, sel, PageTitle, Card2, TabBar, ExportBar, Pagination } from "../_shared";

const INIT_SUBJECTS = [
  { id:1, branch:"GenEduServe", name:"ENGLISH",               code:"301", type:"Theory", author:"" },
  { id:2, branch:"GenEduServe", name:"HINDI",                 code:"302", type:"Theory", author:"" },
  { id:3, branch:"GenEduServe", name:"SANSKRIT/URDU",         code:"122", type:"Theory", author:"" },
  { id:4, branch:"GenEduServe", name:"ART, MUSIC, GAME & CRAFTS", code:"xxx", type:"Theory", author:"" },
  { id:5, branch:"GenEduServe", name:"DRAWING",               code:"XXX", type:"Theory", author:"" },
  { id:6, branch:"GenEduServe", name:"MATHS",                 code:"241", type:"Theory", author:"" },
  { id:7, branch:"GenEduServe", name:"COMPUTER",              code:"402", type:"Theory", author:"" },
  { id:8, branch:"GenEduServe", name:"SCIENCE",               code:"086", type:"Theory", author:"" },
  { id:9, branch:"GenEduServe", name:"G.K.",                  code:"XXX", type:"Theory", author:"" },
  { id:10, branch:"GenEduServe", name:"SST",                  code:"087", type:"Theory", author:"" },
];

function CreateForm({ onSave, onCancel }) {
  const [form, setForm] = useState({ name:"", code:"", author:"", type:"Theory" });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));

  const F = ({label,req,children}) => (
    <div className="grid grid-cols-3 items-center gap-4 mb-4">
      <label className="text-sm text-slate-600 font-medium text-right">{label}{req&&<span className="text-red-500 ml-0.5">*</span>}</label>
      <div className="col-span-2">{children}</div>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <F label="Subject Name" req><input className={inp} value={form.name} onChange={set("name")}/></F>
      <F label="Subject Code" req><input className={inp} value={form.code} onChange={set("code")}/></F>
      <F label="Subject Author"><input className={inp} value={form.author} onChange={set("author")}/></F>
      <F label="Subject Type" req>
        <select className={sel} value={form.type} onChange={set("type")}>
          <option>Theory</option><option>Practical</option><option>Both</option>
        </select>
      </F>
      <div className="flex justify-center gap-3 mt-2">
        <button onClick={onCancel} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
        <button onClick={()=>{if(!form.name||!form.code)return;onSave(form);}} className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
          <Plus size={13}/> Save
        </button>
      </div>
    </div>
  );
}

export default function SubjectsPage() {
  const [tab, setTab] = useState("list");
  const [subjects, setSubjects] = useState(INIT_SUBJECTS);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const PER = 25;

  const filtered = subjects.filter(s => !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.code.toLowerCase().includes(search.toLowerCase())
  );
  const total = Math.max(1, Math.ceil(filtered.length/PER));
  const rows = filtered.slice((page-1)*PER, page*PER);

  return (
    <div>
      <PageTitle title="Subject" />
      <Card2>
        <TabBar
          tabs={[{k:"list",l:"Subject List",i:"☰"},{k:"create",l:"Create Subject",i:"✎"}]}
          active={tab} onChange={setTab}
        />
        {tab==="list" ? (
          <div className="p-5">
            <ExportBar search={search} setSearch={setSearch}/>
            <div className="border border-slate-100 rounded-xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="bg-slate-50">
                  {["SL","BRANCH","SUBJECT NAME","SUBJECT CODE","SUBJECT TYPE","SUBJECT AUTHOR","ACTION"].map(h=>(
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100 whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {rows.map((r,i)=>(
                    <tr key={r.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-500">{(page-1)*PER+i+1}</td>
                      <td className="px-4 py-3 text-slate-700">{r.branch}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                      <td className="px-4 py-3 text-slate-600">{r.code}</td>
                      <td className="px-4 py-3 text-slate-600">{r.type}</td>
                      <td className="px-4 py-3 text-slate-500">{r.author||"—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                          <button onClick={()=>setSubjects(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} total={total} setPage={setPage} count={filtered.length}
              from={filtered.length===0?0:(page-1)*PER+1} to={Math.min(page*PER,filtered.length)}/>
          </div>
        ) : (
          <CreateForm
            onSave={f=>{setSubjects(p=>[...p,{id:Date.now(),branch:"GenEduServe",...f}]);setTab("list");}}
            onCancel={()=>setTab("list")}
          />
        )}
      </Card2>
    </div>
  );
}
