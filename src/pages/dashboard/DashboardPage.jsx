import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/slices/authSlice";
import { usePageTitle } from "../../hooks";
import { WelcomeBanner, StatCard, Card, ProgressBar, DateRangeFilter, Button, Modal } from "../../components/ui";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Users, GraduationCap, UserCheck, AlertCircle, Clock, ChevronRight } from "lucide-react";
import apiClient from "../../services/axios";
import { Loader } from "../../components/loaders/PageLoader";

/**
 * Default tooltip for the dashboard's charts.
 *
 * `total` is computed here rather than carried as a third series: in a stacked
 * part-to-whole the whole IS the bar's height, so plotting it again would draw a
 * flat line across the top that tells the reader nothing.
 */
function Tip({ active, payload, label, showTotal = false, unit = "money" }) {
  if (!active || !payload?.length) return null;
  // Attendance is a head-count, not an amount — the same tooltip was printing
  // "₹0 Present", which is nonsense. Callers say which they are showing.
  const fmt = (v) =>
    unit === "money"
      ? `₹${Number(v || 0).toLocaleString("en-IN")}`
      : Number(v || 0).toLocaleString("en-IN");
  const money = fmt;
  const total = payload.reduce((t, p) => t + (Number(p.value) || 0), 0);
  return (
    <div className="bg-white rounded-lg shadow-lg px-3 py-2 text-xs" style={{ border: "1px solid var(--erp-border)" }}>
      <p className="font-semibold mb-1.5" style={{ color: "var(--erp-text)" }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 leading-5">
          {/* The swatch carries identity; the text stays ink, never the series
              colour — coloured text on white is the first thing to fail. */}
          <span className="inline-block w-2.5 h-2.5 rounded-[2px]" style={{ background: p.color }} />
          <span className="text-slate-700">{p.name}</span>
          <span className="ml-auto font-semibold" style={{ color: "var(--erp-text)" }}>{money(p.value)}</span>
        </p>
      ))}
      {showTotal && (
        <p className="flex items-center gap-2 leading-5 mt-1.5 pt-1.5" style={{ borderTop: "1px solid var(--erp-border-soft)" }}>
          <span className="inline-block w-2.5 h-2.5" />
          <span className="text-slate-700">Total</span>
          <span className="ml-auto font-bold" style={{ color: "var(--erp-text)" }}>{money(total)}</span>
        </p>
      )}
    </div>
  );
}

export default function DashboardPage() {
  // A Super Admin belongs to the platform tenant (no students/staff of its own),
  // so the tenant-scoped school dashboard is always empty for them. Redirect to
  // the cross-tenant platform control plane. Done before any other hook so the
  // hook order stays stable for this component instance (role can't change
  // without a re-mount via login/logout).
  const role = useSelector(selectUser)?.role;
  if (role === "SUPER_ADMIN") {
    return <Navigate to="/super-admin/dashboard" replace />;
  }
  return <SchoolDashboard />;
}

/**
 * A dashboard card that is also a link to the page it summarises.
 *
 * Rendered as a real <button> rather than a div with onClick, so it is keyboard
 * reachable and announced as a control. The chevron is the hint that the whole
 * card is pressable — without it, a card that moves on hover is just surprising.
 */
function LinkCard({ to, title, badge, children, className = "" }) {
  const navigate = useNavigate();
  return (
    <Card className={`transition-shadow hover:shadow-md ${className}`} noPadding>
      <button
        type="button"
        onClick={() => navigate(to)}
        className="group w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-[var(--erp-primary)] rounded-[3px]"
      >
        {(title || badge) && (
          <div className="flex items-center justify-between mb-2">
            <span className="text-[13px] font-semibold flex items-center gap-1.5" style={{ color: "var(--erp-text)" }}>
              {title}
              <ChevronRight size={14} className="text-slate-400 group-hover:text-[var(--erp-primary)] group-hover:translate-x-0.5 transition-all" />
            </span>
            {badge}
          </div>
        )}
        {children}
      </button>
    </Card>
  );
}

