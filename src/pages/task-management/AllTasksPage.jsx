/**
 * AllTasksPage.jsx — matches screenshot: tasks/index
 * Full CRUD: filter by Status/Priority/Category/Assignee/Overdue, table with actions
 */
import { useEffect, useState } from "react";
import { Filter, Plus, Tag, Copy, FileText, FileDown, Printer, Columns, ChevronLeft, ChevronRight, Edit2, Trash2, Eye, Search, X } from "lucide-react";

const INIT = [
  { id:1, title:"Update student profiles",  category:"Administration", priority:"High",   dueDate:"30 May 2026", assignees:"Ramesh K.",  progress:40,  status:"Pending" },
  { id:2, title:"Generate fee receipts",    category:"Finance",        priority:"Urgent", dueDate:"28 May 2026", assignees:"Priya S.",   progress:75,  status:"In Progress" },
  { id:3, title:"Timetable for June term",  category:"Academic",       priority:"Medium", dueDate:"01 Jun 2026", assignees:"Anil M.",    progress:100, status:"Completed" },
  { id:4, title:"Staff meeting agenda",     category:"Administration", priority:"Low",    dueDate:"25 May 2026", assignees:"Sunita J.",  progress:0,   status:"Pending" },
  { id:5, title:"Library catalogue update", category:"Library",        priority:"Medium", dueDate:"31 May 2026", assignees:"Vivek G.",   progress:60,  status:"In Progress" },
];
const SCOL = { Pending:"bg-amber-100 text-amber-700", "In Progress":"bg-blue-100 text-blue-700", Completed:"bg-emerald-100 text-emerald-700", Cancelled:"bg-red-100 text-red-700" };
const PCOL = { Low:"bg-slate-100 text-slate-600", Medium:"bg-blue-100 text-blue-700", High:"bg-orange-100 text-orange-700", Urgent:"bg-red-100 text-red-700" };
const ALL_ASSIGNEES = ["Ramesh K.","Priya S.","Anil M.","Sunita J.","Vivek G."];
const DEFAULT_TASK = { id:null, title:"", category:"Administration", priority:"Medium", dueDate:"", assignees:"Ramesh K.", progress:0, status:"Pending" };

