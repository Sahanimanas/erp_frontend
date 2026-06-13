/**
 * Settings → Sessions
 * ─────────────────────────────────────────────────────────────────────────────
 * Configure the academic sessions for the school by a From Year → To Year range
 * (e.g. 2025 → 2026 ⇒ "2025-2026", April 1st → March 31st). Every "Session"
 * dropdown across the app (Add Student, Admission, …) reads these, so a session
 * added here is available everywhere instantly.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { CalendarRange, Plus, Trash2 } from "lucide-react";
import {
  useGetSessionsQuery,
  useCreateSessionMutation,
  useDeleteSessionMutation,
} from "../../redux/api/academicApi";

const fmt = (d) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—");
const thisYear = new Date().getFullYear();

export default function ManageSessionsPage() {
  usePageTitle("Sessions");

  const { data: sessions = [], isLoading } = useGetSessionsQuery();
  const [createSession, { isLoading: creating }] = useCreateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();

  const [fromYear, setFromYear] = useState(String(thisYear));
  const [toYear, setToYear] = useState(String(thisYear + 1));

  const addSession = async () => {
    const from = parseInt(fromYear, 10);
    const to = parseInt(toYear, 10);
    if (!from || !to) return toast.error("Enter a valid From and To year");
    if (to <= from) return toast.error("To year must be after From year");
    const name = `${from}-${to}`;
    // Indian academic session runs April 1 (from) → March 31 (to).
    const startDate = new Date(Date.UTC(from, 3, 1)).toISOString();
    const endDate = new Date(Date.UTC(to, 2, 31)).toISOString();
    try {
      await createSession({ name, startDate, endDate }).unwrap();
      toast.success(`Session “${name}” added`);
    } catch (e) {
      toast.error(e?.data?.error || "Could not add session");
    }
  };

  const removeSession = async (s) => {
    if (!window.confirm(`Delete session “${s.name}”? This is blocked if classes are assigned to it.`)) return;
    try {
      await deleteSession(s.id).unwrap();
      toast.success("Session deleted");
    } catch (e) {
      toast.error(e?.data?.error || "Could not delete session");
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Sessions"
        subtitle="Add academic sessions by year range. These appear in every session dropdown across the app."
        icon={<CalendarRange size={18} />}
      />

      <Card title="Add Session" subtitle="Indian academic session: April → March">
        <div className="p-7 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <Input
              label="From Year *"
              type="number"
              min="2000"
              max="2100"
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              placeholder="e.g. 2025"
            />
            <Input
              label="To Year *"
              type="number"
              min="2000"
              max="2100"
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              placeholder="e.g. 2026"
            />
            <Button icon={<Plus size={14} />} loading={creating} onClick={addSession}>Add Session</Button>
          </div>
          <p className="text-[12px] text-slate-500">
            Preview:{" "}
            <span className="font-semibold text-slate-700">
              {fromYear && toYear ? `${fromYear}-${toYear}` : "—"}
            </span>{" "}
            (Apr {fromYear || "—"} → Mar {toYear || "—"})
          </p>
        </div>
      </Card>

      <Card title="Sessions" subtitle={`${sessions.length} configured`}>
        <div className="p-7">
          {isLoading ? (
            <p className="text-sm text-slate-400 py-6 text-center">Loading sessions…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No sessions yet. Add your first session above.</p>
          ) : (
            <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center justify-between px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center gap-3 min-w-0">
                    <CalendarRange size={16} className="text-emerald-600 shrink-0" />
                    <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                    <span className="text-[11px] text-slate-400">{fmt(s.startDate)} → {fmt(s.endDate)}</span>
                  </div>
                  <button
                    onClick={() => removeSession(s)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50"
                    title="Delete session"
                  >
                    <Trash2 size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  );
}
