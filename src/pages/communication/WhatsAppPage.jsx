import { useEffect, useRef, useState, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea, Badge } from "../../components/ui";
import apiClient from "../../services/axios";
import { MessageCircle, Send, Link2, LogOut, Paperclip, RefreshCw } from "lucide-react";

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
    const active = state.status === "qr" || state.status === "connecting";
    clearInterval(pollRef.current);
    if (active) pollRef.current = setInterval(fetchStatus, 3000);
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
        <Badge variant={STATUS_BADGE[state.status]} dot>{STATUS_LABEL[state.status]}</Badge>
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
    </div>
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
          <Button variant="danger" icon={<LogOut size={13} />} onClick={onLogout} disabled={busy}>Disconnect</Button>
        </div>
      ) : state.status === "qr" && state.qr ? (
        <div className="flex flex-col items-center gap-3 py-3">
          <img src={state.qr} alt="WhatsApp QR" className="h-56 w-56 rounded-lg border border-slate-200" />
          <p className="text-xs text-slate-500">Waiting for you to scan… this refreshes automatically.</p>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={12} />} onClick={onRefresh}>Refresh</Button>
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

function SendPanel({ connected, flash }) {
  const [to, setTo] = useState("");
  const [message, setMessage] = useState("");
  const [mediaType, setMediaType] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!to.trim()) return flash("error", "Enter a recipient number");
    setSending(true);
    try {
      if (mediaType && mediaUrl.trim()) {
        await apiClient.post("/whatsapp/send-media", {
          to: to.trim(),
          mediaType,
          url: mediaUrl.trim(),
          caption: caption || message || undefined,
        });
        flash("success", "Media sent");
      } else {
        if (!message.trim()) return flash("error", "Enter a message or attach media");
        await apiClient.post("/whatsapp/send", { to: to.trim(), message });
        flash("success", "Message sent");
      }
      setMessage("");
      setMediaUrl("");
      setCaption("");
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
        <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type your message…" />

        <div className="rounded-lg border border-dashed border-slate-200 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <Paperclip size={13} /> Attach Media (optional)
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          <div className="mt-3">
            <Input label="Caption" placeholder="Optional caption" value={caption} onChange={(e) => setCaption(e.target.value)} disabled={!mediaType} />
          </div>
        </div>

        {!connected && <p className="text-xs text-amber-600">Link a number first to enable sending.</p>}
        <Button className="w-full" icon={<Send size={14} />} onClick={send} disabled={!connected || sending}>
          {sending ? "Sending…" : "Send"}
        </Button>
      </div>
    </Card>
  );
}
