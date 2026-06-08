/**
 * Super Admin → Domain Management
 * Platform-wide view of subdomains + custom domains with DNS/SSL state.
 * Architecture is provider-agnostic (Vercel / Cloudflare / wildcard DNS).
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { Globe, Plus, ShieldCheck, Trash2, RefreshCw } from "lucide-react";
import {
  Card, DataTable, PageHeader, Button, Modal, Input, Select, Badge,
} from "../../components/ui";
import {
  useGetDomainsQuery, useAddDomainMutation, useVerifyDomainMutation,
  useDeleteDomainMutation, useGetSchoolsQuery,
} from "../../redux/api/superAdminApi";
import { DnsBadge, formatDate, ROOT_DOMAIN } from "./_saShared";

export default function DomainsPage() {
  const { data: domains, isLoading } = useGetDomainsQuery();
  const { data: schoolsData } = useGetSchoolsQuery({ limit: 100 });
  const [addDomain, { isLoading: adding }] = useAddDomainMutation();
  const [verifyDomain] = useVerifyDomainMutation();
  const [deleteDomain] = useDeleteDomainMutation();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ schoolId: "", domain: "", type: "custom" });

  const schools = schoolsData?.rows ?? [];

  const submit = async () => {
    if (!form.schoolId || !form.domain) { toast.error("Pick a school and enter a domain"); return; }
    try {
      await addDomain(form).unwrap();
      toast.success("Domain added");
      setOpen(false);
      setForm({ schoolId: "", domain: "", type: "custom" });
    } catch (e) {
      toast.error(e?.data?.error || "Failed to add domain");
    }
  };

  const onVerify = async (d) => {
    try { await verifyDomain(d.id).unwrap(); toast.success("Domain verified"); }
    catch (e) { toast.error(e?.data?.error || "Verify failed"); }
  };
  const onDelete = async (d) => {
    if (d.isPrimary) { toast.error("Cannot remove the primary domain"); return; }
    try { await deleteDomain(d.id).unwrap(); toast.success("Domain removed"); }
    catch (e) { toast.error(e?.data?.error || "Remove failed"); }
  };

  const columns = [
    { key: "domain", label: "Domain", render: (v) => <span className="font-mono text-[12px] text-indigo-600">{v}</span> },
    { key: "school", label: "School", sortable: false, render: (_v, r) => r.school?.name || "—" },
    { key: "type", label: "Type", render: (v) => <Badge variant={v === "subdomain" ? "cyan" : "purple"}>{v}</Badge> },
    { key: "dnsStatus", label: "DNS", render: (v) => <DnsBadge status={v} /> },
    { key: "sslStatus", label: "SSL", render: (v) => <DnsBadge status={v} /> },
    { key: "isPrimary", label: "Primary", render: (v) => (v ? <Badge variant="indigo">Primary</Badge> : "—") },
    { key: "createdAt", label: "Created", render: (v) => formatDate(v) },
    {
      key: "actions", label: "", sortable: false,
      render: (_v, r) => (
        <div className="flex items-center gap-1 justify-end">
          {(r.dnsStatus !== "ACTIVE" || r.sslStatus !== "ACTIVE") && (
            <button title="Verify DNS/SSL" onClick={() => onVerify(r)} className="p-1.5 rounded-lg hover:bg-slate-100 text-emerald-500"><ShieldCheck size={14} /></button>
          )}
          {!r.isPrimary && (
            <button title="Remove" onClick={() => onDelete(r)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Domain Management" subtitle="Subdomains & custom domains across all tenants" icon={<Globe size={18} />}>
        <Button icon={<Plus size={15} />} onClick={() => setOpen(true)}>Add Domain</Button>
      </PageHeader>

      <Card noPadding>
        <DataTable columns={columns} data={domains ?? []} loading={isLoading} emptyText="No domains configured." />
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Custom Domain" size="md">
        <div className="space-y-4">
          <Select
            label="School"
            value={form.schoolId}
            onChange={(e) => setForm((f) => ({ ...f, schoolId: e.target.value }))}
            options={[{ value: "", label: "Select school…" }, ...schools.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={[{ value: "custom", label: "Custom Domain (school.edu)" }, { value: "subdomain", label: `Subdomain (.${ROOT_DOMAIN})` }]}
          />
          <Input
            label="Domain"
            value={form.domain}
            onChange={(e) => setForm((f) => ({ ...f, domain: e.target.value.toLowerCase() }))}
            placeholder={form.type === "custom" ? "portal.school.edu" : `school.${ROOT_DOMAIN}`}
          />
          <div className="bg-slate-50 rounded-lg p-3 text-[11px] text-slate-500 flex items-start gap-2">
            <RefreshCw size={13} className="mt-0.5" />
            <span>Custom domains start as <b>PENDING</b>. After pointing a CNAME to the platform, click verify to provision DNS + SSL. Subdomains under the wildcard go live instantly.</span>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={adding} onClick={submit}>Add Domain</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
