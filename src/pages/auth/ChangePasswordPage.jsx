/**
 * ChangePasswordPage.jsx — wired to POST /auth/change-password
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import apiClient from "../../services/axios";

export default function ChangePasswordPage() {
  usePageTitle("Change Password");
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ old: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => () => setShow((p) => ({ ...p, [k]: !p[k] }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("New password and confirmation do not match");
      return;
    }
    const pw = form.newPassword;
    const rules = [
      [pw.length >= 8, "at least 8 characters"],
      [/[A-Z]/.test(pw), "an uppercase letter"],
      [/[a-z]/.test(pw), "a lowercase letter"],
      [/[0-9]/.test(pw), "a number"],
      [/[!@#$%^&*]/.test(pw), "a special character (!@#$%^&*)"],
    ];
    const missing = rules.filter(([ok]) => !ok).map(([, label]) => label);
    if (missing.length) {
      setError(`Password must contain ${missing.join(", ")}.`);
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/auth/change-password", {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      if (res.data.success) {
        setSuccess(true);
        setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(res.data.error || "Failed to change password");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Inlined (not a nested component) so the inputs keep focus between keystrokes.
  const pwField = (label, field, showKey) => (
    <div className="relative">
      <Input
        label={label}
        type={show[showKey] ? "text" : "password"}
        value={form[field]}
        onChange={set(field)}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={toggle(showKey)}
        className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Change Password" subtitle="Account" icon={<Lock size={18} />} />
      <Card className="p-7">
        <form onSubmit={submit} className="space-y-4">
          {success && (
            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm">
              <CheckCircle2 size={16} /> Password changed successfully.
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
          )}
          {pwField("Current Password *", "oldPassword", "old")}
          {pwField("New Password *", "newPassword", "next")}
          {pwField("Confirm New Password *", "confirmPassword", "confirm")}
          <p className="text-[11px] text-slate-400">Must be 8+ characters with an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*).</p>
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Update Password"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
