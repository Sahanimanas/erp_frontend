/**
 * ChangePasswordPage.jsx — wired to POST /auth/change-password
 *
 * The endpoint changes the password of whichever account the ACCESS TOKEN
 * belongs to — it takes no user id. A Super Admin who opens this page while
 * still in their own session (instead of after Schools → "Login as Admin") is
 * therefore editing their OWN login, not the school's. That mistake used to be
 * invisible: the old password never matched, and once it did, the school's
 * credentials were unchanged while the platform password had silently moved.
 *
 * So the page now leads with the account it is about to change, read straight
 * from /auth/me (the token's own identity, not the possibly-stale Redux copy),
 * and tells a Super Admin where the school-password flow actually lives.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { Lock, Eye, EyeOff, CheckCircle2, ShieldAlert, User2 } from "lucide-react";
import apiClient from "../../services/axios";

export default function ChangePasswordPage() {
  usePageTitle("Change Password");
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ old: false, next: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  // The account this form will actually change, per the token in use.
  const [account, setAccount] = useState(null);

  useEffect(() => {
    let alive = true;
    apiClient
      .get("/auth/me")
      .then((res) => { if (alive) setAccount(res.data?.data ?? null); })
      .catch(() => { /* the banner is a safety net, not a blocker */ });
    return () => { alive = false; };
  }, []);

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const toggle = (k) => () => setShow((p) => ({ ...p, [k]: !p[k] }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

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
        // The API names the account it changed — show that, not a bare "done",
        // so there is no doubt which login the new password belongs to.
        setSuccess(res.data.message || "Password changed successfully.");
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
        className="absolute right-3.5 top-[34px] text-slate-400 hover:text-slate-600"
        tabIndex={-1}
      >
        {show[showKey] ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );

  const fullName = [account?.firstName, account?.lastName].filter(Boolean).join(" ").trim();
  const isSuperAdmin = account?.role === "SUPER_ADMIN";

  return (
    <div className="max-w-lg mx-auto">
      <PageHeader title="Change Password" subtitle="Account" icon={<Lock size={18} />} />
      <Card className="p-7">
        <form onSubmit={submit} className="space-y-4">
          {/* Whose password is about to change. */}
          {account && (
            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
              <User2 size={16} className="mt-0.5 shrink-0 text-slate-400" />
              <div className="min-w-0 text-[12px] leading-relaxed">
                <p className="text-slate-500">You are changing the password for</p>
                <p className="font-semibold text-slate-800 break-all">
                  {account.email}
                  {fullName ? <span className="font-normal text-slate-500"> · {fullName}</span> : null}
                </p>
                <p className="text-slate-500">
                  {account.role}
                  {account.school?.name ? ` · ${account.school.name}` : ""}
                </p>
              </div>
            </div>
          )}

          {/* A Super Admin almost never means to change their own login here. */}
          {isSuperAdmin && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-500" />
              <div className="text-[12px] leading-relaxed text-amber-800">
                <p className="font-semibold">This changes the platform Super Admin login, not a school's.</p>
                <p className="mt-0.5">
                  To change a school admin's password, open{" "}
                  <Link to="/super-admin/schools" className="font-semibold underline">Super Admin → Schools</Link>{" "}
                  → the school → <b>Reset Password</b>. Use <b>Login as Admin</b> first if you want to change it
                  from inside that school's session.
                </p>
              </div>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-sm">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> <span>{success}</span>
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
