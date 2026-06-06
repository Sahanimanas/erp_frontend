/**
 * CreateTaskPage.jsx — matches screenshot: tasks/create
 * Full form: Title, Description, Category, Priority, Due Date, Due Time,
 *            Assign To (multi), Submission Type, Recurring, Attachments,
 *            Notify Via (Email/Whatsapp/SMS), Save As Template
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, X } from "lucide-react";

const FIELD = ({ label, required, children }) => (
  <div><label className="block text-sm font-medium text-slate-700 mb-1">{label}{required&&<span className="text-red-500 ml-1">*</span>}</label>{children}</div>
);
const INPUT = (props) => <input {...props} className={`w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 ${props.className??""}`}/>;
const SEL = ({ children, ...props }) => <select {...props} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 bg-white">{children}</select>;

const PRIORITIES = ["Low","Medium","High","Urgent"];
const SUB_TYPES  = ["Remarks With Attachment","Remarks Only","Attachment Only","None"];
const RECUR_OPTS = ["None","Daily","Weekly","Monthly","Yearly"];
const ASSIGNEES  = ["Ramesh Kumar","Priya Sharma","Anil Mehta","Sunita Joshi","Vivek Gupta","Kavita Rao","Dinesh Kumar"];

export default function CreateTaskPage() {
  const nav = useNavigate();
  const [form,setForm]=useState({title:"",description:"",category:"",priority:"Medium",dueDate:"",dueTime:"",assignees:[],submissionType:"Remarks With Attachment",recurring:"None",attachments:null,notifyEmail:true,notifyWhatsapp:false,notifySms:false,saveAsTemplate:false});
  const [errors,setErrors]=useState({});
  const [loading,setLoading]=useState(false);
  const [success,setSuccess]=useState(false);

  const sf=(k,v)=>setForm(p=>({...p,[k]:v}));
  const toggleAssignee=name=>setForm(p=>({...p,assignees:p.assignees.includes(name)?p.assignees.filter(a=>a!==name):[...p.assignees,name]}));

  const validate=()=>{const e={};if(!form.title.trim())e.title="Title is required";if(!form.assignees.length)e.assignees="At least one assignee required";return e;};

  const handleSubmit=async(e)=>{e.preventDefault();const e2=validate();if(Object.keys(e2).length){setErrors(e2);return;}setLoading(true);await new Promise(r=>setTimeout(r,800));setLoading(false);setSuccess(true);setTimeout(()=>nav("/tasks/all"),1200);};

  return (
    <div>
      <div className="flex items-center gap-3 mb-5"><div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">🏠</div><h1 className="text-[15px] font-bold text-slate-800">Create Task</h1></div>
      {success&&<div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700 font-medium">✅ Task created successfully! Redirecting...</div>}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100"><h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">📋 Create Task</h3></div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <FIELD label="Title" required>
            <INPUT value={form.title} onChange={e=>sf("title",e.target.value)} placeholder="Enter task title" className={errors.title?"border-red-400 bg-red-50":""}/>
            {errors.title&&<p className="text-[10px] text-red-500 mt-1">{errors.title}</p>}
          </FIELD>

          {/* Description */}
          <FIELD label="Description">
            <textarea value={form.description} onChange={e=>sf("description",e.target.value)} rows={4} placeholder="Describe the task in detail..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"/>
          </FIELD>

          {/* Category Priority Due Date Due Time */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <FIELD label="Category">
              <SEL value={form.category} onChange={e=>sf("category",e.target.value)}>
                <option value="">— None —</option>
                {["Administration","Finance","Academic","Library","HR"].map(o=><option key={o}>{o}</option>)}
              </SEL>
            </FIELD>
            <FIELD label="Priority">
              <SEL value={form.priority} onChange={e=>sf("priority",e.target.value)}>
                {PRIORITIES.map(p=><option key={p}>{p}</option>)}
              </SEL>
            </FIELD>
            <FIELD label="Due Date">
              <INPUT type="date" value={form.dueDate} onChange={e=>sf("dueDate",e.target.value)}/>
            </FIELD>
            <FIELD label="Due Time">
              <INPUT type="time" value={form.dueTime} onChange={e=>sf("dueTime",e.target.value)}/>
            </FIELD>
          </div>

          {/* Assign To */}
          <FIELD label="Assign To" required>
            <div className={`border rounded-lg p-3 ${errors.assignees?"border-red-400 bg-red-50":"border-slate-200"}`}>
              <div className="flex flex-wrap gap-2 mb-2">
                {form.assignees.map(a=><span key={a} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                  {a}<button type="button" onClick={()=>toggleAssignee(a)}><X size={11}/></button></span>)}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {ASSIGNEES.map(a=><label key={a} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer hover:text-indigo-600">
                  <input type="checkbox" checked={form.assignees.includes(a)} onChange={()=>toggleAssignee(a)} className="accent-indigo-600"/>{a}</label>)}
              </div>
              <p className="text-[10px] text-slate-400 mt-2">Multi Assignee — select one or more</p>
            </div>
            {errors.assignees&&<p className="text-[10px] text-red-500 mt-1">{errors.assignees}</p>}
          </FIELD>

          {/* Submission Type, Recurring, Attachments */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <FIELD label="Submission Type">
              <SEL value={form.submissionType} onChange={e=>sf("submissionType",e.target.value)}>
                {SUB_TYPES.map(t=><option key={t}>{t}</option>)}
              </SEL>
            </FIELD>
            <FIELD label="Recurring">
              <SEL value={form.recurring} onChange={e=>sf("recurring",e.target.value)}>
                {RECUR_OPTS.map(r=><option key={r}>{r}</option>)}
              </SEL>
              <p className="text-[10px] text-slate-400 mt-1">Auto Spawn On Completion</p>
            </FIELD>
            <FIELD label="Reference Attachments (Optional)">
              <div className="flex items-center gap-2">
                <label className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm rounded-lg cursor-pointer border border-slate-200 transition-colors">
                  Choose files
                  <input type="file" multiple onChange={e=>sf("attachments",e.target.files)} className="hidden"/>
                </label>
                <span className="text-sm text-slate-400">{form.attachments&&form.attachments.length>0?`${form.attachments.length} file(s)`:"No file chosen"}</span>
              </div>
            </FIELD>
          </div>

          {/* Notify Via */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notify Via</label>
            <div className="flex gap-6">
              {[["notifyEmail","✉️ Email"],["notifyWhatsapp","💬 Whatsapp"],["notifySms","💬 Sms"]].map(([key,label])=>(
                <label key={key} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                  <input type="checkbox" checked={form[key]} onChange={e=>sf(key,e.target.checked)} className="accent-indigo-600"/>{label}
                </label>
              ))}
            </div>
          </div>

          {/* Save As Template */}
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={form.saveAsTemplate} onChange={e=>sf("saveAsTemplate",e.target.checked)} className="accent-indigo-600"/>
            💾 Also Save As Template For Reuse
          </label>

          {/* Buttons */}
          <div className="flex gap-3 pt-2 border-t border-slate-100">
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70">
              {loading?<span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>:<Save size={14}/>}
              {loading?"Saving...":"Save Task"}
            </button>
            <button type="button" onClick={()=>nav("/tasks/all")}
              className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-lg transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
