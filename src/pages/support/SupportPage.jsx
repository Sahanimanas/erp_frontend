/**
 * Help & Support — the school's side.
 *
 * Raise an issue, give feedback or ask a question, then follow the thread until
 * the support team resolves it. The school can see the status but never set it:
 * "resolved" is the vendor's statement about their own work.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { LifeBuoy, Plus, ArrowLeft, MessageSquare } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea, Badge, DataTable, EmptyState } from "../../components/ui";
import { Loader } from "../../components/loaders/PageLoader";
import { useGetTicketsQuery, useGetTicketQuery, useCreateTicketMutation } from "../../redux/api/supportApi";
import Thread, { TYPE_TONE, STATUS_TONE, fmtWhen } from "./_thread";

const TYPES = [
  { value: "ISSUE", label: "Issue — something is broken" },
  { value: "QUESTION", label: "Question — how do I…" },
  { value: "FEEDBACK", label: "Feedback — a suggestion" },
];

const PRIORITIES = [
  { value: "NORMAL", label: "Normal" },
  { value: "HIGH", label: "High — work is blocked" },
  { value: "LOW", label: "Low — whenever" },
];

const BLANK = { type: "ISSUE", priority: "NORMAL", subject: "", message: "" };

export default function SupportPage() {
  usePageTitle("Help & Support");

  const [openId, setOpenId] = useState("");
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState(BLANK);

  const { data: tickets = [], isFetching } = useGetTicketsQuery(undefined, { skip: Boolean(openId) });
  const { data: ticket, isLoading: loadingTicket } = useGetTicketQuery(openId, { skip: !openId });
  const [create, { isLoading: sending }] = useCreateTicketMutation();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.subject.trim()) return toast.error("Add a short subject");
    if (!form.message.trim()) return toast.error("Describe the issue");
    try {
      const t = await create(form).unwrap();
      setForm(BLANK);
      setComposing(false);
      // Drop straight into the new thread — the next thing anyone wants is to
      // see that it actually went.
      setOpenId(t.id);
      toast.success("Sent to the support team");
    } catch (err) {
      toast.error(err?.data?.error || "Could not send the message");
    }
  };

  /* ── one thread ───────────────────────────────────────────────────────── */
  if (openId) {
    if (loadingTicket && !ticket) return <Loader minH="400px" />;
    return (
      <div>
        <Button variant="ghost" onClick={() => setOpenId("")} className="mb-4">
          <ArrowLeft size={14} /> Back to all messages
        </Button>
        {ticket ? (
          <Thread ticket={ticket} isPlatform={false} />
        ) : (
          <EmptyState icon="🤷" title="Not found" description="This message may have been removed." />
        )}
      </div>
    );
  }

  /* ── list + compose ───────────────────────────────────────────────────── */
  return (
    <div>
      <PageHeader
        title="Help & Support"
        subtitle="Report an issue, ask a question or send feedback to the support team"
        icon={<LifeBuoy />}
      >
        <Button onClick={() => setComposing((v) => !v)} icon={<Plus size={14} />}>
          {composing ? "Cancel" : "New message"}
        </Button>
      </PageHeader>

      {composing && (
        <Card title="New message" className="mb-4">
          <form className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={submit}>
            <Select label="What is this about" options={TYPES} value={form.type} onChange={set("type")} required />
            <Select label="Priority" options={PRIORITIES} value={form.priority} onChange={set("priority")} />
            <div className="sm:col-span-2">
              <Input label="Subject" required value={form.subject} onChange={set("subject")}
                     placeholder="e.g. Fee receipt is not printing" />
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Details" rows={5} required value={form.message} onChange={set("message")}
                        placeholder="What happened, what you expected, and where in the app it was" />
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <Button type="submit" loading={sending}>Send to support</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Your messages" subtitle={`${tickets.length} in total`} noPadding>
        {!isFetching && tickets.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Nothing sent yet"
            description="Raise an issue or send feedback and the support team will reply here."
            action={<Button onClick={() => setComposing(true)} icon={<Plus size={14} />}>New message</Button>}
          />
        ) : (
          <DataTable
            loading={isFetching}
            emptyText="No messages"
            onRowClick={(r) => setOpenId(r.id)}
            columns={[
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
