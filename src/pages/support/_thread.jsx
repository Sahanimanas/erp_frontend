/**
 * _thread.jsx — the conversation view, shared by the school's screen and the
 * vendor's. Both sides read the same thread, so rendering it twice would be two
 * places to keep in step.
 *
 * `isPlatform` only changes which side is drawn as "mine"; it grants nothing —
 * the server decides what a caller may see and do.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { Send, Building2 } from "lucide-react";
import { Card, Button, Textarea, Badge } from "../../components/ui";
import { useReplyTicketMutation } from "../../redux/api/supportApi";

export const TYPE_TONE = { ISSUE: "danger", FEEDBACK: "info", QUESTION: "warning" };
export const STATUS_TONE = { OPEN: "warning", IN_PROGRESS: "info", RESOLVED: "success", CLOSED: "default" };

export const fmtWhen = (d) =>
  d
    ? new Date(d).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : "—";

/** One message bubble. The vendor's side is tinted so a thread reads at a glance. */
function Bubble({ fromPlatform, author, when, body, mine }) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className="max-w-[78%] px-3.5 py-2.5"
        style={{
          borderRadius: "var(--erp-radius)",
          border: "1px solid var(--erp-border)",
          background: fromPlatform ? "var(--erp-primary-sf)" : "#fff",
        }}
      >
        <p className="text-[11px] font-semibold mb-1" style={{ color: "var(--erp-primary)" }}>
          {fromPlatform ? "Support team" : author || "School"}
          <span className="ml-2 font-normal text-slate-600">{fmtWhen(when)}</span>
        </p>
        <p className="text-[13px] whitespace-pre-wrap" style={{ color: "var(--erp-text)" }}>{body}</p>
      </div>
    </div>
  );
}

export default function Thread({ ticket, isPlatform, action }) {
  const [reply, { isLoading }] = useReplyTicketMutation();
  const [draft, setDraft] = useState("");

  const send = async (e) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return toast.error("Write something first");
    try {
      await reply({ id: ticket.id, body }).unwrap();
      setDraft("");
      toast.success("Sent");
    } catch (err) {
      toast.error(err?.data?.error || "Could not send");
    }
  };

  return (
    <Card
      title={ticket.subject}
      subtitle={
        isPlatform
          ? `${ticket.schoolName} · raised ${fmtWhen(ticket.createdAt)}`
          : `Raised ${fmtWhen(ticket.createdAt)}`
      }
      action={action}
      noPadding
    >
      <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ borderBottom: "1px solid var(--erp-border-soft)" }}>
        <Badge variant={TYPE_TONE[ticket.type] ?? "default"}>{ticket.type}</Badge>
        <Badge variant={STATUS_TONE[ticket.status] ?? "default"}>{ticket.status.replace("_", " ")}</Badge>
        {ticket.priority === "HIGH" && <Badge variant="danger">HIGH PRIORITY</Badge>}
        {isPlatform && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-slate-700">
            <Building2 size={13} /> {ticket.schoolName}
          </span>
        )}
      </div>

      <div className="px-4 py-4 space-y-3 max-h-[380px] overflow-y-auto" style={{ background: "#fafbfc" }}>
        {/* The opening message is part of the conversation, not a header — it is
            the first thing the school said. */}
        <Bubble
          fromPlatform={false}
          author={ticket.createdByName}
          when={ticket.createdAt}
          body={ticket.message}
          mine={!isPlatform}
        />
        {(ticket.replies ?? []).map((r) => (
          <Bubble
            key={r.id}
            fromPlatform={r.fromPlatform}
            author={r.authorName}
            when={r.createdAt}
            body={r.body}
            mine={isPlatform ? r.fromPlatform : !r.fromPlatform}
          />
        ))}
      </div>

      <form className="px-4 py-3 flex items-end gap-3" onSubmit={send} style={{ borderTop: "1px solid var(--erp-border-soft)" }}>
        <div className="flex-1">
          <Textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={isPlatform ? "Reply to this school…" : "Add more details or reply…"}
          />
        </div>
        <Button type="submit" loading={isLoading} icon={<Send size={14} />}>Send</Button>
      </form>
    </Card>
  );
}
