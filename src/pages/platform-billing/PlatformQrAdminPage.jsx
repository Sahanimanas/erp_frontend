/**
 * Platform → School Payments & Service (super admin).
 *
 * The vendor's ledger: what every school has paid, and how long its service
 * runs. Verifying a payment EXTENDS that school's subscription in the same
 * action — confirming the money and granting the service are one decision, and
 * splitting them is how a school ends up paid-up but locked out.
 *
 * Verifying itself is a human act performed elsewhere (a bank statement, a UPI
 * app); this screen only records the outcome. That is why the control says
 * Verify rather than anything implying the system checked.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { Check, X, Building2, AlertTriangle } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Badge, DataTable, Select } from "../../components/ui";
import {
  useGetPlatformPaymentsQuery,
  useGetPlatformSummaryQuery,
  useSetPlatformPaymentStatusMutation,
} from "../../redux/api/platformBillingApi";

const inr = (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_TONE = { VERIFIED: "success", REPORTED: "warning", REJECTED: "danger" };

const STATUS_FILTER = [
  { value: "", label: "All statuses" },
  { value: "REPORTED", label: "Awaiting verification" },
  { value: "VERIFIED", label: "Verified" },
  { value: "REJECTED", label: "Rejected" },
];

export default function PlatformQrAdminPage() {
  usePageTitle("School Payments & Service");

  const [status, setStatus] = useState("");
  // Clicking a school in the ledger narrows the payment list below it, so the
  // two tables act as one drill-down rather than two unrelated views.
  const [schoolId, setSchoolId] = useState("");
  // How much service a verification grants. Kept on the page rather than per
  // row because one school's cheque is almost always for one billing period —
  // the few that are not get it changed once, then verified.
  const [months, setMonths] = useState(1);
  const { data: payRes, isFetching: loadingPayments } = useGetPlatformPaymentsQuery({
    ...(status ? { status } : {}),
    ...(schoolId ? { schoolId } : {}),
  });
  const { data: sumRes, isFetching: loadingSummary } = useGetPlatformSummaryQuery();
  const [setPaymentStatus] = useSetPlatformPaymentStatusMutation();

  const payments = payRes?.data ?? [];
  const totals = payRes?.totals ?? { all: 0, verified: 0, pending: 0 };
  const summary = sumRes?.data ?? [];
  const sumTotals = sumRes?.totals ?? { verified: 0, pending: 0, schools: 0, neverPaid: 0 };
  const selectedSchool = summary.find((r) => r.schoolId === schoolId);

  const mark = async (id, next) => {
    try {
      const res = await setPaymentStatus({ id, status: next, months }).unwrap();
      if (next !== "VERIFIED") return void toast.success("Marked rejected");

      // The server verifies the payment even when it cannot extend the service
      // (no plan assigned), and says so — surface that instead of a bare tick.
      if (res?.warning) return void toast(res.warning, { icon: "⚠️", duration: 6000 });
      const till = res?.subscription?.endDate;
      toast.success(
        till
          ? `Verified — service active till ${fmtDate(till)}`
          : "Verified"
      );
    } catch (err) {
      toast.error(err?.data?.error || "Could not update the payment");
    }
  };

  return (
    <div>
      <PageHeader
        title="School Payments & Service"
        subtitle="What each school has paid, and how long its service runs"
        icon={<Building2 />}
      />

      {/* ── School-wise record ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Schools", value: sumTotals.schools, tone: "var(--erp-primary)" },
          { label: "Verified received", value: inr(sumTotals.verified), tone: "var(--erp-success)" },
          { label: "Awaiting verification", value: inr(sumTotals.pending), tone: "var(--erp-warning)" },
          { label: "Never paid", value: sumTotals.neverPaid, tone: "var(--erp-danger)" },
        ].map((k) => (
          <div key={k.label} className="bg-white px-4 py-3"
               style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}>
            <p className="text-[11px] text-slate-600">{k.label}</p>
            <p className="text-[18px] font-bold mt-0.5" style={{ color: k.tone }}>{k.value}</p>
          </div>
        ))}
      </div>

      <Card
        title="School-wise record"
        subtitle="Every school on the platform — click one to see only its payments"
        action={
          schoolId ? (
            <Button size="xs" variant="secondary" onClick={() => setSchoolId("")}>Show all schools</Button>
          ) : null
        }
        noPadding
        className="mb-4"
      >
        <DataTable
          loading={loadingSummary}
          emptyText="No schools yet"
          onRowClick={(r) => setSchoolId((cur) => (cur === r.schoolId ? "" : r.schoolId))}
          columns={[
            {
              key: "schoolName",
              label: "School",
              render: (_v, r) => (
                <span className="flex items-center gap-2">
                  <Building2 size={14} className="text-slate-500 shrink-0" />
                  <span className="font-semibold">{r.schoolName}</span>
                  {r.isActive === false && <Badge variant="danger">Inactive</Badge>}
                  {r.schoolId === schoolId && <Badge variant="info">Filtering</Badge>}
                </span>
              ),
            },
            { key: "payments", label: "Payments", render: (_v, r) => r.payments || 0 },
            {
              key: "verified",
              label: "Verified",
              render: (_v, r) => <span style={{ color: "var(--erp-success)" }} className="font-semibold">{inr(r.verified)}</span>,
            },
            {
              key: "pending",
              label: "Pending",
              render: (_v, r) =>
                r.pending > 0
                  ? <span style={{ color: "var(--erp-warning)" }} className="font-semibold">{inr(r.pending)}</span>
                  : "—",
            },
            { key: "lastPaidDate", label: "Last paid", render: (_v, r) => fmtDate(r.lastPaidDate) },
            {
              key: "serviceStatus",
              label: "Service",
              render: (_v, r) => {
                if (r.serviceStatus === "NONE") return <Badge variant="default">No plan</Badge>;
                // Expiry is what actually decides whether the school can work,
                // so a date in the past overrides whatever the status says.
                const expired = r.validUntil && new Date(r.validUntil) < new Date();
                return (
                  <Badge variant={expired ? "danger" : r.serviceStatus === "ACTIVE" ? "success" : "warning"}>
                    {expired ? "EXPIRED" : r.serviceStatus}
                  </Badge>
                );
              },
            },
            {
              key: "validUntil",
              label: "Valid till",
              render: (_v, r) => {
                if (!r.validUntil) return "—";
                const d = new Date(r.validUntil);
                const days = Math.ceil((d - new Date()) / 86400000);
                return (
                  <span>
                    {fmtDate(r.validUntil)}
                    <span className="block text-[11px] text-slate-600">
                      {days < 0 ? `${Math.abs(days)} days ago` : `${days} days left`}
                    </span>
                  </span>
                );
              },
            },
            {
              key: "flag",
              label: "",
              sortable: false,
              render: (_v, r) =>
                r.payments === 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold"
                        style={{ color: "var(--erp-danger)" }}>
                    <AlertTriangle size={12} /> Never paid
                  </span>
                ) : null,
            },
          ]}
          data={summary}
        />
      </Card>

      <Card
        title={selectedSchool ? `Payments — ${selectedSchool.schoolName}` : "Reported payments"}
        subtitle={`${inr(totals.verified)} verified · ${inr(totals.pending)} awaiting · verifying extends service by ${months} month${months > 1 ? "s" : ""}`}
        action={
          <div className="flex items-end gap-2">
            <div className="w-[170px]">
              <Select
                label="Verify grants"
                options={[1, 2, 3, 6, 12].map((m) => ({ value: m, label: `${m} month${m > 1 ? "s" : ""}` }))}
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
              />
            </div>
            <div className="w-[190px]">
              <Select options={STATUS_FILTER} value={status} onChange={(e) => setStatus(e.target.value)} />
            </div>
          </div>
        }
        noPadding
      >
        <DataTable
          loading={loadingPayments}
          emptyText="No school has reported a payment yet"
          columns={[
            { key: "schoolName", label: "School", render: (_v, r) => <span className="font-semibold">{r.schoolName}</span> },
            { key: "paidDate", label: "Paid on", render: (_v, r) => fmtDate(r.paidDate) },
            { key: "amount", label: "Amount", render: (_v, r) => <span className="font-semibold">{inr(r.amount)}</span> },
            { key: "method", label: "Mode" },
            { key: "reference", label: "Reference", render: (_v, r) => r.reference || "—" },
            {
              key: "screenshot",
              label: "Proof",
              sortable: false,
              render: (_v, r) =>
                r.screenshot ? (
                  <a href={r.screenshot} target="_blank" rel="noreferrer"
                     className="font-semibold" style={{ color: "var(--erp-primary)" }}>View</a>
                ) : "—",
            },
            {
              key: "status",
              label: "Status",
              render: (_v, r) => <Badge variant={STATUS_TONE[r.status] ?? "default"}>{r.status}</Badge>,
            },
            {
              key: "act",
              label: "",
              sortable: false,
              render: (_v, r) =>
                r.status === "REPORTED" ? (
                  <div className="flex gap-1.5">
                    <Button
                      size="xs" variant="success"
                      onClick={() => mark(r.id, "VERIFIED")}
                      icon={<Check size={12} />}
                      title={`Verify and extend ${r.schoolName}'s service by ${months} month${months > 1 ? "s" : ""}`}
                    >
                      Verify +{months}m
                    </Button>
                    <Button size="xs" variant="danger" onClick={() => mark(r.id, "REJECTED")} icon={<X size={12} />}>
                      Reject
                    </Button>
                  </div>
                ) : (
                  <Button size="xs" variant="ghost" onClick={() => mark(r.id, "REPORTED")}>Undo</Button>
                ),
            },
          ]}
          data={payments}
        />
      </Card>
    </div>
  );
}
