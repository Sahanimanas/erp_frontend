/**
 * SendSMSPage.jsx — Images 7 (SMS tab) + Email tab
 * URL: /communication/sms
 * Bulk Sms And Email — SMS and Email tabs
 */
import { useState } from "react";
import { Send } from "lucide-react";
import { inp, sel, PageTitle, Card2 } from "../_shared";

const DYNAMIC_TAGS = ["{name}","{email}","{mobile_no}"];
const TOOLBAR = ["⚡▾","Arial▾","14▾","B","I","U","abc","A","▾","≡","≡","☰","🔗","⊞","✕","↩"];

function SmsTab() {
  const [form, setForm] = useState({
    campaign:"", template:"", message:"", gateway:"", dlt:"", type:"",
    sendLater:false, schedDate:"2026-05-27", schedTime:""
  });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const charsLeft = 160 - form.message.length;

  const F = ({label,req,children,colSpan=1}) => (
    <div className={colSpan===2?"md:col-span-2":""}>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}{req&&<span className="text-red-500 normal-case ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <F label="Campaign Name" req>
          <input className={inp} value={form.campaign} onChange={set("campaign")}/>
        </F>
        <F label="Template">
          <select className={sel} value={form.template} onChange={set("template")}>
            <option value="">Select</option>
            <option>Welcome Template</option><option>Fee Reminder</option><option>Birthday Wish</option>
          </select>
        </F>
      </div>
      <div className="mb-2">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
          Message <span className="text-red-500 normal-case">*</span>
        </label>
        <textarea
          className={inp + " min-h-[100px] resize-y"}
          value={form.message}
          onChange={e=>setForm(p=>({...p,message:e.target.value.slice(0,160)}))}
        />
        <p className="text-xs text-red-500 text-right mt-1">{charsLeft} characters remaining {Math.ceil(Math.max(1,form.message.length)/160)} message</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <F label="Sms Gateway" req>
          <select className={sel} value={form.gateway} onChange={set("gateway")}>
            <option value="">No Sms Gateway Available</option>
            <option>MSG91</option><option>Twilio</option>
          </select>
        </F>
        <F label="DLT Template ID">
          <input className={inp} placeholder="This field is only required for Indian SMS Gateway (Ex. MSG 91)."
            value={form.dlt} onChange={set("dlt")}/>
        </F>
        <F label="Type" req>
          <select className={sel} value={form.type} onChange={set("type")}>
            <option value="">Select</option>
            <option>Student</option><option>Parent</option><option>Staff</option><option>All</option>
          </select>
        </F>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.sendLater} onChange={e=>setForm(p=>({...p,sendLater:e.target.checked}))} className="rounded accent-indigo-600"/>
          <span className="text-sm text-slate-600">Send Later</span>
        </label>
      </div>
      {form.sendLater && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <F label="Schedule Date" req>
            <div className="flex">
              <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400">📅</span>
              <input className={inp+" rounded-l-none"} type="date" value={form.schedDate} onChange={set("schedDate")}/>
            </div>
          </F>
          <F label="Schedule Time" req>
            <div className="flex">
              <span className="flex items-center px-2.5 bg-slate-50 border border-r-0 border-slate-200 rounded-l-lg text-slate-400">🕐</span>
              <input className={inp+" rounded-l-none"} type="time" value={form.schedTime} onChange={set("schedTime")}/>
            </div>
          </F>
        </div>
      )}
      <div className="mb-6">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-3">Dynamic Tag :</span>
        {DYNAMIC_TAGS.map(tag=>(
          <button key={tag} onClick={()=>setForm(p=>({...p,message:(p.message+tag).slice(0,160)}))}
            className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-xs rounded border border-slate-200 mr-2 mb-2 transition-colors">
            {tag}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
          <Send size={13}/> Send
        </button>
      </div>
    </div>
  );
}

function EmailTab() {
  const [form, setForm] = useState({ campaign:"", template:"", subject:"", type:"", sendLater:false, schedDate:"2026-05-27", schedTime:"" });
  const set = k => e => setForm(p=>({...p,[k]:e.target.value}));
  const [body, setBody] = useState("");

  const F = ({label,req,children}) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
        {label}{req&&<span className="text-red-500 normal-case ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <F label="Campaign Name" req><input className={inp} value={form.campaign} onChange={set("campaign")}/></F>
        <F label="Template">
          <select className={sel} value={form.template} onChange={set("template")}>
            <option value="">Select</option><option>Welcome Email</option><option>Fee Reminder</option>
          </select>
        </F>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <F label="Subject" req><input className={inp} value={form.subject} onChange={set("subject")}/></F>
        <F label="Type" req>
          <select className={sel} value={form.type} onChange={set("type")}>
            <option value="">Select</option><option>Student</option><option>Parent</option><option>Staff</option>
          </select>
        </F>
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Message <span className="text-red-500 normal-case">*</span></label>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex flex-wrap gap-0.5 p-2 bg-slate-50 border-b border-slate-200">
            {TOOLBAR.map((t,i)=><button key={i} type="button" className="px-1.5 py-1 text-xs hover:bg-slate-200 rounded font-medium text-slate-600 min-w-[24px]">{t}</button>)}
          </div>
          <textarea className="w-full px-3 py-2 text-sm focus:outline-none min-h-[140px] resize-y" value={body} onChange={e=>setBody(e.target.value)}/>
        </div>
      </div>
      <div className="mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.sendLater} onChange={e=>setForm(p=>({...p,sendLater:e.target.checked}))} className="rounded"/>
          <span className="text-sm text-slate-600">Send Later</span>
        </label>
      </div>
      <div className="mb-6">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide mr-3">Dynamic Tag :</span>
        {DYNAMIC_TAGS.map(tag=>(
          <button key={tag} onClick={()=>setBody(b=>b+tag)}
            className="inline-flex items-center px-2.5 py-1 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 text-xs rounded border border-slate-200 mr-2 mb-2">
            {tag}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-6 py-2 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-lg border border-slate-200 shadow-sm">
          <Send size={13}/> Send
        </button>
      </div>
    </div>
  );
}

export default function SendSMSPage() {
  const [tab, setTab] = useState("sms");
  return (
    <div>
      <PageTitle title="Bulk Sms And Email"/>
      <Card2>
        <div className="px-5 border-b border-slate-100 flex gap-0">
          {[{k:"sms",l:"SMS",i:"📱"},{k:"email",l:"Email",i:"✉"}].map(t=>(
            <button key={t.k} onClick={()=>setTab(t.k)}
              className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${tab===t.k?"border-amber-500 text-amber-600":"border-transparent text-slate-500 hover:text-slate-700"}`}>
              <span>{t.i}</span> {t.l}
            </button>
          ))}
        </div>
        {tab==="sms" ? <SmsTab/> : <EmailTab/>}
      </Card2>
    </div>
  );
}
