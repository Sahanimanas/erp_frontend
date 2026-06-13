/**
 * Super Admin → Reset a school admin's password.
 *
 * Two modes: let the server generate a strong password, or type a custom one.
 * On success the plaintext is shown exactly once (the API never stores it in the
 * clear) with a copy button so it can be handed to the school. Resetting also
 * revokes the admin's existing sessions server-side.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { KeyRound, Copy, Check, ShieldAlert } from "lucide-react";
import { Modal, Button, Input } from "../../components/ui";
import { useResetSchoolAdminPasswordMutation } from "../../redux/api/superAdminApi";

export function ResetPasswordModal({ open, onClose, school }) {
  const [mode, setMode] = useState("generate"); // "generate" | "custom"
  const [password, setPassword] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [reset, { isLoading }] = useResetSchoolAdminPasswordMutation();

  const close = () => {
    // Reset local state so the next open starts clean (and the password isn't
    // left lingering in memory / on screen).
    setMode("generate");
    setPassword("");
    setResult(null);
    setCopied(false);
    onClose();
  };

  const submit = async () => {
    if (mode === "custom" && !password.trim()) {
      toast.error("Enter a password or switch to auto-generate");
      return;
    }
    try {
      const res = await reset({
        id: school.id,
        password: mode === "custom" ? password.trim() : undefined,
      }).unwrap();
      setResult(res);
      toast.success("Password reset");
    } catch (e) {
      toast.error(e?.data?.error || "Failed to reset password");
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <Modal open={open} onClose={close} title={`Reset Admin Password — ${school?.name ?? ""}`} size="md">
      {!result ? (
        <div className="space-y-4">
          <p className="text-[12.5px] text-slate-500">
            This resets the password for{" "}
            <span className="font-semibold text-slate-700">{school?.name}</span>'s admin account and signs out
            their existing sessions.
          </p>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode("generate")}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                mode === "generate"
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-[13px] font-semibold text-slate-800">Auto-generate</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Create a strong random password</div>
            </button>
            <button
              type="button"
              onClick={() => setMode("custom")}
              className={`rounded-xl border px-3 py-3 text-left transition-all ${
                mode === "custom"
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-[13px] font-semibold text-slate-800">Set manually</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Type a specific password</div>
            </button>
          </div>

          {mode === "custom" && (
            <Input
              label="New password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, incl. upper/lower/number"
            />
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button icon={<KeyRound size={15} />} loading={isLoading} onClick={submit}>
              Reset Password
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5">
            <ShieldAlert size={16} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[12px] text-amber-700">
              Copy this password now — it won't be shown again. Share it securely with the school.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">Admin email</label>
            <p className="text-[13px] text-slate-800 font-medium">{result.user?.email}</p>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500">New password</label>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-[13px] font-mono text-slate-800 break-all">
                {result.password}
              </code>
              <Button variant="secondary" icon={copied ? <Check size={15} /> : <Copy size={15} />} onClick={copy}>
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
