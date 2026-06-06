/**
 * IDCardPage.jsx — printable student ID cards from GET /students
 */
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Avatar, Select, SearchInput } from "../../components/ui";
import { IdCard, Printer } from "lucide-react";
import apiClient from "../../services/axios";

export default function IDCardPage() {
  usePageTitle("ID Card");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      setLoading(true); setError("");
      try {
        const res = await apiClient.get("/students?limit=500");
        if (res.data.success) setStudents(res.data.data || []);
      } catch (err) {
        setError(err.response?.data?.error || err.message || "Failed to load students");
      } finally { setLoading(false); }
    })();
  }, []);

  const name = (s) => s.user ? `${s.user.firstName} ${s.user.lastName}` : "—";
  const filtered = students.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return name(s).toLowerCase().includes(q) || (s.rollNumber || "").toLowerCase().includes(q);
  });

  return (
    <div>
      <PageHeader title="ID Card" subtitle="Generate student ID cards" icon={<IdCard size={18} />}>
        <Button size="sm" icon={<Printer size={13} />} onClick={() => window.print()}>Print</Button>
      </PageHeader>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 mb-4 rounded-lg text-sm">{error}</div>}
      <Card className="mb-5">
        <SearchInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll…" className="max-w-xs" />
      </Card>

      {loading ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Loading…</div></Card>
      ) : filtered.length === 0 ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">No students found.</div></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <div key={s.id} className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
                <p className="font-bold text-sm tracking-wide">EduServe School</p>
                <p className="text-[10px] text-white/70">Student Identity Card</p>
              </div>
              <div className="p-4 flex gap-3 items-center">
                <Avatar name={name(s)} size="lg" src={s.photo || undefined} />
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{name(s)}</p>
                  <p className="text-[11px] text-slate-500">Roll: <span className="font-mono">{s.rollNumber}</span></p>
                  <p className="text-[11px] text-slate-500">Class: {s.section?.class?.name || "—"} / {s.section?.name || "—"}</p>
                </div>
              </div>
              <div className="px-4 pb-4 grid grid-cols-2 gap-1 text-[10px] text-slate-500">
                <span>DOB: {s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("en-IN") : "—"}</span>
                <span>Blood: {s.bloodGroup || "—"}</span>
                <span>Gender: {s.gender || "—"}</span>
                <span>Adm: {s.admissionNumber || "—"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
