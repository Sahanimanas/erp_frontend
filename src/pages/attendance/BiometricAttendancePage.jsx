import { useEffect, useState, useCallback } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Badge, DataTable, Input, Select, Modal, Tabs, EmptyState } from "../../components/ui";
import apiClient from "../../services/axios";
import { Fingerprint, Plus, Copy, RefreshCw, Trash2, Radio, ScanFace, CreditCard, UserPlus } from "lucide-react";

const MODALITY_META = {
  RFID: { label: "RFID", icon: <CreditCard size={13} />, variant: "info" },
  FINGERPRINT: { label: "Fingerprint", icon: <Fingerprint size={13} />, variant: "purple" },
  FACE: { label: "Face", icon: <ScanFace size={13} />, variant: "cyan" },
};

const studentName = (s) =>
  s ? `${s.user?.firstName || ""} ${s.user?.lastName || ""}`.trim() || s.rollNumber : "—";

export default function BiometricAttendancePage() {
  usePageTitle("Biometric Attendance");
  const [tab, setTab] = useState("devices");
  const [toast, setToast] = useState(null);
  const flash = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div>
      <PageHeader title="Biometric Attendance" subtitle="Connect RFID, fingerprint & face devices — punches flow straight into attendance" icon={<Fingerprint size={18} />} />

      {toast && (
        <div className={`mb-4 rounded-lg px-4 py-2.5 text-sm font-medium ${toast.type === "error" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {toast.text}
        </div>
      )}

      <div className="mb-5">
        <Tabs
          active={tab}
          onChange={setTab}
          tabs={[
            { key: "devices", label: "Devices" },
            { key: "enrollments", label: "Enrollments" },
            { key: "log", label: "Punch Log" },
          ]}
        />
      </div>

      {tab === "devices" && <DevicesTab flash={flash} />}
      {tab === "enrollments" && <EnrollmentsTab flash={flash} />}
      {tab === "log" && <PunchLogTab flash={flash} />}
    </div>
  );
}

// ─── Devices ─────────────────────────────────────────────────────────────────
function DevicesTab({ flash }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/biometric/devices");
      setDevices(data.data || []);
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to load devices");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    flash("success", "Copied to clipboard");
  };

  const rotate = async (id) => {
    try {
      await apiClient.post(`/biometric/devices/${id}/rotate-key`);
      flash("success", "API key regenerated");
      load();
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to rotate key");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this device? Its punch history is kept.")) return;
    try {
      await apiClient.delete(`/biometric/devices/${id}`);
      flash("success", "Device deleted");
      load();
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to delete device");
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<Plus size={13} />} onClick={() => setOpen(true)}>Register Device</Button>
      </div>

      {loading ? (
        <Card className="p-6"><p className="text-sm text-slate-400">Loading devices…</p></Card>
      ) : devices.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Radio size={32} />} title="No devices yet" description="Register your Hikvision (or any) device, then point it at the ingest URL." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {devices.map((d) => {
            const m = MODALITY_META[d.modality] || {};
            return (
              <Card key={d.id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800">{d.name}</h3>
                      <Badge variant={m.variant} >{m.icon}{m.label}</Badge>
                      {!d.isActive && <Badge variant="default">Disabled</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {d.location || "No location"} · {d.serialNumber ? `SN ${d.serialNumber}` : "no serial"} ·
                      {d.lastSeenAt ? ` seen ${new Date(d.lastSeenAt).toLocaleString()}` : " never seen"}
                    </p>
                  </div>
                  <button onClick={() => remove(d.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500" title="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>

                <Field label="Ingest URL (set as the device's HTTP host)">
                  <CopyRow value={d.ingestUrl} onCopy={copy} />
                </Field>
                <Field label="Device API key (header: x-device-key)">
                  <div className="flex items-center gap-2">
                    <CopyRow value={d.apiKey} mono onCopy={copy} />
                    <Button size="xs" variant="secondary" icon={<RefreshCw size={11} />} onClick={() => rotate(d.id)}>Rotate</Button>
                  </div>
                </Field>

                <div className="mt-3 flex gap-4 text-xs text-slate-500">
                  <span><b className="text-slate-700">{d._count?.enrollments ?? 0}</b> enrolled</span>
                  <span><b className="text-slate-700">{d._count?.punches ?? 0}</b> punches</span>
                  <span>Late after <b className="text-slate-700">{minutesToTime(d.lateAfterMinutes)}</b></span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <RegisterDeviceModal open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} flash={flash} />
    </div>
  );
}

function RegisterDeviceModal({ open, onClose, onSaved, flash }) {
  const [form, setForm] = useState({ name: "", modality: "FINGERPRINT", serialNumber: "", location: "", lateAfter: "09:00" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) return flash("error", "Device name is required");
    setSaving(true);
    try {
      await apiClient.post("/biometric/devices", {
        name: form.name.trim(),
        modality: form.modality,
        serialNumber: form.serialNumber.trim() || undefined,
        location: form.location.trim() || undefined,
        lateAfterMinutes: timeToMinutes(form.lateAfter),
      });
      flash("success", "Device registered");
      setForm({ name: "", modality: "FINGERPRINT", serialNumber: "", location: "", lateAfter: "09:00" });
      onSaved();
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to register device");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Register Device">
      <div className="grid grid-cols-2 gap-4">
        <Input label="Device Name *" placeholder="e.g. Main Gate Scanner" value={form.name} onChange={set("name")} />
        <Select label="Type *" value={form.modality} onChange={set("modality")} options={[
          { value: "FINGERPRINT", label: "Fingerprint" },
          { value: "RFID", label: "RFID Card" },
          { value: "FACE", label: "Face" },
        ]} />
        <Input label="Serial Number" placeholder="Device serial / ID" value={form.serialNumber} onChange={set("serialNumber")} />
        <Input label="Location" placeholder="e.g. Main Gate" value={form.location} onChange={set("location")} />
        <Input label="Late after (time)" type="time" value={form.lateAfter} onChange={set("lateAfter")} />
      </div>
      <div className="mt-5 flex gap-2">
        <Button className="flex-1" onClick={submit} loading={saving}>Register</Button>
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}

// ─── Enrollments ─────────────────────────────────────────────────────────────
function EnrollmentsTab({ flash }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get("/biometric/enrollments");
      setRows(data.data || []);
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to load enrollments");
    } finally {
      setLoading(false);
    }
  }, [flash]);

  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    try {
      await apiClient.delete(`/biometric/enrollments/${id}`);
      flash("success", "Enrollment removed");
      load();
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to remove");
    }
  };

  const COLUMNS = [
    { key: "student", label: "Student", render: (_, r) => <span className="font-semibold text-slate-800">{studentName(r.student)}</span> },
    { key: "roll", label: "Roll", render: (_, r) => r.student?.rollNumber || "—" },
    { key: "modality", label: "Type", render: (v) => <Badge variant={MODALITY_META[v]?.variant}>{MODALITY_META[v]?.label || v}</Badge> },
    { key: "deviceUserId", label: "Device User ID", render: (v) => v || "—" },
    { key: "cardNumber", label: "Card No", render: (v) => v || "—" },
    { key: "device", label: "Device", render: (_, r) => r.device?.name || "Any" },
    { key: "id", label: "Actions", sortable: false, render: (_, r) => (
      <button onClick={() => remove(r.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
    ) },
  ];

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" icon={<UserPlus size={13} />} onClick={() => setOpen(true)}>Enroll Student</Button>
      </div>
      <Card noPadding>
        <DataTable columns={COLUMNS} data={rows} loading={loading} emptyText="No students enrolled on any device yet" />
      </Card>
      <EnrollModal open={open} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} flash={flash} />
    </div>
  );
}

function EnrollModal({ open, onClose, onSaved, flash }) {
  const [students, setStudents] = useState([]);
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ studentId: "", modality: "FINGERPRINT", deviceUserId: "", cardNumber: "", deviceId: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!open) return;
    apiClient.get("/students?limit=1000").then(({ data }) => setStudents(data.data || [])).catch(() => {});
    apiClient.get("/biometric/devices").then(({ data }) => setDevices(data.data || [])).catch(() => {});
  }, [open]);

  const submit = async () => {
    if (!form.studentId) return flash("error", "Select a student");
    if (!form.deviceUserId.trim() && !form.cardNumber.trim()) return flash("error", "Enter a Device User ID and/or Card Number");
    setSaving(true);
    try {
      await apiClient.post("/biometric/enrollments", {
        studentId: form.studentId,
        modality: form.modality,
        deviceUserId: form.deviceUserId.trim() || undefined,
        cardNumber: form.cardNumber.trim() || undefined,
        deviceId: form.deviceId || undefined,
      });
      flash("success", "Student enrolled");
      setForm({ studentId: "", modality: "FINGERPRINT", deviceUserId: "", cardNumber: "", deviceId: "" });
      onSaved();
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to enroll");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Enroll Student on Device">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Select label="Student *" value={form.studentId} onChange={set("studentId")} options={[
            { value: "", label: "Select student…" },
            ...students.map((s) => ({ value: s.id, label: `${studentName(s)} (${s.rollNumber})` })),
          ]} />
        </div>
        <Select label="Type *" value={form.modality} onChange={set("modality")} options={[
          { value: "FINGERPRINT", label: "Fingerprint" },
          { value: "RFID", label: "RFID Card" },
          { value: "FACE", label: "Face" },
        ]} />
        <Select label="Device (optional)" value={form.deviceId} onChange={set("deviceId")} options={[
          { value: "", label: "Any device" },
          ...devices.map((d) => ({ value: d.id, label: d.name })),
        ]} />
        <Input label="Device User ID" placeholder="ID enrolled on the terminal (employeeNo)" value={form.deviceUserId} onChange={set("deviceUserId")} />
        <Input label="Card Number" placeholder="RFID card number" value={form.cardNumber} onChange={set("cardNumber")} />
      </div>
      <p className="mt-3 text-xs text-slate-400">
        The <b>Device User ID</b> must match the person/employee number configured on the device. For RFID, the <b>Card Number</b> the reader sends.
      </p>
      <div className="mt-5 flex gap-2">
        <Button className="flex-1" onClick={submit} loading={saving}>Enroll</Button>
        <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
      </div>
    </Modal>
  );
}

// ─── Punch Log ───────────────────────────────────────────────────────────────
function PunchLogTab({ flash }) {
  const [rows, setRows] = useState([]);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [deviceId, setDeviceId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (date) params.set("date", date);
      if (deviceId) params.set("deviceId", deviceId);
      const { data } = await apiClient.get(`/biometric/punches?${params.toString()}`);
      setRows(data.data || []);
    } catch (e) {
      flash("error", e.response?.data?.error || "Failed to load punches");
    } finally {
      setLoading(false);
    }
  }, [date, deviceId, flash]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    apiClient.get("/biometric/devices").then(({ data }) => setDevices(data.data || [])).catch(() => {});
  }, []);

  const COLUMNS = [
    { key: "eventTime", label: "Time", render: (v) => new Date(v).toLocaleString() },
    { key: "student", label: "Student", render: (_, r) => r.student ? (
      <span className="font-semibold text-slate-800">{studentName(r.student)} <span className="font-normal text-slate-400">({r.student.rollNumber})</span></span>
    ) : <span className="text-amber-600">Unmatched</span> },
    { key: "rawUserId", label: "Device User ID", render: (v, r) => v || r.cardNumber || "—" },
    { key: "modality", label: "Type", render: (v) => <Badge variant={MODALITY_META[v]?.variant}>{MODALITY_META[v]?.label || v}</Badge> },
    { key: "direction", label: "Direction", render: (v) => <Badge variant={v === "OUT" ? "warning" : "success"} dot>{v}</Badge> },
    { key: "device", label: "Device", render: (_, r) => r.device?.name || "—" },
    { key: "matched", label: "Status", render: (v) => <Badge variant={v ? "success" : "danger"}>{v ? "Recorded" : "No match"}</Badge> },
  ];

  return (
    <div>
      <Card noPadding>
        <div className="flex flex-wrap items-end gap-2 border-b border-slate-100 p-4">
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-slate-600">Date</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          </div>
          <Select className="w-48" value={deviceId} onChange={(e) => setDeviceId(e.target.value)} options={[
            { value: "", label: "All devices" },
            ...devices.map((d) => ({ value: d.id, label: d.name })),
          ]} />
          <Button size="sm" variant="secondary" icon={<RefreshCw size={12} />} onClick={load}>Refresh</Button>
        </div>
        <DataTable columns={COLUMNS} data={rows} loading={loading} emptyText="No punches for this filter" />
      </Card>
    </div>
  );
}

// ─── small helpers ───────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-[11px] font-semibold text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function CopyRow({ value, mono, onCopy }) {
  return (
    <div className="flex w-full items-center gap-2">
      <input
        readOnly
        value={value || ""}
        className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 ${mono ? "font-mono" : ""}`}
      />
      <button onClick={() => onCopy(value)} className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100" title="Copy">
        <Copy size={13} />
      </button>
    </div>
  );
}

const timeToMinutes = (t) => {
  const [h, m] = String(t || "09:00").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
const minutesToTime = (mins) => {
  const h = Math.floor((mins ?? 540) / 60);
  const m = (mins ?? 540) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
