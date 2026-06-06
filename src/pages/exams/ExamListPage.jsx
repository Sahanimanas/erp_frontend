import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Badge, Button, DataTable, SearchInput, Select, Modal, Input } from "../../components/ui";
import { FileText, Plus, Eye, Edit2, CheckCircle, Clock, BarChart2 } from "lucide-react";

const EXAMS=[
  {id:1,name:"Mathematics Final",class:"Class 10",date:"10 Jun 2026",time:"09:00 AM",dur:"3 hrs",totalMarks:100,status:"upcoming",students:92},
  {id:2,name:"Science Final",    class:"Class 10",date:"12 Jun 2026",time:"09:00 AM",dur:"3 hrs",totalMarks:100,status:"upcoming",students:92},
  {id:3,name:"English Final",    class:"Class 10",date:"14 Jun 2026",time:"09:00 AM",dur:"2.5 hrs",totalMarks:80,status:"upcoming",students:92},
  {id:4,name:"History Final",    class:"Class 9", date:"20 May 2026",time:"10:00 AM",dur:"2 hrs",totalMarks:80,status:"completed",students:88},
  {id:5,name:"Geography Final",  class:"Class 9", date:"22 May 2026",time:"10:00 AM",dur:"2 hrs",totalMarks:80,status:"completed",students:88},
  {id:6,name:"Unit Test 1",      class:"Class 8", date:"25 May 2026",time:"11:00 AM",dur:"1 hr",totalMarks:50,status:"ongoing",students:95},
];
const STATUS_BADGE={upcoming:"info",completed:"success",ongoing:"warning",cancelled:"default"};

export default function ExamListPage() {
  usePageTitle("Exams");
  const [search,setSearch]=useState(""); const [open,setOpen]=useState(false);
  const filtered=EXAMS.filter(e=>!search||e.name.toLowerCase().includes(search.toLowerCase()));
  const COLUMNS=[
    {key:"name",label:"Exam Name",render:v=><span className="font-semibold text-slate-800">{v}</span>},
    {key:"class",label:"Class"},
    {key:"date",label:"Date"},
    {key:"time",label:"Time"},
    {key:"dur",label:"Duration"},
    {key:"totalMarks",label:"Total Marks",render:v=><span className="font-semibold">{v}</span>},
    {key:"students",label:"Students",render:v=><span className="font-semibold text-indigo-600">{v}</span>},
    {key:"status",label:"Status",render:v=><Badge variant={STATUS_BADGE[v]} dot>{v}</Badge>},
    {key:"id",label:"Actions",sortable:false,render:(_,r)=><div className="flex gap-1"><Button size="xs" variant="secondary" icon={<Eye size={11}/>}>View</Button>{r.status==="completed"&&<Button size="xs" icon={<BarChart2 size={11}/>}>Results</Button>}</div>},
  ];
  return (
    <div>
      <PageHeader title="Exam Master" subtitle="Schedule and manage all examinations" icon={<FileText size={18}/>}>
        <Button size="sm" icon={<Plus size={13}/>} onClick={()=>setOpen(true)}>Create Exam</Button>
      </PageHeader>
      
      <Card noPadding>
        <div className="flex gap-2 flex-wrap p-4 border-b border-slate-100">
          <SearchInput value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exams..." className="w-52"/>
          <Select options={[{value:"",label:"All Classes"},...Array.from({length:12},(_,i)=>({value:String(i+1),label:`Class ${i+1}`}))]} className="w-36"/>
          <Select options={[{value:"",label:"All Status"},{value:"upcoming",label:"Upcoming"},{value:"completed",label:"Completed"},{value:"ongoing",label:"Ongoing"}]} className="w-36"/>
        </div>
        <DataTable columns={COLUMNS} data={filtered}/>
      </Card>
      <Modal open={open} onClose={()=>setOpen(false)} title="Create New Exam" size="lg">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Exam Name *" placeholder="e.g. Mathematics Final"/>
          <Select label="Class *" options={[{value:"",label:"Select"},...Array.from({length:12},(_,i)=>({value:String(i+1),label:`Class ${i+1}`}))]}/>
          <Select label="Subject *" options={[{value:"",label:"Select Subject"},{value:"math",label:"Mathematics"},{value:"sci",label:"Science"},{value:"eng",label:"English"}]}/>
          <Input label="Total Marks *" type="number" placeholder="100"/>
          <Input label="Exam Date *" type="date"/>
          <Input label="Start Time *" type="time"/>
          <Input label="Duration" placeholder="e.g. 3 hrs"/>
          <Input label="Venue / Room" placeholder="e.g. Room 101"/>
        </div>
        <div className="flex gap-2 mt-5"><Button className="flex-1">Create Exam</Button><Button variant="secondary" className="flex-1" onClick={()=>setOpen(false)}>Cancel</Button></div>
      </Modal>
    </div>
  );
}
