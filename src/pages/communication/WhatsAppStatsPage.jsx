import { useCallback, useEffect, useRef, useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, StatCard, Badge, Button } from "../../components/ui";
import apiClient from "../../services/axios";
import { BarChart3, Send, CheckCheck, Eye, XCircle, Clock, RefreshCw, OctagonX } from "lucide-react";

const STATUS_BADGE = { connected: "success", qr: "info", connecting: "warning", disconnected: "default" };
const STATUS_LABEL = { connected: "Connected", qr: "Scan QR", connecting: "Connecting…", disconnected: "Not linked" };

const EMPTY = {
  totals: { sent: 0, failed: 0, delivered: 0, read: 0 },
  today: { sent: 0, failed: 0, delivered: 0, read: 0 },
  daily: [],
  live: { status: "disconnected", queued: 0, reconnects: 0 },
};

const fmtDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { day: "2-digit", month: "short", timeZone: "UTC" });

const fmtTime = (iso) => (iso ? new Date(iso).toLocaleString() : "—");

export default function WhatsAppStatsPage() {
  usePageTitle("WhatsApp — Message Counts");
  const [stats, setStats] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState(null);
  const pollRef = useRef(null);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/whatsapp/stats", { params: { days: 14 } });
      setStats(data.data || EMPTY);
    } catch {
      /* ignore transient poll errors — keep last known counts */
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    pollRef.current = setInterval(fetchStats, 15000); // live delivery/queue updates
    return () => clearInterval(pollRef.current);
  }, [fetchStats]);

  const { totals, today, daily, live } = stats;
  const refresh = () => { setRefreshing(true); fetchStats(); };

  // Emergency stop for a broadcast already in flight. A queued run trickles out
  // ≈1 message/min for hours, so being able to kill it without unlinking the
  // number is the difference between one bad send and a banned number.
  const cancelPending = async () => {
    if (!window.confirm(`Cancel all ${live.queued} message(s) still waiting to send?\n\nThis stops the queue immediately. Your number stays linked.`)) return;
    setCancelling(true);
    try {
      const { data } = await apiClient.post("/whatsapp/cancel-pending");
      setNotice(data.message || "Pending sends cancelled");
      fetchStats();
    } catch (e) {
      setNotice(e.response?.data?.error || "Could not cancel the pending sends");
    } finally {
      setCancelling(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  // Show most recent day first in the table.
  const rows = [...daily].reverse();

  return (
    <div>
      <PageHeader title="Message Counts" subtitle="How many WhatsApp messages this school has sent and how they landed" icon={<BarChart3 size={18} />}>
        <Badge variant={STATUS_BADGE[live.status]} dot>{STATUS_LABEL[live.status]}</Badge>
        {live.queued > 0 && (
          <Button size="sm" variant="danger" icon={<OctagonX size={12} />} onClick={cancelPending} disabled={cancelling}>
            {cancelling ? "Stopping…" : `Stop ${live.queued} Queued`}
          </Button>
        )}
        <Button size="sm" variant="secondary" icon={<RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />} onClick={refresh}>
          Refresh
        </Button>
      </PageHeader>

      {notice && (
        <div className="mb-4 rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700">{notice}</div>
      )}

      {/* All-time totals */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sent" value={totals.sent} icon={Send} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" />
        <StatCard label="Delivered" value={totals.delivered} icon={CheckCheck} gradient="bg-gradient-to-br from-emerald-500 to-emerald-600" />
        <StatCard label="Read" value={totals.read} icon={Eye} gradient="bg-gradient-to-br from-cyan-500 to-cyan-600" />
        <StatCard label="Failed" value={totals.failed} icon={XCircle} gradient="bg-gradient-to-br from-rose-500 to-rose-600" />
      </div>

      {/* Live / today */}
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Sent Today" value={today.sent} icon={Send} gradient="bg-gradient-to-br from-slate-500 to-slate-600" />
        <StatCard label="Failed Today" value={today.failed} icon={XCircle} gradient="bg-gradient-to-br from-amber-500 to-amber-600" />
        <StatCard label="Waiting in Queue" value={live.queued} icon={Clock} gradient="bg-gradient-to-br from-violet-500 to-violet-600" />
        <StatCard label="Reconnects" value={live.reconnects} icon={RefreshCw} gradient="bg-gradient-to-br from-blue-500 to-blue-600" />
      </div>

      <p className="mt-3 text-[11px] text-slate-400">
        Last successful send: <span className="font-medium text-slate-500">{fmtTime(live.lastSentAt)}</span>.
        “Waiting in Queue” is paced automatically (3–10s between sends) to keep the number safe from bans.
      </p>

      {/* Per-day breakdown */}
      <Card className="mt-5" title="Last 14 Days" subtitle="Daily message counts (UTC)">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[11px] uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2.5 font-semibold">Date</th>
                <th className="px-5 py-2.5 text-right font-semibold">Sent</th>
                <th className="px-5 py-2.5 text-right font-semibold">Delivered</th>
                <th className="px-5 py-2.5 text-right font-semibold">Read</th>
                <th className="px-5 py-2.5 text-right font-semibold">Failed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No messages sent yet.</td></tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.date} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-5 py-2.5 font-medium text-slate-700">{fmtDate(d.date)}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-slate-700">{d.sent.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-emerald-600">{d.delivered.toLocaleString()}</td>
                    <td className="px-5 py-2.5 text-right tabular-nums text-cyan-600">{d.read.toLocaleString()}</td>
                    <td className={`px-5 py-2.5 text-right tabular-nums ${d.failed ? "text-rose-600 font-semibold" : "text-slate-400"}`}>{d.failed.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