function SchoolDashboard() {
  usePageTitle("Dashboard");
  const navigate=useNavigate();
  const user=useSelector(selectUser);
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");
  const [dateRange,setDateRange]=useState({from:"",to:""});
  const [selectedActivity,setSelectedActivity]=useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        const params = {};
        if (dateRange.from) params.startDate = dateRange.from;
        if (dateRange.to) params.endDate = dateRange.to;
        const response = await apiClient.get("/dashboard/stats", { params });
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
  }, [dateRange]);

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

  if (loading && !stats) {
    return <Loader label="Loading dashboard..." />;
  }

  const dashboardData = stats || getDefaultStats();
  return (
    <div>
      <WelcomeBanner name={user?.name??"Demo"} schoolName={user?.schoolName} schoolLogo={user?.schoolLogo}/>
      {/* Date-wise filter — scopes fee collection + attendance metrics */}
      <Card className="mb-4">
        <div className="p-4 flex flex-wrap items-end gap-3">
          <DateRangeFilter from={dateRange.from} to={dateRange.to} onChange={setDateRange} />
          <span className="text-[11px] text-slate-500 mb-2">
            {dateRange.from || dateRange.to
              ? "Fee collection & attendance scoped to the selected range"
              : "Showing current month / today"}
          </span>
          {loading && <span className="text-[11px] text-indigo-500 mb-2">Updating…</span>}
        </div>
      </Card>
      {/* KPI cards — each one drills into its own module listing. */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Employees" value={dashboardData.employees} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" icon={Users} change={0} sparkData={[1,2,1,3,2,1,1]} onClick={()=>navigate("/employee/list")}/>
        <StatCard label="Students" value={dashboardData.students} gradient="bg-gradient-to-br from-cyan-500 to-teal-500" icon={GraduationCap} change={0} sparkData={[5,6,5,7,8,7,6]} onClick={()=>navigate("/students/list")}/>
        <StatCard label="Parents" value={dashboardData.parents} gradient="bg-gradient-to-br from-blue-500 to-blue-600" icon={UserCheck} change={0} sparkData={[8,10,9,11,12,11,10]} onClick={()=>navigate("/parents/list")}/>
        {/* Teachers were already in the payload but had no tile; the row also
            balances at four across. */}
        <StatCard label="Teachers" value={dashboardData.teachers} gradient="bg-gradient-to-br from-amber-500 to-orange-600" icon={GraduationCap} change={0} sparkData={[2,3,2,4,3,4,3]} onClick={()=>navigate("/employee/list")}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-4">
        {/* The donut alone said nothing — no legend, no values, and an all-zero
            month rendered as a single mystery ring. The net figure now sits in
            the middle (that is the number anyone opens this card for) and both
            series are labelled with their amounts. */}
        <Card
          action={
            <button type="button" onClick={() => navigate("/reports/financial")}
              className="group inline-flex items-center gap-1 text-[12px] font-semibold focus:outline-none"
              style={{ color: "var(--erp-primary)" }}>
              Financial report
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          }
          title="Income Vs Expense" subtitle="This period" className="lg:col-span-2">
          <div className="p-4">
            {(() => {
              const income = Number(dashboardData.incomeExpense?.income) || 0;
              const expense = Number(dashboardData.incomeExpense?.expense) || 0;
              const net = income - expense;
              const inr = (v) => `₹${Math.abs(v).toLocaleString("en-IN")}`;

              if (!income && !expense) {
                return (
                  <div className="h-[200px] flex items-center justify-center text-[13px] text-slate-600">
                    No income or expense recorded yet.
                  </div>
                );
              }

              return (
                <>
                  <div className="relative">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={[{ name: "Income", value: income }, { name: "Expense", value: expense }]}
                          cx="50%" cy="50%" innerRadius={62} outerRadius={86} paddingAngle={3} dataKey="value"
                          stroke="#ffffff" strokeWidth={2}
                        >
                          <Cell fill="#2a78d6" />
                          <Cell fill="#eb6834" />
                        </Pie>
                        <Tooltip content={<Tip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* The hole is the only place a donut has for its headline. */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">Net</span>
                      <span className="text-[19px] font-bold leading-tight"
                            style={{ color: net < 0 ? "#eb6834" : "var(--erp-text)" }}>
                        {net < 0 ? "−" : ""}{inr(net)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {[
                      { label: "Income", value: income, color: "#2a78d6" },
                      { label: "Expense", value: expense, color: "#eb6834" },
                    ].map((r) => (
                      <div key={r.label} className="flex items-center gap-2 text-[12.5px]">
                        <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: r.color }} />
                        <span className="text-slate-700">{r.label}</span>
                        <span className="ml-auto font-semibold" style={{ color: "var(--erp-text)" }}>{inr(r.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </Card>
        {/* Monthly fees are a part-to-whole over time — collected + remaining IS
            the month's total — so they stack. The previous three overlapping
            area series plotted the total as its own flat line, which carried no
            information and hid the two series that did.

            Colours are categorical slots 1 and 2 of the validated palette
            (blue / orange, CVD ΔE 24.7). */}
        <Card
          action={
            <button type="button" onClick={() => navigate("/reports/fees")}
              className="group inline-flex items-center gap-1 text-[12px] font-semibold focus:outline-none"
              style={{ color: "var(--erp-primary)" }}>
              Fee report
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          }
          title="Monthly Fee Summary" subtitle="Collected vs still due, month by month" className="lg:col-span-3">
          <div className="p-4">
            {(dashboardData.monthlyFees || []).length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-[13px] text-slate-600">
                No fee activity recorded yet.
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dashboardData.monthlyFees} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                    {/* Hairline, solid, horizontal only — the grid is there to
                        read values against, not to be seen. */}
                    <CartesianGrid vertical={false} stroke="#e1e0d9" strokeWidth={1} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#898781" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#898781" }} axisLine={false} tickLine={false} width={56}
                      tickFormatter={(v) => (v >= 1000 ? `₹${(v / 1000).toFixed(v % 1000 ? 1 : 0)}k` : `₹${v}`)}
                    />
                    <Tooltip
                      content={<Tip showTotal />}
                      cursor={{ fill: "rgba(42,120,214,0.06)" }}
                    />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    {/* Bottom of the stack: square at the baseline. */}
                    <Bar dataKey="collected" name="Collected" stackId="fee" fill="#2a78d6" maxBarSize={24}
                         stroke="#ffffff" strokeWidth={2} />
                    {/* Top of the stack carries the 4px rounded data-end. */}
                    <Bar dataKey="remaining" name="Still due" stackId="fee" fill="#eb6834" maxBarSize={24}
                         radius={[4, 4, 0, 0]} stroke="#ffffff" strokeWidth={2} />
                  </BarChart>
                </ResponsiveContainer>

                {/* The same numbers as text. Colour is never the only way to read
                    this card, and a screen reader gets a real table. */}
                <details className="mt-3">
                  <summary className="text-[12px] cursor-pointer select-none" style={{ color: "var(--erp-primary)" }}>
                    View as table
                  </summary>
                  <div className="overflow-x-auto mt-2">
                    <table className="w-full text-[12.5px]">
                      <thead>
                        <tr style={{ background: "var(--erp-head)" }}>
                          {["Month", "Collected", "Still due", "Total"].map((h, i) => (
                            <th key={h} className={`px-3 py-2 font-semibold ${i ? "text-right" : "text-left"}`}
                                style={{ color: "var(--erp-text)" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.monthlyFees.map((r) => {
                          const c = Number(r.collected) || 0, d = Number(r.remaining) || 0;
                          const inr = (v) => `₹${v.toLocaleString("en-IN")}`;
                          return (
                            <tr key={r.month} style={{ borderTop: "1px solid var(--erp-border-soft)" }}>
                              <td className="px-3 py-1.5">{r.month}</td>
                              <td className="px-3 py-1.5 text-right">{inr(c)}</td>
                              <td className="px-3 py-1.5 text-right">{inr(d)}</td>
                              <td className="px-3 py-1.5 text-right font-semibold">{inr(c + d)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </details>
              </>
            )}
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <Card
          action={
            <button type="button" onClick={() => navigate("/attendance/report")}
              className="group inline-flex items-center gap-1 text-[12px] font-semibold focus:outline-none"
              style={{ color: "var(--erp-primary)" }}>
              Attendance report
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          }
          title="Weekly Attendance">
          <div className="p-4">
            {/* Rows can exist with every count at zero (a week with nothing
                marked yet). An empty grid reads as "broken"; say what it is. */}
            {(dashboardData.weeklyAttendance || []).some(
              (d) => (Number(d.present) || 0) + (Number(d.absent) || 0) > 0
            ) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={dashboardData.weeklyAttendance} barCategoryGap="30%" margin={{top:8,right:8,left:0,bottom:0}}>
                  <CartesianGrid vertical={false} stroke="#e1e0d9" strokeWidth={1}/>
                  <XAxis dataKey="day" tick={{fontSize:11,fill:"#898781"}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:"#898781"}} axisLine={false} tickLine={false} width={34} allowDecimals={false}/>
                  <Tooltip content={<Tip unit="count"/>} cursor={{fill:"rgba(42,120,214,0.06)"}}/>
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12,paddingTop:8}}/>
                  {/* Same two hues as every other chart on this page, so a colour
                      means the same thing wherever the eye lands. */}
                  <Bar dataKey="present" name="Present" fill="#2a78d6" maxBarSize={22} radius={[4,4,0,0]} stroke="#ffffff" strokeWidth={2}/>
                  <Bar dataKey="absent"  name="Absent"  fill="#eb6834" maxBarSize={22} radius={[4,4,0,0]} stroke="#ffffff" strokeWidth={2}/>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex flex-col items-center justify-center gap-1 text-center">
                <p className="text-[13px] text-slate-700">No attendance marked this week</p>
                <p className="text-[11.5px] text-slate-600">Mark it from Attendance → Student Attendance.</p>
              </div>
            )}
          </div>
        </Card>
        <div className="space-y-3">
          {/* Fee Collection — drills into the class-wise fee summary. */}
          <Card>
            <button
              type="button"
              onClick={()=>navigate("/fee-management/class-fee-summary")}
              className="w-full text-left p-4 rounded-xl cursor-pointer hover:bg-slate-50/60 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700">Fee Collection</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">This Month</span>
              </div>
              <p className="text-2xl font-bold text-slate-800">₹{(dashboardData.feeCollection?.collected || 0).toLocaleString()}</p>
              <p className="text-xs text-slate-400 mb-3">of ₹{(dashboardData.feeCollection?.total || 0).toLocaleString()}</p>
              <ProgressBar value={dashboardData.feeCollection?.percentage || 0} color="indigo"/>
            </button>
          </Card>
          <LinkCard to="/payments/monthly" title="Pending Fees">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle size={18}/>
              </span>
              <div>
                <p className="text-[22px] font-bold leading-none" style={{ color: "#eb6834" }}>
                  ₹{(dashboardData.pendingFees || 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[11px] text-slate-600 mt-1">still to be collected</p>
              </div>
            </div>
          </LinkCard>
          <LinkCard
            to="/attendance/student"
            title="Today's Attendance"
            badge={
              <span className="text-[11px] font-bold" style={{ color: "var(--erp-text)" }}>
                {dashboardData.attendance?.percentage || 0}%
              </span>
            }
          >
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "#2a78d6" }} />
                <div>
                  <p className="text-[20px] font-bold leading-none" style={{ color: "var(--erp-text)" }}>
                    {dashboardData.attendance?.present || 0}
                  </p>
                  <p className="text-[11px] text-slate-600">Present</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-[2px]" style={{ background: "#eb6834" }} />
                <div>
                  <p className="text-[20px] font-bold leading-none" style={{ color: "var(--erp-text)" }}>
                    {dashboardData.attendance?.absent || 0}
                  </p>
                  <p className="text-[11px] text-slate-600">Absent</p>
                </div>
              </div>
            </div>
            <ProgressBar value={dashboardData.attendance?.percentage || 0} color="indigo" className="mt-3"/>
          </LinkCard>
        </div>
      </div>
      <Card title="Recent Activities" subtitle="Latest admissions & fee payments — click a row for full details">
        <div className="divide-y divide-slate-50">
          {dashboardData.activities && dashboardData.activities.length > 0 ? (
            dashboardData.activities.map((a,i)=>(
              <button
                key={i}
                type="button"
                onClick={()=>setSelectedActivity(a)}
                className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-slate-50/60 transition-colors cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg ${a.bg || "bg-indigo-50"} flex items-center justify-center flex-shrink-0 text-sm`}>{a.icon || "📋"}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-700">{a.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">{a.detail}</p>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1"><Clock size={10}/>{a.time}</span>
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-slate-400">No recent activities</div>
          )}
        </div>
      </Card>

      {/* Activity detail panel — opens when a Recent Activities row is clicked. */}
      <Modal
        open={!!selectedActivity}
        onClose={()=>setSelectedActivity(null)}
        title={selectedActivity?.title || "Activity"}
        size="md"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${selectedActivity.bg || "bg-indigo-50"} flex items-center justify-center text-lg`}>{selectedActivity.icon || "📋"}</div>
              <div>
                <p className="text-sm font-semibold text-slate-700">{selectedActivity.detail}</p>
                <p className="text-[11px] text-slate-400 flex items-center gap-1"><Clock size={10}/>{selectedActivity.time}</p>
              </div>
            </div>
            <dl className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {(selectedActivity.details || []).map((d,i)=>(
                <div key={i} className="flex items-start gap-3 px-4 py-2.5 odd:bg-slate-50/40">
                  <dt className="text-[12px] text-slate-500 w-36 flex-shrink-0">{d.label}</dt>
                  <dd className="text-[12px] font-medium text-slate-700 break-words">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Modal>
    </div>
  );
}