function Sel({label,value,onChange,options}){
  return <div><label className="block text-[11px] font-semibold text-slate-500 mb-1">{label}</label>
    <select value={value} onChange={e=>onChange(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
      {options.map(o=><option key={o} value={o}>{o}</option>)}
    </select></div>;
}

function TaskForm({task,onSave,onCancel}){
  const [form,setForm]=useState({...task});
  const [errors,setErrors]=useState({});

  useEffect(()=>{
    setForm({...task});
    setErrors({});
  },[task]);

  const validate=()=>{
    const nextErrors = {};
    if(!form.title.trim()) nextErrors.title = "Title is required";
    return nextErrors;
  };

  const handleSave = ()=>{
    const nextErrors = validate();
    if(Object.keys(nextErrors).length){
      setErrors(nextErrors);
      return;
    }
    onSave(form);
  };

  return <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5">
      <div>
        <h3 className="text-sm font-semibold text-slate-700">{form.id?"Edit Task":"Create Task"}</h3>
        <p className="text-xs text-slate-500 mt-1">Use the form to create or update a task record.</p>
      </div>
      <button type="button" onClick={onCancel} className="text-slate-500 hover:text-slate-900 flex items-center gap-2"><X size={16}/> Cancel</button>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Title *</label>
        <input value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} placeholder="Task title" className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 ${errors.title?"border-red-400 bg-red-50 border-red-400":"border-slate-200"}`}/>
        {errors.title&&<p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Category</label>
        <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
          {["Administration","Finance","Academic","Library","HR"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Priority</label>
        <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
          {["Low","Medium","High","Urgent"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Due Date</label>
        <input type="date" value={form.dueDate} onChange={e=>setForm(p=>({...p,dueDate:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400"/>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Assignee</label>
        <select value={form.assignees} onChange={e=>setForm(p=>({...p,assignees:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
          {ALL_ASSIGNEES.map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Status</label>
        <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">
          {["Pending","In Progress","Completed","Cancelled"].map(o=><option key={o}>{o}</option>)}
        </select>
      </div>
      <div className="lg:col-span-3">
        <label className="block text-[11px] font-semibold text-slate-500 mb-1">Progress ({form.progress}%)</label>
        <input type="range" min={0} max={100} value={form.progress} onChange={e=>setForm(p=>({...p,progress:+e.target.value}))} className="w-full accent-indigo-600"/>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row gap-3 mt-5">
      <button type="button" onClick={handleSave} className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg">Save Task</button>
      <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button>
    </div>
  </div>;
}

export default function AllTasksPage() {
  const [tasks,setTasks]=useState(INIT);
  const [filters,setFilters]=useState({status:"— All —",priority:"— All —",category:"— All —",assignee:"— All —",overdue:false});
  const [search,setSearch]=useState(""); const [page,setPage]=useState(1); const [deleteId,setDeleteId]=useState(null); const [activeTask,setActiveTask]=useState(null);
  const sf=(k,v)=>setFilters(p=>({...p,[k]:v}));
  const today=new Date();
  const filtered=tasks.filter(t=>{
    if(filters.status!=="— All —"&&t.status!==filters.status)return false;
    if(filters.priority!=="— All —"&&t.priority!==filters.priority)return false;
    if(filters.category!=="— All —"&&t.category!==filters.category)return false;
    if(filters.assignee!=="— All —"&&t.assignees!==filters.assignee)return false;
    if(filters.overdue&&new Date(t.dueDate)>=today)return false;
    if(search&&!t.title.toLowerCase().includes(search.toLowerCase()))return false;
    return true;
  });
  const PER=25; const total=Math.max(1,Math.ceil(filtered.length/PER));
  const rows=filtered.slice((page-1)*PER,page*PER);
  const handleDelete=id=>{setTasks(p=>p.filter(t=>t.id!==id));setDeleteId(null);};
  const handleSaveTask=form=>{
    if(form.id==null){
      setTasks(p=>[{...form,id:Math.max(0,...p.map(t=>t.id))+1},...p]);
    } else {
      setTasks(p=>p.map(t=>t.id===form.id?form:t));
    }
    setActiveTask(null);
    setPage(1);
  };
  const openNewTask=()=>setActiveTask(DEFAULT_TASK);
  const openEditTask=task=>setActiveTask(task);
  return (
    <div>
      {activeTask&&<TaskForm task={activeTask} onSave={handleSaveTask} onCancel={()=>setActiveTask(null)}/>} 
      <div className="flex items-center gap-3 mb-5"><div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">🏠</div><h1 className="text-[15px] font-bold text-slate-800">Task Management</h1></div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2"><Filter size={13} className="text-indigo-500"/> Filter Tasks</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Sel label="Status"   value={filters.status}   onChange={v=>sf("status",v)}   options={["— All —","Pending","In Progress","Completed","Cancelled"]}/>
          <Sel label="Priority" value={filters.priority} onChange={v=>sf("priority",v)} options={["— All —","Low","Medium","High","Urgent"]}/>
          <Sel label="Category" value={filters.category} onChange={v=>sf("category",v)} options={["— All —","Administration","Finance","Academic","Library","HR"]}/>
          <Sel label="Assignee" value={filters.assignee} onChange={v=>sf("assignee",v)} options={["— All —","Ramesh K.","Priya S.","Anil M.","Sunita J.","Vivek G."]}/>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer mb-4"><input type="checkbox" checked={filters.overdue} onChange={e=>sf("overdue",e.target.checked)} className="accent-indigo-600"/> Show Only Overdue</label>
        <div className="flex justify-end gap-2">
          <button onClick={()=>{setFilters({status:"— All —",priority:"— All —",category:"— All —",assignee:"— All —",overdue:false});setSearch("");setPage(1);}} className="px-4 py-2 text-sm border border-slate-200 rounded-lg hover:bg-slate-50">Reset</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg"><Filter size={13}/> Filter</button>
          <button onClick={openNewTask} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg"><Plus size={13}/> Create Task</button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200"><Tag size={13}/> Task Categories</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-700">☰ All Tasks</h3></div>
        <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between">
          <div className="flex gap-1">{[<Copy size={13}/>,<FileText size={13}/>,<FileDown size={13}/>,<FileDown size={13}/>,<Printer size={13}/>,<Columns size={13}/>].map((ic,i)=><button key={i} className="p-1.5 rounded hover:bg-slate-100 text-slate-500">{ic}</button>)}</div>
          <div className="relative"><Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="pl-8 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 w-48"/></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead><tr className="bg-slate-50">{["SL","TITLE","CATEGORY","PRIORITY","DUE DATE","ASSIGNEES","PROGRESS","STATUS","ACTION"].map(h=><th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 whitespace-nowrap">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length===0?<tr><td colSpan={9} className="px-4 py-12 text-center text-xs text-slate-400">No data available in table</td></tr>:
              rows.map((t,i)=><tr key={t.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-3 text-slate-500">{(page-1)*PER+i+1}</td>
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-[180px] truncate">{t.title}</td>
                <td className="px-4 py-3 text-slate-600">{t.category}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${PCOL[t.priority]}`}>{t.priority}</span></td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{t.dueDate}</td>
                <td className="px-4 py-3 text-slate-600">{t.assignees}</td>
                <td className="px-4 py-3 w-32"><div className="flex items-center gap-2"><div className="flex-1 h-1.5 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500 rounded-full" style={{width:`${t.progress}%`}}/></div><span className="text-[10px] text-slate-500 whitespace-nowrap">{t.progress}%</span></div></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${SCOL[t.status]}`}>{t.status}</span></td>
                <td className="px-4 py-3"><div className="flex gap-1">
                  <button className="p-1.5 rounded hover:bg-blue-50 text-blue-500"><Eye size={13}/></button>
                  <button onClick={()=>openEditTask(t)} className="p-1.5 rounded hover:bg-amber-50 text-amber-500"><Edit2 size={13}/></button>
                  <button onClick={()=>setDeleteId(t.id)} className="p-1.5 rounded hover:bg-red-50 text-red-500"><Trash2 size={13}/></button>
                </div></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filtered.length===0?0:(page-1)*PER+1} to {Math.min(page*PER,filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-2">
            <select className="border border-slate-200 rounded px-2 py-1 text-xs"><option>25</option><option>50</option><option>100</option></select>
            <span>rows per page</span>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronLeft size={14}/></button>
            <button onClick={()=>setPage(p=>Math.min(total,p+1))} disabled={page===total} className="p-1 rounded hover:bg-slate-100 disabled:opacity-40"><ChevronRight size={14}/></button>
          </div>
        </div>
      </div>
      {deleteId&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"><div className="bg-white rounded-2xl p-6 w-72 shadow-2xl"><h3 className="font-bold mb-2">Delete Task?</h3><p className="text-sm text-slate-500 mb-5">This action cannot be undone.</p><div className="flex gap-3"><button onClick={()=>handleDelete(deleteId)} className="flex-1 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg">Delete</button><button onClick={()=>setDeleteId(null)} className="flex-1 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-lg">Cancel</button></div></div></div>}
    </div>
  );
}
