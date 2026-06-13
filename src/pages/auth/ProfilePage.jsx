/**
 * ProfilePage.jsx — wired to GET /auth/me
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, Badge } from "../../components/ui";
import { UserCog } from "lucide-react";
import apiClient from "../../services/axios";

export default function ProfilePage() {
  usePageTitle("My Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/auth/me");
        if (res.data.success) setUser(res.data.data);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";

  const fields = user
    ? [
        ["First Name", user.firstName],
        ["Last Name", user.lastName],
        ["Email", user.email],
        ["Phone", user.phone || "—"],
        ["Role", user.role],
        ["Email Verified", user.emailVerified ? "Yes" : "No"],
        ["Member Since", user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN") : "—"],
        ["Last Login", user.lastLogin ? new Date(user.lastLogin).toLocaleString("en-IN") : "—"],
      ]
    : [];

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="My Profile" subtitle="Account" icon={<UserCog size={18} />} />

      {loading ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Loading profile…</div></Card>
      ) : error ? (
        <Card><div className="p-6 text-center text-red-600 text-sm">{error}</div></Card>
      ) : (
        <Card className="p-7">
          <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
            <Avatar name={fullName} size="lg" />
            <div>
              <h3 className="font-bold text-slate-800 text-lg">{fullName || "—"}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <Badge variant="success" className="mt-1">{user?.role}</Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5">
            {fields.map(([label, value]) => (
              <div key={label} className="bg-slate-50 rounded-lg px-3 py-2.5 flex flex-col">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide leading-4">{label}</span>
                <span className="text-[13px] font-semibold text-slate-700 mt-1 break-words leading-5 min-h-[20px]">{value || "—"}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
