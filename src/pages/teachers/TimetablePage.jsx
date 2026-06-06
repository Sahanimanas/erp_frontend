/**
 * TimetablePage.jsx — Images 5 & 6
 * Image 5: Class Schedule — Class*, Section*, Filter, + Add Schedule button
 * Image 6: Teacher Schedule — Teacher*, Filter
 * Two sub-tabs: Class Schedule | Teacher Schedule
 */
import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { sel, PageTitle, Card2, CLASSES, SECTIONS } from "../_shared";

const TEACHERS = ["Amit Kumar","Priya Sharma","Suresh Singh","Neha Gupta","Rajesh Verma"];

function ClassSchedule() {
  const [cls, setCls] = useState(""); const [sec, setSec] = useState("");
  const [filtered, setFiltered] = useState(false);
  return (
    <div>
      <PageTitle title="Class Schedule" />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-600">Select Ground</h3>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg">
            <Plus size={12}/> Add Schedule
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              {cls && SECTIONS.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={()=>setFiltered(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
            <Filter size={13}/> Filter
          </button>
        </div>
      </div>
      {filtered && cls && sec && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">
          No schedule found for {cls} - Section {sec}. Click "Add Schedule" to create one.
        </div>
      )}
    </div>
  );
}

function TeacherSchedule() {
  const [teacher, setTeacher] = useState("");
  const [filtered, setFiltered] = useState(false);
  return (
    <div>
      <PageTitle title="Teacher Schedule" />
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
        <h3 className="text-sm font-semibold text-slate-600 mb-4">Select Ground</h3>
        <div className="max-w-md mx-auto">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Teacher <span className="text-red-500 normal-case">*</span></label>
          <select className={sel} value={teacher} onChange={e=>setTeacher(e.target.value)}>
            <option value="">Select</option>
            {TEACHERS.map(t=><option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="flex justify-end mt-4">
          <button onClick={()=>setFiltered(true)} className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
            <Filter size={13}/> Filter
          </button>
        </div>
      </div>
      {filtered && teacher && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-8 text-center text-slate-400 text-sm">
          No schedule found for {teacher}.
        </div>
      )}
    </div>
  );
}

export default function TimetablePage() {
  const [view, setView] = useState("class");
  return (
    <div>
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {[{k:"class",l:"Class Schedule"},{k:"teacher",l:"Teacher Schedule"}].map(t=>(
          <button key={t.k} onClick={()=>setView(t.k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view===t.k?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
            {t.l}
          </button>
        ))}
      </div>
      {view==="class" ? <ClassSchedule/> : <TeacherSchedule/>}
    </div>
  );
}
