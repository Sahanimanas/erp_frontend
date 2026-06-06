/**
 * TemplatesPage.jsx — Images 9 & 10 (SMS Template) + Images 11 & 12 (Email Template)
 */
import { useState } from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { inp, PageTitle, Card2, TabBar, ExportBar } from "../_shared";

const TOOLBAR = ["⚡▾","Arial▾","14▾","B","I","U","abc","A","▾","≡","≡","☰","🔗","⊞","✕","↩","</>"];
const DYNAMIC_TAGS = ["{name}","{email}","{mobile_no}"];

function SmsTemplateList({ templates, setTemplates }) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name:"", message:"" });
  const charsLeft = 160 - form.message.length;

  return (
    <Card2>
      <TabBar tabs={[{k:"list",l:"Template List",i:"☰"},{k:"create",l:"Create Template",i:"✎"}]} active={tab} onChange={setTab}/>
      {tab==="list" ? (
        <div className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <select className="border border-slate-200 rounded px-2 py-1 text-xs bg-white"><option>25</option></select>
              <span className="text-xs text-slate-500">rows per page</span>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]">🔍</span>
              <input className="pl-7 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg w-48 focus:outline-none focus:border-indigo-400" placeholder="Search..."/>
            </div>
          </div>
          <div className="border border-slate-100 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {["SL","NAME","BODY","ACTION"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {templates.length===0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                ) : templates.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.message}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                        <button onClick={()=>setTemplates(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
            <span>Showing 0 to {templates.length} of {templates.length} entries</span>
            <div className="flex gap-1">
              <button className="p-1 rounded hover:bg-slate-100">‹</button>
              <button className="p-1 rounded hover:bg-slate-100">›</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-2xl">
          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <label className="text-sm text-slate-600 font-medium text-right">Name <span className="text-red-500">*</span></label>
            <div className="col-span-2"><input className={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4 mb-2">
            <label className="text-sm text-slate-600 font-medium text-right pt-2">Message <span className="text-red-500">*</span></label>
            <div className="col-span-2">
              <textarea className={inp+" min-h-[80px] resize-y"} value={form.message}
                onChange={e=>setForm(p=>({...p,message:e.target.value.slice(0,160)}))}/>
              <p className="text-xs text-red-500 text-right mt-1">{charsLeft} characters remaining {Math.ceil(Math.max(1,form.message.length)/160)} message</p>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <label className="text-sm text-slate-600 font-medium text-right">Dynamic Tag :</label>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {DYNAMIC_TAGS.map(tag=>(
                <button key={tag} onClick={()=>setForm(p=>({...p,message:(p.message+tag).slice(0,160)}))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-xs rounded border border-slate-200">
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={()=>{if(!form.name)return;setTemplates(p=>[...p,{id:Date.now(),...form}]);setForm({name:"",message:""});setTab("list");}}
              className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
              <Plus size={13}/> Save
            </button>
          </div>
        </div>
      )}
    </Card2>
  );
}

function EmailTemplateList({ templates, setTemplates }) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name:"" });
  const [body, setBody] = useState("");

  return (
    <Card2>
      <TabBar tabs={[{k:"list",l:"Template List",i:"☰"},{k:"create",l:"Create Template",i:"✎"}]} active={tab} onChange={setTab}/>
      {tab==="list" ? (
        <div className="p-5">
          <div className="border border-slate-100 rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="bg-slate-50">
                {["SL","NAME","BODY","ACTION"].map(h=>(
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase border-b border-slate-100">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {templates.length===0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-xs text-slate-400">No data available in table</td></tr>
                ) : templates.map((r,i)=>(
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-slate-500">{i+1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{r.name}</td>
                    <td className="px-4 py-3 text-slate-600 max-w-xs truncate">{r.body}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-600"><Edit2 size={13}/></button>
                        <button onClick={()=>setTemplates(p=>p.filter(x=>x.id!==r.id))} className="p-1.5 rounded bg-red-50 hover:bg-red-100 text-red-500"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-slate-500">Showing 0 to {templates.length} of {templates.length} entries</div>
        </div>
      ) : (
        <div className="p-6 max-w-2xl">
          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <label className="text-sm text-slate-600 font-medium text-right">Name <span className="text-red-500">*</span></label>
            <div className="col-span-2"><input className={inp} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))}/></div>
          </div>
          <div className="grid grid-cols-3 items-start gap-4 mb-2">
            <label className="text-sm text-slate-600 font-medium text-right pt-2">Message <span className="text-red-500">*</span></label>
            <div className="col-span-2">
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <div className="flex flex-wrap gap-0.5 p-2 bg-slate-50 border-b border-slate-200">
                  {TOOLBAR.map((t,i)=><button key={i} type="button" className="px-1.5 py-1 text-xs hover:bg-slate-200 rounded font-medium text-slate-600 min-w-[24px]">{t}</button>)}
                </div>
                <textarea className="w-full px-3 py-2 text-sm focus:outline-none min-h-[140px] resize-y" value={body} onChange={e=>setBody(e.target.value)}/>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 mb-4">
            <label className="text-sm text-slate-600 font-medium text-right">Dynamic Tag :</label>
            <div className="col-span-2 flex flex-wrap gap-1.5">
              {DYNAMIC_TAGS.map(tag=>(
                <button key={tag} onClick={()=>setBody(b=>b+tag)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-xs rounded border border-slate-200">{tag}</button>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <button onClick={()=>{if(!form.name)return;setTemplates(p=>[...p,{id:Date.now(),name:form.name,body}]);setForm({name:""});setBody("");setTab("list");}}
              className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg">
              <Plus size={13}/> Save
            </button>
          </div>
        </div>
      )}
    </Card2>
  );
}

export default function TemplatesPage() {
  const [activeModule, setActiveModule] = useState("sms");
  const [smsTemplates, setSmsTemplates] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);

  return (
    <div>
      <PageTitle title="Bulk Sms And Email"/>
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-xl w-fit">
        {[{k:"sms",l:"SMS Template"},{k:"email",l:"Email Template"}].map(t=>(
          <button key={t.k} onClick={()=>setActiveModule(t.k)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeModule===t.k?"bg-white text-indigo-600 shadow-sm":"text-slate-500 hover:text-slate-700"}`}>
            {t.l}
          </button>
        ))}
      </div>
      {activeModule==="sms"
        ? <SmsTemplateList templates={smsTemplates} setTemplates={setSmsTemplates}/>
        : <EmailTemplateList templates={emailTemplates} setTemplates={setEmailTemplates}/>}
    </div>
  );
}
