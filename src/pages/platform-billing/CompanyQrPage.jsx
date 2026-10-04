/**
 * ERP Subscription — the school's side of platform billing.
 *
 * Shows the vendor's fixed payment QR, lets the school record a payment it has
 * made against it, and lists what it has recorded so far.
 *
 * A recorded payment is a CLAIM, not a receipt — nothing here is checked
 * against a bank. The screen says so plainly rather than letting "Paid" imply a
 * confirmation the system cannot give; the vendor flips it to Verified once
 * they have seen the money.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { QrCode, IndianRupee, Upload, Loader2 } from "lucide-react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, Select, Textarea, Badge, DataTable, EmptyState } from "../../components/ui";
import { uploadImageFile } from "../../services/upload";
import {
  useGetPlatformPaymentsQuery,
  useReportPlatformPaymentMutation,
} from "../../redux/api/platformBillingApi";

/**
 * The company's payment QR is FIXED — one account, shipped with the app as a
 * static asset rather than an uploadable setting. Nothing in the product can
 * change it, which is the point: a QR that the wrong person could swap is a QR
 * that can quietly redirect every school's money.
 *
 * To change it, replace public/brand/payment-qr.png and update the lines below.
 */
const COMPANY_QR = {
  image: "/brand/payment-qr.png",
  payeeName: "ARPAN INDUSTRIES",
  app: "PhonePe",
  note: "Scan with any UPI app, then record the payment below with its UTR so we can verify it.",
};

const inr = (v) => `₹${Number(v ?? 0).toLocaleString("en-IN")}`;
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const STATUS_TONE = { VERIFIED: "success", REPORTED: "warning", REJECTED: "danger" };

const METHODS = [
  { value: "UPI", label: "UPI" },
  { value: "BANK", label: "Bank transfer" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "CASH", label: "Cash" },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const BLANK = { amount: "", reference: "", method: "UPI", paidDate: todayISO(), note: "", screenshot: "" };

export default function CompanyQrPage() {
  usePageTitle("ERP Subscription");

  const { data: payRes, isFetching: loadingPayments } = useGetPlatformPaymentsQuery();
  const [report, { isLoading: saving }] = useReportPlatformPaymentMutation();

  const [form, setForm] = useState(BLANK);
  const [uploading, setUploading] = useState(false);

  const payments = payRes?.data ?? [];
  const totals = payRes?.totals ?? { all: 0, verified: 0, pending: 0 };
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickScreenshot = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, "platform-payments");
      setForm((f) => ({ ...f, screenshot: url }));
      toast.success("Screenshot attached");
    } catch (err) {
      toast.error(err.message || "Could not upload the screenshot");
    } finally {
      setUploading(false);
      e.target.value = ""; // let the same file be re-picked after a failure
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return toast.error("Enter the amount you paid");
    try {
      await report({ ...form, amount }).unwrap();
      setForm(BLANK);
      toast.success("Payment recorded — the team will verify it");
    } catch (err) {
      toast.error(err?.data?.error || "Could not record the payment");
    }
  };

  return (
    <div>
      <PageHeader
        title="ERP Subscription"
        subtitle="Pay on the QR below, then record the payment here"
        icon={<QrCode />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 mb-4">
        {/* ── The vendor's QR ─────────────────────────────────────────── */}
        <Card title="Scan to pay">
          <div className="px-4 py-5 text-center">
            <img
              src={COMPANY_QR.image}
              alt={`${COMPANY_QR.app} payment QR for ${COMPANY_QR.payeeName}`}
              className="mx-auto w-full max-w-[260px] object-contain bg-white"
              style={{ border: "1px solid var(--erp-border)" }}
            />

            <p className="mt-4 text-[14px] font-semibold" style={{ color: "var(--erp-text)" }}>
              {COMPANY_QR.payeeName}
            </p>
            <p className="text-[12px] text-slate-600">Scan &amp; pay using {COMPANY_QR.app} or any UPI app</p>

            <p
              className="mt-3 text-[12px] px-3 py-2 text-left"
              style={{ background: "var(--erp-primary-sf)", color: "var(--erp-text)" }}
            >
              {COMPANY_QR.note}
            </p>
          </div>
        </Card>

        {/* ── Record a payment ────────────────────────────────────────── */}
        <Card title="I have paid" subtitle="Record it here so the team can verify">
          <form className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4" onSubmit={submit}>
            <Input
              label="Amount paid" type="number" min="1" required
              value={form.amount} onChange={set("amount")} placeholder="15000"
            />
            <Input
              label="Reference / UTR" value={form.reference} onChange={set("reference")}
              placeholder="UTR or transaction id"
            />
            <Select label="Paid by" options={METHODS} value={form.method} onChange={set("method")} />
            <Input label="Payment date" type="date" required value={form.paidDate} onChange={set("paidDate")} />

            <div className="sm:col-span-2">
              <Textarea label="Note" rows={2} value={form.note} onChange={set("note")}
                        placeholder="e.g. October subscription" />
            </div>

            <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
              <label
                className="inline-flex items-center gap-2 px-3 py-2 text-[13px] cursor-pointer bg-white"
                style={{ border: "1px solid var(--erp-border)", borderRadius: "var(--erp-radius)" }}
              >
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                {uploading ? "Uploading…" : "Attach screenshot"}
                <input type="file" accept="image/*" className="hidden" onChange={pickScreenshot} disabled={uploading} />
              </label>

              {form.screenshot && (
                <a href={form.screenshot} target="_blank" rel="noreferrer"
                   className="text-[12px] font-semibold" style={{ color: "var(--erp-primary)" }}>
                  Screenshot attached — view
                </a>
              )}

              <Button type="submit" loading={saving} className="ml-auto" icon={<IndianRupee size={14} />}>
                Record payment
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* ── What this school has recorded ─────────────────────────────── */}
      <Card
        title="Your payments"
        subtitle={`${inr(totals.verified)} verified · ${inr(totals.pending)} awaiting verification`}
        noPadding
      >
        {!loadingPayments && payments.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nothing recorded yet"
            description="Once you pay on the QR above, record it here so the team can verify it."
          />
        ) : (
          <DataTable
            loading={loadingPayments}
            emptyText="No payments recorded"
            columns={[
              { key: "paidDate", label: "Paid on", render: (_v, r) => fmtDate(r.paidDate) },
              { key: "amount", label: "Amount", render: (_v, r) => <span className="font-semibold">{inr(r.amount)}</span> },
              { key: "method", label: "Mode" },
              { key: "reference", label: "Reference", render: (_v, r) => r.reference || "—" },
              { key: "note", label: "Note", render: (_v, r) => r.note || "—" },
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
            ]}
            data={payments}
          />
        )}
      </Card>
    </div>
  );
}
