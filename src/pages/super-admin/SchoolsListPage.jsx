/**
 * Super Admin → Schools (tenant management)
 * Filterable, searchable, paginated table with row actions.
 */
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { loginSuccess } from "../../redux/slices/authSlice";
import {
  Building2, Eye, Pencil, Ban, CheckCircle2, Trash2, LogIn, Plus,
} from "lucide-react";
import {
  Card, DataTable, Pagination, SearchInput, Select, PageHeader,
  Button, Avatar, Modal, ExportButton,
} from "../../components/ui";
import {
  useGetSchoolsQuery, useGetPlansQuery, useSuspendSchoolMutation,
  useActivateSchoolMutation, useDeleteSchoolMutation, useLoginAsSchoolAdminMutation,
} from "../../redux/api/superAdminApi";
import { StatusBadge, PlanBadge, formatDate } from "./_saShared";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "trial", label: "Trial" },
  { value: "expired", label: "Expired" },
  { value: "inactive", label: "Suspended" },
];

export default function SchoolsListPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [planId, setPlanId] = useState("");
  const [confirm, setConfirm] = useState(null); // { type, school }

  const limit = 10;
  const queryArgs = {
    page, limit,
    ...(search && { search }),
    ...(status !== "all" && { status }),
    ...(planId && { planId }),
  };
  const { data, isLoading, isFetching, refetch } = useGetSchoolsQuery(queryArgs);
  const { data: plansData } = useGetPlansQuery();

  const [suspendSchool] = useSuspendSchoolMutation();
  const [activateSchool] = useActivateSchoolMutation();
  const [deleteSchool, { isLoading: deleting }] = useDeleteSchoolMutation();
  const [loginAs, { isLoading: impersonating }] = useLoginAsSchoolAdminMutation();

  const rows = data?.rows ?? [];
  const total = data?.pagination?.total ?? 0;

  const planOptions = [
    { value: "", label: "All Plans" },
    ...(plansData?.rows ?? []).map((p) => ({ value: p.id, label: p.name })),
  ];

  const handleToggleActive = async (school) => {
    try {
      if (school.isActive) {
        await suspendSchool(school.id).unwrap();
        toast.success(`${school.name} suspended`);
      } else {
        await activateSchool(school.id).unwrap();
        toast.success(`${school.name} activated`);
      }
    } catch (e) {
      toast.error(e?.data?.error || "Action failed");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSchool(confirm.school.id).unwrap();
      toast.success("School deleted");
      setConfirm(null);
    } catch (e) {
      toast.error(e?.data?.error || "Delete failed");
    }
  };

  const handleLoginAs = async (school) => {
    try {
      const res = await loginAs(school.id).unwrap();
      // Start a real session as the school admin, then hard-redirect into the
      // school dashboard so every API call uses the impersonation token + tenant.
      dispatch(loginSuccess({
        token: res.accessToken,
        refreshToken: null,
        tokenExpiry: Date.now() + 15 * 60 * 1000, // impersonation token lives ~15 min
        user: {
          id: res.user.id,
          name: `${res.user.firstName} ${res.user.lastName}`.trim(),
          email: res.user.email,
          role: res.user.role,
          schoolId: res.user.schoolId,
          avatar: null,
        },
      }));
      toast.success(`Logged in as ${school.name} admin`);
      window.location.assign("/dashboard");
    } catch (e) {
      toast.error(e?.data?.error || "Could not log in as admin");
    }
  };

  const exportColumns = [
    { label: "School", get: (r) => r.name },
    { label: "Email", get: (r) => r.email || "" },
    { label: "Subdomain", get: (r) => r.primaryDomain || "" },
    { label: "Plan", get: (r) => r.subscriptions?.[0]?.plan?.name || "" },
    { label: "Students", get: (r) => r._count?.students ?? r.studentCount ?? 0 },
    { label: "Teachers", get: (r) => r.teacherCount ?? 0 },
    { label: "Status", get: (r) => r.derivedStatus || "" },
    { label: "Created", get: (r) => formatDate(r.createdAt) },
  ];

  const columns = [
    {
      key: "name", label: "School",
      render: (_v, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} src={row.logo} size="sm" />
          <div>
            <p className="font-semibold text-slate-800">{row.name}</p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "primaryDomain", label: "Subdomain", sortable: false,
      render: (v) => <span className="font-mono text-[11.5px] text-indigo-600">{v}</span>,
    },
    {
      key: "plan", label: "Plan", sortable: false,
      render: (_v, row) => <PlanBadge plan={row.subscriptions?.[0]?.plan?.name} />,
    },
    {
      key: "studentCount", label: "Students", sortable: false,
      render: (_v, row) => row._count?.students ?? row.studentCount ?? 0,
    },
    {
      key: "teacherCount", label: "Teachers", sortable: false,
      render: (v) => v ?? 0,
    },
    {
      key: "derivedStatus", label: "Status", sortable: false,
      render: (v) => <StatusBadge status={v} />,
    },
    { key: "createdAt", label: "Created", render: (v) => formatDate(v) },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, row) => (
        <div className="flex items-center gap-1 justify-end">
          <button title="View" onClick={() => navigate(`/super-admin/schools/${row.id}`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Eye size={14} /></button>
          <button title="Edit" onClick={() => navigate(`/super-admin/schools/${row.id}?tab=settings`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Pencil size={14} /></button>
          <button
            title={row.isActive ? "Suspend" : "Activate"}
            onClick={() => handleToggleActive(row)}
            className={`p-1.5 rounded-lg hover:bg-slate-100 ${row.isActive ? "text-amber-500" : "text-emerald-500"}`}
          >
            {row.isActive ? <Ban size={14} /> : <CheckCircle2 size={14} />}
          </button>
          <button title="Login as Admin" disabled={impersonating} onClick={() => handleLoginAs(row)} className="p-1.5 rounded-lg hover:bg-slate-100 text-indigo-500"><LogIn size={14} /></button>
          <button title="Delete" onClick={() => setConfirm({ type: "delete", school: row })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Schools" subtitle={`${total} tenant${total === 1 ? "" : "s"} on the platform`} icon={<Building2 size={18} />}>
        <Link to="/super-admin/schools/create">
          <Button icon={<Plus size={15} />}>New School</Button>
        </Link>
      </PageHeader>

      <Card noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3 items-center">
          <SearchInput
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, subdomain…"
            className="flex-1 min-w-[220px]"
          />
          <Select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            options={STATUS_OPTIONS}
            className="w-40"
          />
          <Select
            value={planId}
            onChange={(e) => { setPlanId(e.target.value); setPage(1); }}
            options={planOptions}
            className="w-40"
          />
          <ExportButton filename="schools.csv" rows={rows} columns={exportColumns} />
        </div>

        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading || isFetching}
          emptyText="No schools match these filters."
        />
        <Pagination page={page} total={total} pageSize={limit} onPageChange={setPage} />
      </Card>

      {/* Delete confirmation */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete school?" size="sm">
        <p className="text-sm text-slate-600">
          This will soft-delete <span className="font-semibold">{confirm?.school?.name}</span> and
          suspend all access. Tenant data is retained and can be restored by support.
        </p>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setConfirm(null)}>Cancel</Button>
          <Button variant="danger" loading={deleting} onClick={handleDelete}>Delete</Button>
        </div>
      </Modal>
    </div>
  );
}
