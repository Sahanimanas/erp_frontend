/**
 * ProfilePage.jsx — wired to GET /auth/me
 * Shows the logged-in user's profile plus the school branding (logo + name),
 * which school admins / principals can edit here (PUT /schools).
 */
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Avatar, Badge, Button, Modal, Input } from "../../components/ui";
import { UserCog, Pencil, Building2, Camera, X } from "lucide-react";
import apiClient from "../../services/axios";
import { uploadImageFile } from "../../services/upload";

const EDIT_ROLES = ["SCHOOL_ADMIN", "PRINCIPAL"];

export default function ProfilePage() {
  usePageTitle("My Profile");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // School edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [schoolForm, setSchoolForm] = useState({ name: "", logo: "", watermark: "", upiQr: "", address: "", phone: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadingWm, setUploadingWm] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
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
  };
  useEffect(() => { load(); }, []);

  const fullName = user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "";
  const school = user?.school || null;
  const canEditSchool = EDIT_ROLES.includes(user?.role);

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

  const openEdit = () => {
    setSchoolForm({
      name: school?.name || "",
      logo: school?.logo || "",
      watermark: school?.watermark || "",
      upiQr: school?.upiQr || "",
      address: school?.address || "",
      phone: school?.phone || "",
    });
    setEditOpen(true);
  };

  const onLogo = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageFile(file, "schools");
      setSchoolForm((f) => ({ ...f, logo: url }));
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Logo upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onWatermark = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingWm(true);
    try {
      const url = await uploadImageFile(file, "schools");
      setSchoolForm((f) => ({ ...f, watermark: url }));
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "Watermark upload failed");
    } finally {
      setUploadingWm(false);
    }
  };

  const onUpiQr = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadingQr(true);
    try {
      const url = await uploadImageFile(file, "schools");
      setSchoolForm((f) => ({ ...f, upiQr: url }));
    } catch (err) {
      toast.error(err?.response?.data?.error || err.message || "UPI QR upload failed");
    } finally {
      setUploadingQr(false);
    }
  };

  const saveSchool = async () => {
    if (!schoolForm.name.trim()) { toast.error("School name is required"); return; }
    setSaving(true);
    try {
      const res = await apiClient.put("/schools", {
        name: schoolForm.name.trim(),
        logo: schoolForm.logo || null,
        watermark: schoolForm.watermark || null,
        upiQr: schoolForm.upiQr || null,
        address: schoolForm.address || null,
        phone: schoolForm.phone || null,
      });
      if (res.data.success) {
        // Reflect immediately in this page's view.
        setUser((u) => ({ ...u, school: { ...(u.school || {}), ...res.data.data } }));
        // Sync the persisted auth user so printed bills/receipts (which read
        // school identity from localStorage) pick up the change without re-login.
        try {
          const auth = JSON.parse(localStorage.getItem("erp_auth") || "{}");
          if (auth.user) {
            const d = res.data.data || {};
            auth.user = {
              ...auth.user,
              schoolName: d.name ?? auth.user.schoolName,
              schoolLogo: d.logo ?? auth.user.schoolLogo,
              schoolWatermark: d.watermark ?? auth.user.schoolWatermark,
              schoolUpiQr: d.upiQr ?? auth.user.schoolUpiQr,
              schoolAddress: d.address ?? auth.user.schoolAddress,
              schoolPhone: d.phone ?? auth.user.schoolPhone,
            };
            localStorage.setItem("erp_auth", JSON.stringify(auth));
          }
        } catch { /* non-fatal */ }
        toast.success("School updated");
        setEditOpen(false);
      } else {
        toast.error(res.data.error || "Failed to update school");
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || "Failed to update school");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader title="My Profile" subtitle="Account" icon={<UserCog size={18} />}>
        {canEditSchool && !loading && !error && (
          <Button icon={<Pencil size={14} />} onClick={openEdit}>Edit School Info</Button>
        )}
      </PageHeader>

      {loading ? (
        <Card><div className="p-10 text-center text-slate-400 text-sm">Loading profile…</div></Card>
      ) : error ? (
        <Card><div className="p-6 text-center text-red-600 text-sm">{error}</div></Card>
      ) : (
        <div className="space-y-4">
          {/* ── School branding ─────────────────────────────────────────── */}
          <Card className="p-7">
            <div className="flex items-center gap-4">
              {school?.logo ? (
                <img src={school.logo} alt={school.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 bg-white" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                  <Building2 size={26} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">School</p>
                <h3 className="font-bold text-slate-800 text-lg truncate">{school?.name || "—"}</h3>
                <div className="mt-1 space-y-0.5 text-[12px] text-slate-500">
                  <p className="truncate"><span className="text-slate-400">Address:</span> {school?.address || "—"}</p>
                  <p className="truncate"><span className="text-slate-400">Phone:</span> {school?.phone || "—"}</p>
                </div>
              </div>
              {school?.watermark && (
                <div className="hidden sm:flex flex-col items-center gap-1 mr-2">
                  <img src={school.watermark} alt="Watermark" className="w-12 h-12 rounded-lg object-contain border border-slate-200 bg-white opacity-70" />
                  <span className="text-[9px] text-slate-400 uppercase tracking-wide">Watermark</span>
                </div>
              )}
              {canEditSchool && (
                <Button variant="secondary" size="sm" icon={<Pencil size={14} />} onClick={openEdit}>Edit</Button>
              )}
            </div>
          </Card>

          {/* ── User profile ────────────────────────────────────────────── */}
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
        </div>
      )}

      {/* ── Edit school modal ─────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit School Info" size="md">
        <div className="space-y-5">
          {/* Logo upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {schoolForm.logo ? (
                <>
                  <img src={schoolForm.logo} alt="Logo" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setSchoolForm((f) => ({ ...f, logo: "" }))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-slate-600 shadow hover:bg-white">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={22} />
                  <span className="text-[9px]">{uploading ? "Uploading…" : "No logo"}</span>
                </div>
              )}
            </div>
            <div>
              <label className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg cursor-pointer ${uploading ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                <Camera size={13} /> {uploading ? "Uploading…" : "Upload Logo"}
                <input type="file" accept="image/*" onChange={onLogo} disabled={uploading} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">PNG / JPG. Appears on the sidebar, login page and ID cards.</p>
            </div>
          </div>

          {/* Watermark logo upload — appears faintly behind printed bills/receipts */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {schoolForm.watermark ? (
                <>
                  <img src={schoolForm.watermark} alt="Watermark" className="w-full h-full object-contain opacity-70" />
                  <button type="button" onClick={() => setSchoolForm((f) => ({ ...f, watermark: "" }))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-slate-600 shadow hover:bg-white">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={22} />
                  <span className="text-[9px]">{uploadingWm ? "Uploading…" : "No watermark"}</span>
                </div>
              )}
            </div>
            <div>
              <label className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg cursor-pointer ${uploadingWm ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-slate-700 text-white hover:bg-slate-800"}`}>
                <Camera size={13} /> {uploadingWm ? "Uploading…" : "Upload Watermark"}
                <input type="file" accept="image/*" onChange={onWatermark} disabled={uploadingWm} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">Shown faintly behind fee receipts & demand bills. Falls back to the logo if empty.</p>
            </div>
          </div>

          {/* UPI payment QR — printed on demand bills with a "Pay on this QR" caption */}
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
              {schoolForm.upiQr ? (
                <>
                  <img src={schoolForm.upiQr} alt="UPI QR" className="w-full h-full object-contain" />
                  <button type="button" onClick={() => setSchoolForm((f) => ({ ...f, upiQr: "" }))}
                    className="absolute top-1 right-1 p-1 rounded-full bg-white/90 text-slate-600 shadow hover:bg-white">
                    <X size={12} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Camera size={22} />
                  <span className="text-[9px]">{uploadingQr ? "Uploading…" : "No UPI QR"}</span>
                </div>
              )}
            </div>
            <div>
              <label className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg cursor-pointer ${uploadingQr ? "bg-slate-100 text-slate-400 cursor-wait" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}>
                <Camera size={13} /> {uploadingQr ? "Uploading…" : "Upload UPI QR"}
                <input type="file" accept="image/*" onChange={onUpiQr} disabled={uploadingQr} className="hidden" />
              </label>
              <p className="text-[11px] text-slate-400 mt-2">Your UPI payment QR. Printed on demand bills as "Pay on this QR". When set, demand bills print 4 per page to fit it.</p>
            </div>
          </div>

          <Input label="School Name" value={schoolForm.name} onChange={(e) => setSchoolForm((f) => ({ ...f, name: e.target.value }))} placeholder="Enter school name" />
          <Input label="Phone Number" value={schoolForm.phone} onChange={(e) => setSchoolForm((f) => ({ ...f, phone: e.target.value }))} placeholder="e.g. 9504265816" />
          <Input label="Address" value={schoolForm.address} onChange={(e) => setSchoolForm((f) => ({ ...f, address: e.target.value }))} placeholder="Street, city, pincode" />

          <div className="flex justify-end gap-2 pt-1">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={saveSchool}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
