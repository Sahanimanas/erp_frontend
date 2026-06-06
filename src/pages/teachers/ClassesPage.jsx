/**
 * ClassesPage.jsx — Image 1: Assign Class Teacher
 * Two panels: Class Teacher Allocation form (left) + Class Teacher List (right)
 */
import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { inp, sel, PageTitle, Card2, CLASSES, SECTIONS } from "../_shared";

const TEACHERS = ["Amit Kumar","Priya Sharma","Suresh Singh","Neha Gupta","Rajesh Verma","Anita Yadav"];

export default function ClassesPage() {
  const [cls, setCls] = useState("");
  const [sec, setSec] = useState("");
  const [teacher, setTeacher] = useState("");
  const [list, setList] = useState([]);

  const save = () => {
    if (!cls || !sec || !teacher) return;
    setList(p => [...p, { id: Date.now(), branch:"GenEduServe", teacher, class: cls, section: sec }]);
    setCls(""); setSec(""); setTeacher("");
  };

  return (
    <div>
      <PageTitle title="Assign Class Teacher" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Allocation form */}
        <Card2 className="p-5">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-4">
            <Edit2 size={14}/> Class Teacher Allocation
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Class <span className="text-red-500 normal-case">*</span>
              </label>
              <select className={sel} value={cls} onChange={e=>{setCls(e.target.value);setSec("")}}>
                <option value="">Select</option>
                {CLASSES.map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Section <span className="text-red-500 normal-case">*</span>
              </label>
              <select className={sel} value={sec} onChange={e=>setSec(e.target.value)}>
                <option value="">Select Class First</option>
                {cls && SECTIONS.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                Class Teacher <span className="text-red-500 normal-case">*</span>
              </label>
              <select className={sel} value={teacher} onChange={e=>setTeacher(e.target.value)}>
                <option value="">Select</option>
                {TEACHERS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <button onClick={save} className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
              <Plus size={13}/> Save
            </button>
          </div>
        </Card2>

        {/* Right: List */}
        <Card2>
          <div className="px-5 py-4 border-b border-slate-100 text-sm font-semibold text-slate-700 flex items-center gap-2">
            ☰ Class Teacher List
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {["#","BRANCH","CLASS TEACHER","CLASS","SECTION","ACTION"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {list.length===0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm font-semibold text-red-400">No Information Available</td></tr>
                ) : list.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i+1}</td>
                    <td className="px-4 py-3 text-slate-700">{r.branch}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.teacher}</td>
                    <td className="px-4 py-3 text-slate-600">{r.class}</td>
                    <td className="px-4 py-3 text-slate-600">{r.section}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                        <button onClick={()=>setList(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
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
