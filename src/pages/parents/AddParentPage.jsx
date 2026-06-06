/**
 * AddParentPage.jsx
 * Module : parents
 * Page   : Add Parent — matches screenshot 7
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";

export default function AddParentPage() {
  usePageTitle("Add Parent");
  const [form, setForm] = useState({
    name: "", relation: "", fatherName: "", motherName: "",
    fatherAadhaar: "", motherAadhaar: "", occupation: "", income: "",
    education: "", city: "", state: "", mobileNo: "", email: "",
    address: "", photo: null,
    facebook: "", twitter: "", linkedin: "",
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) { setForm(f => ({ ...f, photo: file })); setPhotoPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 900));
    setSaving(false);
    alert("Parent added successfully!");
  };

  return (
    <div>
      <PageHeader title="Add Parent" subtitle="Register new parent/guardian" icon="👨‍👩‍👧" />
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Parents Details */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-amber-600">👤 Parents Details</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name *" value={form.name} onChange={set("name")} icon={<span>👤</span>} required />
            <Input label="Relation *" value={form.relation} onChange={set("relation")} required />
            <Input label="Father Name" value={form.fatherName} onChange={set("fatherName")} />
            <Input label="Mother Name" value={form.motherName} onChange={set("motherName")} />
            <Input label="Father's Aadhaar No" value={form.fatherAadhaar} onChange={set("fatherAadhaar")} />
            <Input label="Mother's Aadhaar No" value={form.motherAadhaar} onChange={set("motherAadhaar")} />
            <Input label="Occupation *" value={form.occupation} onChange={set("occupation")} required />
            <Input label="Income" value={form.income} onChange={set("income")} icon={<span>🗒</span>} />
            <Input label="Education" value={form.education} onChange={set("education")} />
            <Input label="City" value={form.city} onChange={set("city")} />
            <Input label="State" value={form.state} onChange={set("state")} />
            <Input label="Mobile No *" type="tel" value={form.mobileNo} onChange={set("mobileNo")} icon={<span>📞</span>} required />
            <Input label="Email" type="email" value={form.email} onChange={set("email")} icon={<span>✉️</span>} />
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Address</label>
              <textarea className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none" rows={2} value={form.address} onChange={set("address")} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Profile Picture</label>
              <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-slate-200 hover:border-indigo-300 rounded-xl p-10 cursor-pointer transition-colors">
                {photoPreview
                  ? <img src={photoPreview} alt="preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100" />
                  : <><span className="text-4xl">☁️</span><span className="text-sm text-slate-500">Drag and drop a file here or click</span></>}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card>
          <div className="px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-amber-600">🌐 Social Links</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Facebook</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 font-bold text-sm">f</span>
                <input className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" placeholder="eg: https://www.facebook.com/username" value={form.facebook} onChange={set("facebook")} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Twitter</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-500 font-bold text-sm">𝕏</span>
                <input className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" placeholder="eg: https://www.twitter.com/username" value={form.twitter} onChange={set("twitter")} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Linkedin</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-700 font-bold text-sm">in</span>
                <input className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400" placeholder="eg: https://www.linkedin.com/username" value={form.linkedin} onChange={set("linkedin")} />
              </div>
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => window.history.back()}>Cancel</Button>
          <Button type="submit" loading={saving}>Save Parent</Button>
        </div>
      </form>
    </div>
  );
}
