import { useEffect, useRef, useState, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea, Badge } from "../../components/ui";
import apiClient from "../../services/axios";
import { MessageCircle, Send, Link2, LogOut, Paperclip, RefreshCw, Megaphone, AlertTriangle, X, FileUp, ShieldCheck } from "lucide-react";
import { useGetClassesQuery, useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useGetStudentsQuery } from "../../redux/api/studentsApi";

// Kept in step with the server's allow-list (backend/src/modules/whatsapp/media.ts).
const ACCEPTED_FILES =
  ".jpg,.jpeg,.png,.gif,.webp,.mp4,.3gp,.mkv,.mp3,.ogg,.m4a,.aac,.wav,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.txt,.zip";

const prettySize = (bytes) =>
  bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * Upload-once attachment handling. The file goes to the server a single time
 * and every send (one recipient or a whole class) then quotes the returned
 * mediaId — the browser never re-uploads per recipient.
 */
function useAttachment(flash) {
  const [file, setFile] = useState(null); // { mediaId, filename, mediaType, size }
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const pick = async (e) => {
    const chosen = e.target.files?.[0];
    if (!chosen) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", chosen);
      const { data } = await apiClient.post("/whatsapp/media", form, {
        // Let the browser set multipart/form-data with its own boundary, and
        // allow a big PDF the time it needs.
        headers: { "Content-Type": undefined },
        timeout: 300_000,
      });
      setFile(data.data);
    } catch (err) {
      flash("error", err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const clear = () => setFile(null);
  return { file, uploading, pick, clear, inputRef };
}

function AttachmentField({ attachment, label = "Attach a file (optional)", hint }) {
  const { file, uploading, pick, clear, inputRef } = attachment;
  return (
    <div className="rounded-lg border border-dashed border-slate-200 p-3">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <Paperclip size={13} /> {label}
      </div>

      {file ? (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
          <FileUp size={15} className="shrink-0 text-indigo-500" />
          <span className="min-w-0 flex-1 truncate text-[12.5px] font-medium text-slate-700">{file.filename}</span>
          <span className="shrink-0 text-[11px] text-slate-400">{file.mediaType} · {prettySize(file.size)}</span>
          <button type="button" onClick={clear} className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600" title="Remove attachment">
            <X size={14} />
          </button>
        </div>
      ) : (
        <>
          <input ref={inputRef} type="file" accept={ACCEPTED_FILES} onChange={pick} disabled={uploading}
            className="block w-full text-[12.5px] text-slate-600 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-[12.5px] file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100" />
          <p className="mt-1.5 text-[11px] text-slate-400">
            {uploading ? "Uploading…" : hint || "Images, video, audio, PDF, Word, Excel, PowerPoint, CSV or ZIP."}
          </p>
        </>
      )}
    </div>
  );
}

const STATUS_BADGE = {
  connected: "success",
  qr: "info",
  connecting: "warning",
  disconnected: "default",
};
const STATUS_LABEL = {
  connected: "Connected",
  qr: "Scan QR",
  connecting: "Connecting…",
  disconnected: "Not linked",
};

export default function WhatsAppPage() {
  usePageTitle("WhatsApp");
  const [state, setState] = useState({ status: "disconnected" });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const pollRef = useRef(null);

  const flash = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/whatsapp/status");
      setState(data.data || { status: "disconnected" });
    } catch {
      /* ignore transient poll errors */
    }
  }, []);

  // Poll the session state while a link is in progress, stop once settled.
  useEffect(() => {
    fetchStatus();
    return () => clearInterval(pollRef.current);
  }, [fetchStatus]);

  useEffect(() => {
    const linking = state.status === "qr" || state.status === "connecting";
    clearInterval(pollRef.current);
    // Fast while linking (the QR refreshes); slow once connected, just to keep
    // the queue depth and daily-allowance meter current.
    if (linking) pollRef.current = setInterval(fetchStatus, 3000);
    else if (state.status === "connected") pollRef.current = setInterval(fetchStatus, 20000);
    return () => clearInterval(pollRef.current);
  }, [state.status, fetchStatus]);

  const connect = async () => {
    setBusy(true);
    try {
      const { data } = await apiClient.post("/whatsapp/connect");
      setState(data.data);
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to start session");
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    setBusy(true);
    try {
      await apiClient.post("/whatsapp/logout");
      setState({ status: "disconnected" });
      flash("success", "WhatsApp disconnected");
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to disconnect");
    } finally {
      setBusy(false);
    }
  };

  const connected = state.status === "connected";

  return (
    <div>
      <PageHeader title="WhatsApp" subtitle="Link your number once and send messages & media to anyone" icon={<MessageCircle size={18} />}>
        {state.requiresRelink
          ? <Badge variant="warning" dot>Relink needed</Badge>
          : <Badge variant={STATUS_BADGE[state.status]} dot>{STATUS_LABEL[state.status]}</Badge>}
      </PageHeader>

      {toast && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm font-medium ${toast.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {toast.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ConnectionPanel
          state={state}
          busy={busy}
          connected={connected}
          onConnect={connect}
          onLogout={logout}
          onRefresh={fetchStatus}
        />
        <SendPanel connected={connected} flash={flash} />
      </div>

      <BroadcastPanel connected={connected} flash={flash} />
      <TemplatesPanel flash={flash} />
    </div>
  );
}

// ─── Broadcast: send one message to many students (all / class / section / picked) ─
function BroadcastPanel({ connected, flash }) {
  const [target, setTarget] = useState("all"); // all | class | section | selected
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [picked, setPicked] = useState([]); // student ids for "selected"
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const attachment = useAttachment(flash);

  const { data: classes = [] } = useGetClassesQuery();
  const { data: sections = [] } = useGetSectionsQuery(classId, { skip: !classId });
  // Student picker list (only when narrowing to specific students).
  const { data: studentResp, isFetching: searching } = useGetStudentsQuery(
    { ...(search ? { search } : {}), ...(classId ? { classId } : {}), limit: 50 },
    { skip: target !== "selected" || (!search && !classId) }
  );
  const students = studentResp?.data ?? [];

  const order = { Nursery: -3, LKG: -2, UKG: -1 };
  const sortedClasses = [...classes].sort((a, b) => (order[a.name] ?? Number(a.name) ?? 0) - (order[b.name] ?? Number(b.name) ?? 0));

  const togglePick = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const send = async () => {
    if (!message.trim() && !attachment.file) return flash("error", "Enter a message or attach a file to broadcast");
    const body = { message: message.trim() };
    // One message per parent: the file carries the text as its caption.
    if (attachment.file) body.media = { mediaId: attachment.file.mediaId };
    if (target === "class") { if (!classId) return flash("error", "Select a class"); body.classId = classId; }
    if (target === "section") { if (!sectionId) return flash("error", "Select a section"); body.sectionId = sectionId; }
    if (target === "selected") { if (!picked.length) return flash("error", "Pick at least one student"); body.studentIds = picked; }

    const label = target === "all" ? "ALL students" : target === "class" ? "the class" : target === "section" ? "the section" : `${picked.length} student(s)`;
    const what = attachment.file ? `"${attachment.file.filename}"${message.trim() ? " with your message" : ""}` : "this message";
    if (!window.confirm(`Send ${what} to ${label}? This messages each phone number once.`)) return;

    setSending(true);
    setResult(null);
    try {
      const { data } = await apiClient.post("/whatsapp/broadcast", body);
      setResult(data.data);
      flash("success", data.message || "Broadcast sent");
    } catch (e) {
      flash("error", e.response?.data?.error || "Broadcast failed");
    } finally { setSending(false); }
  };

  return (
    <Card className="mt-5 p-5 sm:p-6">
      <h3 className="mb-1 flex items-center gap-2 text-base font-semibold text-slate-700"><Megaphone size={16} /> Broadcast Message</h3>
      <p className="mb-4 text-xs text-slate-500">Send one message to many students at once — everyone, a whole class, a single section, or a hand-picked set. Each phone number is messaged once.</p>

      <div className="space-y-4">
        <div className="flex flex-wrap gap-4">
          {[["all", "All Students"], ["class", "By Class"], ["section", "By Section"], ["selected", "Selected Students"]].map(([v, l]) => (
            <label key={v} className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="radio" name="bcTarget" checked={target === v} onChange={() => { setTarget(v); setResult(null); }} className="accent-indigo-600" /> {l}
            </label>
          ))}
        </div>

        {(target === "class" || target === "section" || target === "selected") && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select label="Class" value={classId} onChange={(e) => { setClassId(e.target.value); setSectionId(""); }}
              options={[{ value: "", label: target === "selected" ? "All Classes" : "Select Class" }, ...sortedClasses.map((c) => ({ value: c.id, label: c.name }))]} />
            {target === "section" && (
              <Select label="Section" value={sectionId} onChange={(e) => setSectionId(e.target.value)} disabled={!classId}
                options={[{ value: "", label: "Select Section" }, ...sections.map((s) => ({ value: s.id, label: s.name }))]} />
            )}
            {target === "selected" && (
              <Input label="Search student" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name / roll / phone…" />
            )}
          </div>
        )}

        {target === "selected" && (
          <div className="rounded-lg border border-slate-200 max-h-52 overflow-y-auto">
            {searching ? (
              <p className="p-3 text-[12px] text-slate-400">Searching…</p>
            ) : students.length === 0 ? (
              <p className="p-3 text-[12px] text-slate-400">{search || classId ? "No students found." : "Search or pick a class to list students."}</p>
            ) : (
              students.map((s) => (
                <label key={s.id} className="flex items-center gap-2 px-3 py-2 text-[12.5px] border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50">
                  <input type="checkbox" checked={picked.includes(s.id)} onChange={() => togglePick(s.id)} className="accent-indigo-600 w-4 h-4" />
                  <span className="font-semibold text-slate-700">{s.rollNumber}</span>
                  <span className="text-slate-600">{s.user?.firstName} {s.user?.lastName}</span>
                  {!s.user?.phone && <span className="text-[10px] text-red-400">(no phone)</span>}
                </label>
              ))
            )}
            {picked.length > 0 && <p className="p-2 text-[11px] text-indigo-600 font-semibold">{picked.length} selected</p>}
          </div>
        )}

        <Textarea
          label={attachment.file ? "Message (sent as the file's caption)" : "Message"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type the message to send…"
          rows={4}
        />
        <p className="-mt-2 text-[11px] text-slate-400">
          Tip: write <span className="font-mono">{"{Dear|Hello|Hi}"}</span> to vary the wording per parent — hundreds of
          word-for-word identical messages is one of the things WhatsApp scores as spam.
        </p>

        <AttachmentField
          attachment={attachment}
          label="Attach a file to the broadcast (optional)"
          hint="Uploaded once, then sent to every recipient — circular PDF, timetable, photo, fee notice."
        />

        {result && (
          <div className="rounded-lg bg-emerald-50 text-emerald-700 px-4 py-2.5 text-[12.5px]">
            Queued <b>{result.queued}</b> of {result.recipients} number(s){result.skippedNoPhone ? ` · ${result.skippedNoPhone} had no phone` : ""}. WhatsApp will send about one every minute in the background.
          </div>
        )}

        {!connected && <p className="text-xs text-amber-600">Link a number first to enable broadcasting.</p>}
        <Button icon={<Send size={14} />} disabled={!connected || sending || attachment.uploading} onClick={send}>
          {sending ? "Sending…" : attachment.uploading ? "Uploading…" : "Send Broadcast"}
        </Button>
      </div>
    </Card>
  );
}

// ─── Message templates (placeholders + auto-send events) ─────────────────────
const TEMPLATE_EVENTS = [
  { value: "MANUAL", label: "Manual only", badge: "default" },
  { value: "STUDENT_CREATED", label: "Auto — new student created", badge: "info" },
  { value: "PAYMENT_RECEIVED", label: "Auto — payment received", badge: "success" },
];
const PLACEHOLDERS = "{{name}} {{className}} {{rollNumber}} {{fatherName}} {{school}} {{phone}} — payment only: {{receiptNo}} {{total}} {{lines}} {{date}}";
const BLANK_TPL = { name: "", event: "MANUAL", enabled: true, body: "" };

function TemplatesPanel({ flash }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | {id?, ...form}
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await apiClient.get("/whatsapp/templates");
      setTemplates(data.data || []);
    } catch { /* panel stays empty */ }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing.name.trim() || !editing.body.trim()) return flash("error", "Template name and message are required");
    setSaving(true);
    try {
      await apiClient.post("/whatsapp/templates", editing);
      flash("success", "Template saved");
      setEditing(null);
      load();
    } catch (e) { flash("error", e.response?.data?.error || "Failed to save template"); }
    finally { setSaving(false); }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete template "${t.name}"?`)) return;
    try { await apiClient.delete(`/whatsapp/templates/${t.id}`); flash("success", "Template deleted"); load(); }
    catch (e) { flash("error", e.response?.data?.error || "Failed to delete"); }
  };

  const toggleEnabled = async (t) => {
    try { await apiClient.post("/whatsapp/templates", { ...t, enabled: !t.enabled }); load(); }
    catch (e) { flash("error", e.response?.data?.error || "Failed to update"); }
  };

  const eventMeta = (v) => TEMPLATE_EVENTS.find((e) => e.value === v) || TEMPLATE_EVENTS[0];

  return (
    <Card className="mt-5 p-5 sm:p-6">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-700">Message Templates</h3>
        <Button size="sm" onClick={() => setEditing({ ...BLANK_TPL })}>+ Add Template</Button>
      </div>
      <p className="mb-4 text-xs text-slate-500">
        Reusable messages with placeholders. Templates bound to an <b>Auto</b> event are sent automatically —
        e.g. a welcome message when a student is created, or the receipt when a payment is recorded.
      </p>

      {loading ? (
        <p className="py-6 text-center text-sm text-slate-400">Loading templates…</p>
      ) : templates.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-400">No templates yet — add a welcome or receipt template.</p>
      ) : (
        <div className="space-y-2">
          {templates.map((t) => (
            <div key={t.id} className="flex items-start gap-3 rounded-lg border border-slate-200 px-4 py-3">
              <label className="mt-0.5 flex items-center" title={t.enabled ? "Enabled" : "Disabled"}>
                <input type="checkbox" checked={t.enabled} onChange={() => toggleEnabled(t)} className="accent-emerald-600 w-4 h-4" />
              </label>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`font-semibold text-[13px] ${t.enabled ? "text-slate-800" : "text-slate-400 line-through"}`}>{t.name}</span>
                  <Badge variant={eventMeta(t.event).badge}>{eventMeta(t.event).label}</Badge>
                </div>
                <p className="mt-0.5 truncate text-[11.5px] text-slate-500 whitespace-pre-line line-clamp-2">{t.body}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="xs" variant="secondary" onClick={() => setEditing({ id: t.id, name: t.name, event: t.event, enabled: t.enabled, body: t.body })}>Edit</Button>
                <Button size="xs" variant="danger" onClick={() => remove(t)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="mt-4 rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Template Name *" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Payment receipt" />
            <Select label="When to send" value={editing.event} onChange={(e) => setEditing({ ...editing, event: e.target.value })}
              options={TEMPLATE_EVENTS.map((ev) => ({ value: ev.value, label: ev.label }))} />
          </div>
          <Textarea label="Message *" rows={5} value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })}
            placeholder={"Dear {{name}}, welcome to {{school}}!"} />
          <p className="text-[11px] text-slate-500">Placeholders: <span className="font-mono">{PLACEHOLDERS}</span></p>
          <div className="flex gap-2">
            <Button size="sm" disabled={saving} onClick={save}>{saving ? "Saving…" : editing.id ? "Update Template" : "Save Template"}</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ConnectionPanel({ state, busy, connected, onConnect, onLogout, onRefresh }) {
  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-1 text-base font-semibold text-slate-700">Connection</h3>
      <p className="mb-4 text-xs text-slate-500">
        Open WhatsApp on your phone → <b>Linked Devices</b> → <b>Link a Device</b>, then scan the code below.
      </p>

      {connected ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <MessageCircle size={28} />
          </div>
          <p className="text-sm text-slate-600">
            Linked number: <span className="font-semibold text-slate-800">{state.number || "—"}</span>
          </p>
          <SafetyMeter health={state.health} />
          <Button variant="danger" icon={<LogOut size={13} />} onClick={onLogout} disabled={busy}>Disconnect</Button>
        </div>
      ) : state.status === "qr" && state.qr ? (
        <div className="flex flex-col items-center gap-3 py-3">
          <img src={state.qr} alt="WhatsApp QR" className="h-56 w-56 rounded-lg border border-slate-200" />
          <p className="text-xs text-slate-500">Waiting for you to scan… this refreshes automatically.</p>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={12} />} onClick={onRefresh}>Refresh</Button>
        </div>
      ) : state.requiresRelink ? (
        // The socket is deliberately parked: WhatsApp logged this number out (or
        // reconnects ran out) and nothing auto-retries, because re-registering a
        // number over and over is what gets it banned. Only this button resumes.
        <div className="flex flex-col items-center gap-3 py-7 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={26} />
          </div>
          <p className="text-sm font-semibold text-slate-700">Relink needed{state.number ? ` for ${state.number}` : ""}</p>
          <p className="max-w-xs text-xs text-slate-500">{state.lastError || "WhatsApp ended this session."}</p>
          <p className="max-w-xs text-[11px] text-slate-400">
            Auto-reconnect is paused on purpose — repeatedly re-registering a number is a common reason WhatsApp blocks it.
            Wait a while before relinking, and avoid large broadcasts right after.
          </p>
          <Button icon={<Link2 size={14} />} onClick={onConnect} disabled={busy}>Link Number Again</Button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-sm text-slate-500">
            {state.status === "connecting" ? "Starting session…" : "No number linked yet."}
          </p>
          <Button icon={<Link2 size={14} />} onClick={onConnect} disabled={busy || state.status === "connecting"}>
            {state.status === "connecting" ? "Connecting…" : "Link Number"}
          </Button>
          {state.lastError && <p className="text-xs text-amber-600">{state.lastError}</p>}
        </div>
      )}
    </Card>
  );
}

/**
 * How much of today's safe sending allowance is left. The caps exist so a
 * school number never looks like a bulk-marketing blaster — the number one
 * reason WhatsApp blocks a number — so it's worth showing them plainly.
 */
function SafetyMeter({ health }) {
  if (!health || health.dailyCap == null) return null;

  const used = health.usedToday ?? 0;
  const cap = health.dailyCap || 1;
  const pct = Math.min(100, Math.round((used / cap) * 100));
  const bar = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-emerald-500";
  const cooldownAt = health.cooldownUntil ? new Date(health.cooldownUntil) : null;

  return (
    <div className="w-full max-w-xs rounded-lg bg-slate-50 px-3 py-2.5">
      <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-slate-500">
        <span className="flex items-center gap-1"><ShieldCheck size={12} /> Safe sending today</span>
        <span className="font-semibold text-slate-700">{used} / {cap}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        {health.usedThisHour ?? 0}/{health.hourlyCap} this hour
        {health.queued ? ` · ${health.queued} waiting in queue` : ""}
        {health.skippedDuplicates ? ` · ${health.skippedDuplicates} duplicate(s) skipped` : ""}
      </p>
      {cooldownAt && (
        <p className="mt-1.5 rounded bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-700">
          Sending paused until {cooldownAt.toLocaleTimeString()} to protect the number.
        </p>
      )}
    </div>
  );
}

function SendPanel({ connected, flash }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [sending, setSending] = useState(false);
  const attachment = useAttachment(flash);

  const send = async () => {
    if (!to.trim()) return flash("error", "Enter a recipient number");
    setSending(true);
    try {
      if (attachment.file) {
        // Uploaded file: the server already knows its name and type, and the
        // message rides along as the caption so it stays ONE WhatsApp message.
        await apiClient.post("/whatsapp/send-media", {
          to: to.trim(),
          mediaId: attachment.file.mediaId,
          caption: message.trim() || undefined,
        });
        flash("success", `${attachment.file.filename} sent`);
        attachment.clear();
      } else if (mediaType && mediaUrl.trim()) {
        await apiClient.post("/whatsapp/send-media", {
          to: to.trim(),
          mediaType,
          url: mediaUrl.trim(),
          caption: message.trim() || undefined,
        });
        flash("success", "Media sent");
        setMediaUrl("");
      } else {
        if (!message.trim()) return flash("error", "Enter a message or attach a file");
        await apiClient.post("/whatsapp/send", { to: to.trim(), message });
        flash("success", "Message sent");
      }
      setMessage("");
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-4 text-base font-semibold text-slate-700">Send Message</h3>
      <div className="space-y-4">
        <Input
          label="Recipient (with country code)"
          placeholder="e.g. 919876543210"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        <Textarea
          label={attachment.file ? "Caption (optional)" : "Message"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={attachment.file ? "Sent along with the file…" : "Type your message…"}
        />

        <AttachmentField attachment={attachment} label="Attach a file (optional)" />

        {!attachment.file && (
          <details className="rounded-lg border border-slate-200 px-3 py-2">
            <summary className="cursor-pointer text-[12px] font-medium text-slate-500">Or send media from a link</summary>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Select
                label="Type"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                options={[
                  { value: "", label: "None" },
                  { value: "image", label: "Image" },
                  { value: "video", label: "Video" },
                  { value: "document", label: "Document" },
                  { value: "audio", label: "Audio" },
                ]}
              />
              <Input label="Media URL" placeholder="https://…" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} disabled={!mediaType} />
            </div>
          </details>
        )}

        {!connected && <p className="text-xs text-amber-600">Link a number first to enable sending.</p>}
        <Button className="w-full" icon={<Send size={14} />} onClick={send} disabled={!connected || sending || attachment.uploading}>
          {sending ? "Sending…" : attachment.uploading ? "Uploading…" : "Send"}
        </Button>
      </div>
    </Card>
  );
}
