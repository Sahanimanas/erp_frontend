/**
 * Attendance → Smart Card Attendance
 * Live kiosk preview for RFID / smart-card scans. The reader integration is a
 * device webhook; this screen shows the live scan feed and a toggle to arm it.
 * Until a physical reader is wired, the preview simulates incoming scans so the
 * UX can be validated end-to-end.
 */
import { useState, useEffect, useRef } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, Badge } from "../../components/ui";
import { CreditCard, Wifi, WifiOff } from "lucide-react";
import { useGetStudentsDailyQuery } from "../../redux/api/attendanceApi";
import { today } from "./_attShared";

export default function SmartCardAttendancePage() {
  usePageTitle("Smart Card Attendance");
  const [armed, setArmed] = useState(false);
  const [feed, setFeed] = useState([]); // recent scans
  const idxRef = useRef(0);

  // Roster used as the pool of "cards" the simulated reader recognises.
  const { data: students = [] } = useGetStudentsDailyQuery({ date: today() });

  useEffect(() => {
    if (!armed || students.length === 0) return;
    const t = setInterval(() => {
      const s = students[idxRef.current % students.length];
      idxRef.current += 1;
      setFeed((f) => [{
        id: `${s.studentId}-${idxRef.current}`,
        name: s.name,
        rollNumber: s.rollNumber,
        klass: `${s.className}-${s.sectionName}`,
        at: new Date().toLocaleTimeString("en-GB"),
      }, ...f].slice(0, 12));
    }, 2500);
    return () => clearInterval(t);
  }, [armed, students]);

  return (
    <div className="space-y-4">
      <PageHeader title="Smart Card Attendance" subtitle="RFID / smart-card kiosk preview" icon={<CreditCard size={18} />}>
        <button
          onClick={() => setArmed((a) => !a)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            armed ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"
          }`}
        >
          {armed ? <Wifi size={15} /> : <WifiOff size={15} />}
          {armed ? "Reader ON" : "Reader OFF"}
        </button>
      </PageHeader>

      <Card>
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-4 ${armed ? "bg-emerald-50 text-emerald-600 animate-pulse" : "bg-slate-100 text-slate-400"}`}>
            <CreditCard size={34} />
          </div>
          <p className="text-[15px] font-semibold text-slate-800">
            {armed ? "Waiting for card taps…" : "Reader is off"}
          </p>
          <p className="text-[12px] text-slate-400 mt-1 max-w-md">
            {armed
              ? "Tap a smart card on the reader to mark attendance. Scans appear below in real time."
              : "Turn the reader on to start accepting smart-card taps at this kiosk."}
          </p>
        </div>
      </Card>

      <Card title="Recent Scans" subtitle="Most recent first">
        <div className="divide-y divide-slate-50">
          {feed.length === 0 ? (
            <p className="px-5 py-8 text-center text-xs text-slate-400">No scans yet.</p>
          ) : feed.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={s.name} size="sm" />
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{s.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{s.rollNumber} · {s.klass}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="success" dot>PRESENT</Badge>
                <span className="text-[11px] text-slate-400 font-mono">{s.at}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
