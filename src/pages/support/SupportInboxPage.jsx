/**
 * Platform → Support Inbox (super admin).
 *
 * Every school's issues, feedback and questions in one queue. The header
 * counts what still needs attention rather than what exists, because "how many
 * are waiting on me" is the only number anyone opens this page for.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { LifeBuoy, ArrowLeft, Building2, MessageSquare } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, Badge, DataTable, EmptyState } from "../../components/ui";
import { Loader } from "../../components/loaders/PageLoader";
import {
  useGetTicketsQuery,
  useGetTicketQuery,
  useGetSupportStatsQuery,
  useSetTicketStatusMutation,
} from "../../redux/api/supportApi";
import Thread, { TYPE_TONE, STATUS_TONE, fmtWhen } from "./_thread";

const STATUS_FILTER = [
  { value: "", label: "All statuses" },
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

const TYPE_FILTER = [
  { value: "", label: "All types" },
  { value: "ISSUE", label: "Issues" },
  { value: "QUESTION", label: "Questions" },
  { value: "FEEDBACK", label: "Feedback" },
];

const SET_STATUS = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export default function SupportInboxPage() {
  usePageTitle("Support Inbox");

  const [openId, setOpenId] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");

  const { data: stats } = useGetSupportStatsQuery();
  const { data: tickets = [], isFetching } = useGetTicketsQuery(
    { ...(status ? { status } : {}), ...(type ? { type } : {}) },
    { skip: Boolean(openId) }
  );
  const { data: ticket, isLoading: loadingTicket } = useGetTicketQuery(openId, { skip: !openId });
  const [setTicketStatus] = useSetTicketStatusMutation();

  const changeStatus = async (id, next) => {
    try {
      await setTicketStatus({ id, status: next }).unwrap();
      toast.success(`Marked ${next.replace("_", " ").toLowerCase()}`);
    } catch (err) {
      toast.error(err?.data?.error || "Could not update the status");
    }
  };

  /* ── one thread ───────────────────────────────────────────────────────── */
  if (openId) {
    if (loadingTicket && !ticket) return <Loader minH="400px" />;
    return (
      <div>
        <Button variant="ghost" onClick={() => setOpenId("")} className="mb-4">
          <ArrowLeft size={14} /> Back to inbox
        </Button>
        {ticket ? (
          <Thread
            ticket={ticket}
            isPlatform
            action={
              <div className="w-[170px]">
                <Select
                  options={SET_STATUS}
                  value={ticket.status}
                  onChange={(e) => changeStatus(ticket.id, e.target.value)}
                />
              </div>
            }
          />
        ) : (
          <EmptyState icon="🤷" title="Not found" description="This thread may have been removed." />
        )}
      </div>
    );
  }

  /* ── queue ────────────────────────────────────────────────────────────── */
  const s = stats?.status ?? {};
  return (
    <div>
      <PageHeader
        title="Support Inbox"
        subtitle="Issues, questions and feedback from every school"
        icon={<LifeBuoy />}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Needs attention", value: stats?.pending ?? 0, tone: "var(--erp-warning)" },
          { label: "Open", value: s.OPEN ?? 0, tone: "var(--erp-danger)" },
          { label: "In progress", value: s.IN_PROGRESS ?? 0, tone: "var(--erp-primary)" },
          { label: "Resolved", value: s.RESOLVED ?? 0, tone: "var(--erp-success)" },
        ].map((k) => (
          <div key={k.label} className="bg-white px-4 py-3"
               style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
            <p className="text-[11px] text-slate-600">{k.label}</p>
            <p className="text-[18px] font-bold mt-0.5" style={{ color: k.tone }}>{k.value}</p>
          </div>
        ))}
      </div>

      <Card
        title="All messages"
        subtitle={`${tickets.length} shown`}
        action={
          <div className="flex items-end gap-2">
            <div className="w-[160px]">
              <Select options={TYPE_FILTER} value={type} onChange={(e) => setType(e.target.value)} />
            </div>
            <div className="w-[170px]">
              <Select options={STATUS_FILTER} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
          </div>
        }
        noPadding
      >
        {!isFetching && tickets.length === 0 ? (
          <EmptyState icon="📭" title="Nothing here" description="No school has written in with these filters." />
        ) : (
          <DataTable
            loading={isFetching}
            emptyText="No messages"
            onRowClick={(r) => setOpenId(r.id)}
            columns={[
              {
                key: "schoolName",
                label: "School",
                render: (_v, r) => (
                  <span className="inline-flex items-center gap-2">
                    <Building2 size={13} className="text-slate-500 shrink-0" />
                    <span className="font-semibold">{r.schoolName}</span>
                  </span>
                ),
              },
              {
                key: "subject",
                label: "Subject",
                render: (_v, r) => (
                  <div>
                    <p className="font-semibold">{r.subject}</p>
                    <p className="text-[11px] text-slate-600 line-clamp-1">{r.message}</p>
                  </div>
                ),
              },
              { key: "type", label: "Type", render: (_v, r) => <Badge variant={TYPE_TONE[r.type] ?? "default"}>{r.type}</Badge> },
              {
                key: "priority",
                label: "Priority",
                render: (_v, r) => (r.priority === "HIGH" ? <Badge variant="danger">HIGH</Badge> : r.priority),
              },
              {
                key: "status",
                label: "Status",
                render: (_v, r) => <Badge variant={STATUS_TONE[r.status] ?? "default"}>{r.status.replace("_", " ")}</Badge>,
              },
              {
                key: "replyCount",
                label: "Replies",
                render: (_v, r) => (
                  <span className="inline-flex items-center gap-1 text-slate-700">
                    <MessageSquare size={12} /> {r.replyCount ?? 0}
                  </span>
                ),
              },
              { key: "lastReplyAt", label: "Last activity", render: (_v, r) => fmtWhen(r.lastReplyAt || r.createdAt) },
            ]}
            data={tickets}
          />
        )}
      </Card>
    </div>
  );
}
