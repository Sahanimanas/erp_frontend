/**
 * ParentListPage.jsx
 * Module : parents
 * Page   : Parents List — wired to GET /parents
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, SearchInput, ExportButton } from "../../components/ui";
import apiClient from "../../services/axios";

const PAGE_SIZE = 10;

export default function ParentListPage() {
  usePageTitle("Parents List");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchParents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        ...(search && { search }),
      });
      const res = await apiClient.get(`/parents?${params}`);
      if (res.data.success) {
        setRows(res.data.data || []);
        setTotal(res.data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to load parents");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  // Debounce search; reset to page 1 when the query changes
  useEffect(() => {
    const t = setTimeout(fetchParents, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [fetchParents]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this parent? This also removes their login account.")) return;
    try {
      await apiClient.delete(`/parents/${id}`);
      fetchParents();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete parent");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const guardianName = (row) => `${row.user?.firstName || ""} ${row.user?.lastName || ""}`.trim();
  const childrenNames = (row) => (row.students || [])
    .map(s => `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim())
    .filter(Boolean)
    .join(", ");
  const exportColumns = [
    { label: "Guardian Name", get: (r) => guardianName(r) },
    { label: "Relationship", get: (r) => r.relationship || "" },
    { label: "Occupation", get: (r) => r.occupation || "" },
    { label: "Mobile No", get: (r) => r.user?.phone || "" },
    { label: "Email", get: (r) => r.user?.email || "" },
    { label: "Children", get: (r) => childrenNames(r) },
  ];

  return (
    <div>
      <PageHeader title="Parents List" subtitle="All registered parents" icon="👨‍👩‍👧">
        <Button size="sm" onClick={() => navigate("/parents/add")}>+ Add Parent</Button>
      </PageHeader>

      <Card title="Parents List" action={
        <>
          <ExportButton filename="parents.csv" rows={rows} columns={exportColumns} />
          <SearchInput
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search name, email, mobile..."
          />
        </>
      }>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 m-3 rounded-lg text-sm">{error}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["SL","Guardian Name","Relationship","Occupation","Mobile No","Email","Children","Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">Loading parents…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-400 text-sm">No parents found.</td></tr>
              ) : rows.map((row, i) => {
                const name = `${row.user?.firstName || ""} ${row.user?.lastName || ""}`.trim();
                const children = (row.students || [])
                  .map(s => `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim())
                  .filter(Boolean)
                  .join(", ");
                return (
                  <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{(page - 1) * PAGE_SIZE + i + 1}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700 font-medium">{name || "—"}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.relationship || "—"}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.occupation || "—"}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.user?.phone || "—"}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{row.user?.email || "—"}</td>
                    <td className="px-4 py-3 text-[12.5px] text-slate-700">{children || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/parents/add?id=${row.id}`)}
                          title="Edit"
                          className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-xs border border-slate-300"
                        >⊙</button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          title="Delete"
                          className="w-7 h-7 rounded bg-red-600 hover:bg-red-700 text-white flex items-center justify-center text-xs"
                        >🗑</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            {total === 0 ? "No entries" : `Showing ${(page - 1) * PAGE_SIZE + 1} to ${Math.min(page * PAGE_SIZE, total)} of ${total} entries`}
          </span>
          <div className="flex gap-1 items-center">
            <Button size="xs" variant="secondary" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</Button>
            <span className="px-2">{page} / {totalPages}</span>
            <Button size="xs" variant="secondary" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
