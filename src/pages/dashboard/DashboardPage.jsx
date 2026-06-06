import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/slices/authSlice";
import { usePageTitle } from "../../hooks";
import { WelcomeBanner, StatCard, Card, ProgressBar } from "../../components/ui";
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, GraduationCap, UserCheck, BookOpen, AlertCircle, Clock } from "lucide-react";
import apiClient from "../../services/axios";

function Tip({active,payload,label}){if(!active||!payload?.length)return null;return <div className="bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-2 text-xs"><p className="font-semibold text-slate-700 mb-1">{label}</p>{payload.map((p,i)=><p key={i} style={{color:p.color}}>{p.name}: {p.value}M</p>)}</div>;}

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const user=useSelector(selectUser);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get("/dashboard/stats");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
        setError(err.message);
        setStats(getDefaultStats());
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const getDefaultStats = () => ({
    students: 0,
    employees: 0,
    teachers: 0,
    parents: 0,
    feeCollection: { collected: 0, total: 0, percentage: 0 },
    pendingFees: 0,
    attendance: { present: 0, absent: 0, percentage: 0 },
    monthlyFees: [],
    incomeExpense: { income: 0, expense: 0 },
    weeklyAttendance: [],
    activities: [],
  });

  if (loading) {
    return <div className="p-8 text-center">Loading dashboard...</div>;
  }

  const dashboardData = stats || getDefaultStats();
  return (
    <div>
      <WelcomeBanner name={user?.name??"Demo"}/>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Employees" value={dashboardData.employees} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" icon={Users} change={0} sparkData={[1,2,1,3,2,1,1]}/>
        <StatCard label="Students" value={dashboardData.students} gradient="bg-gradient-to-br from-cyan-500 to-teal-500" icon={GraduationCap} change={0} sparkData={[5,6,5,7,8,7,6]}/>
        <StatCard label="Parents" value={dashboardData.parents} gradient="bg-gradient-to-br from-blue-500 to-blue-600" icon={UserCheck} change={0} sparkData={[8,10,9,11,12,11,10]}/>
        <StatCard label="Teachers" value={dashboardData.teachers} gradient="bg-gradient-to-br from-pink-500 to-rose-500" icon={BookOpen} change={0} sparkData={[2,3,2,4,3,2,3]}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        <Card title="Income Vs Expense" className="lg:col-span-2">
          <div className="p-4">
            {dashboardData.incomeExpense && (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    {name:"Income",value:dashboardData.incomeExpense.income||0,color:"#22d3ee"},
                    {name:"Expense",value:dashboardData.incomeExpense.expense||0,color:"#f43f5e"}
                  ]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                    {[{color:"#22d3ee"},{color:"#f43f5e"}].map((e,i)=><Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card title="Monthly Fee Summary" className="lg:col-span-3">
          <div className="p-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dashboardData.monthlyFees || []} margin={{top:5,right:10,left:0,bottom:0}}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/><stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/></linearGradient>
                  <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/><XAxis dataKey="month" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/><YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false} tickFormatter={v=>`${v}M`}/>
                <Tooltip content={<Tip/>}/><Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
                <Area type="monotone" dataKey="total"     name="Total"     stroke="#6366f1" fill="url(#g1)" strokeWidth={2} dot={{r:3,fill:"#6366f1"}}/>
                <Area type="monotone" dataKey="collected" name="Collected" stroke="#22d3ee" fill="url(#g2)" strokeWidth={2} dot={{r:3,fill:"#22d3ee"}}/>
                <Area type="monotone" dataKey="remaining" name="Remaining" stroke="#f43f5e" fill="url(#g3)" strokeWidth={2} dot={{r:3,fill:"#f43f5e"}}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card title="Weekly Attendance">
          <div className="p-4">
            {dashboardData.weeklyAttendance && dashboardData.weeklyAttendance.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dashboardData.weeklyAttendance} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                  <XAxis dataKey="day" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                  <Tooltip/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:11}}/>
                  <Bar dataKey="present" name="Present" fill="#22d3ee" radius={[4,4,0,0]}/>
                  <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-slate-400">No data available</div>
            )}
          </div>
        </Card>
        <div className="space-y-3">
          <Card>
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Fee Collection</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">This Month</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">₹{(dashboardData.feeCollection?.collected || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mb-3">of ₹{(dashboardData.feeCollection?.total || 0).toLocaleString()}</p>
              <ProgressBar value={dashboardData.feeCollection?.percentage || 0} color="indigo"/>
            </div>
          </Card>
          <Card>
            <div className="p-4 flex gap-4 items-center">
              <AlertCircle size={18} className="text-amber-500 flex-shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-slate-700">Pending Fees</p>
                <p className="text-xl font-bold text-amber-600">₹{(dashboardData.pendingFees || 0).toLocaleString()}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-4">
              <p className="text-sm font-semibold text-slate-700 mb-3">Today's Attendance</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xl font-bold text-emerald-600">{dashboardData.attendance?.present || 0}</p>
                  <p className="text-xs text-slate-400">Present</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-red-500">{dashboardData.attendance?.absent || 0}</p>
                  <p className="text-xs text-slate-400">Absent</p>
                </div>
              </div>
              <ProgressBar value={dashboardData.attendance?.percentage || 0} color="emerald" className="mt-3"/>
            </div>
          </Card>
        </div>
      </div>
      <Card title="Recent Activities">
        <div className="divide-y divide-slate-50">
          {dashboardData.activities && dashboardData.activities.length > 0 ? (
            dashboardData.activities.map((a,i)=>(
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0 text-sm">📋</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700">{a.title}</p>
                  <p className="text-[11px] text-slate-400">{a.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/>{a.time}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400">No recent activities</div>
          )}
        </div>
      </Card>
    </div>
  );
}
