/**
 * GenerateAdmitCardPage.jsx — Image 1
 * URL: /cards/admit-generate
 * Select Ground: Class*, Section*, Exam*, Template* → Filter button
 */
import { useState } from "react";
import { Filter } from "lucide-react";

const sel = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-indigo-400";
const CLASSES = ["Play","Nursery","LKG","UKG",...Array.from({length:12},(_,i)=>`Class ${i+1}`)];
const EXAMS   = ["Mid Term 2026","Annual Exam 2026","Unit Test 1","Unit Test 2","Pre-Board"];

export default function GenerateAdmitCardPage() {
  const [cls, setCls] = useState(""); const [sec, setSec] = useState("");
  const [exam, setExam] = useState(""); const [tmpl, setTmpl] = useState("");
  const [filtered, setFiltered] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-base">🏠</div>
        <h1 className="text-[15px] font-bold text-slate-800">Admit Card Generate</h1>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Select Ground</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Class <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={cls} onChange={e=>{setCls(e.target.value);setSec("")}}>
              <option value="">Select</option>
              {CLASSES.map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Section <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={sec} onChange={e=>setSec(e.target.value)}>
              <option value="">Select Class First</option>
              {cls && ["A","B","C","D"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Exam <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={exam} onChange={e=>setExam(e.target.value)}>
              <option value="">Select</option>
              {EXAMS.map(e=><option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Template <span className="text-red-500 normal-case">*</span></label>
            <select className={sel} value={tmpl} onChange={e=>setTmpl(e.target.value)}>
              <option value="">Select</option>
              <option>Default Admit Card</option><option>Custom Template 1</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={()=>setFiltered(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm"
          >
            <Filter size={13}/> Filter
          </button>
        </div>
      </div>

      {filtered && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">
          {cls && sec && exam && tmpl
            ? "No students found for the selected criteria. Please verify class, section, exam and template selection."
            : "Please select all required fields (Class, Section, Exam, Template) and click Filter."}
        </div>
      )}
    </div>
  );
}
