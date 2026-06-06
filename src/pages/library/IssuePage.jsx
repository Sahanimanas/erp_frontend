/**
 * IssuePage.jsx — Image 20: Library Category
 * Add Book Category form (left) + Book Category List (right)
 * Columns: SL, BRANCH, NAME, ACTION — "No Information Available" in red
 */
import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { inp, PageTitle, Card2 } from "../_shared";

export default function IssuePage() {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);

  const save = () => {
    if (!name.trim()) return;
    setCategories(p => [...p, { id: Date.now(), branch:"GenEduServe", name: name.trim() }]);
    setName("");
  };

  return (
    <div>
      <PageTitle title="Category"/>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Add Form */}
        <Card2 className="p-5 h-fit">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Edit2 size={14}/> Add Book Category
          </h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
              Category Name <span className="text-red-500 normal-case">*</span>
            </label>
            <input className={inp} value={name} onChange={e=>setName(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&save()} placeholder="Enter category name"/>
          </div>
          <div className="flex justify-center">
            <button onClick={save} className="flex items-center gap-2 px-5 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
              <Plus size={13}/> Save
            </button>
          </div>
        </Card2>

        {/* List */}
        <Card2>
          <div className="px-5 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700 flex items-center gap-2">
            ☰ Book Category List
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {["SL","BRANCH","NAME","ACTION"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {categories.length===0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm font-semibold text-red-400">No Information Available</td></tr>
                ) : categories.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i+1}</td>
                    <td className="px-4 py-3 text-slate-700">{r.branch}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                        <button onClick={()=>setCategories(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card2>
      </div>
    </div>
  );
}
