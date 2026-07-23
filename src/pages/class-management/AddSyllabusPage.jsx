/**
 * Class Management → Add Syllabus  ("Create Syllabus")
 * Rich(ish) syllabus content + file attachments (jpg/png/pdf, ≤2MB) for a class.
 * Content is stored as HTML; the textarea accepts formatting/paste.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input, EmptyState } from "../../components/ui";
import { FileText, Save, Upload, Trash2, Plus } from "lucide-react";
import { useGetSectionsQuery } from "../../redux/api/attendanceApi";
import { useCmGetSessionsQuery, useCmGetClassesQuery, useCmSaveSyllabusMutation } from "../../redux/api/classMgmtApi";
import { uploadDocumentFile } from "../../services/upload";
import { CmFilters } from "./_cmShared";

const EMPTY = { academicYearId: "", classId: "", sectionId: "", title: "", content: "", enabled: true, attachments: [] };

export default function AddSyllabusPage() {
  usePageTitle("Add Syllabus");
  const [form, setForm] = useState({ ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const { data: sessions = [] } = useCmGetSessionsQuery();
  const { data: classes = [] } = useCmGetClassesQuery(form.academicYearId || undefined);
  const { data: sections = [] } = useGetSectionsQuery(form.classId, { skip: !form.classId });
  const [save, { isLoading: saving }] = useCmSaveSyllabusMutation();
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error("Max 2MB per file");
    setUploading(true);
    try {
      const res = await uploadDocumentFile(file, "syllabus");
      const url = res?.url || res?.secureUrl || res?.data?.url;
      set("attachments", [...form.attachments, { name: file.name, url }]);
      toast.success("File uploaded");
    } catch (err) { toast.error(err?.response?.data?.error || "Upload failed"); }
    finally { setUploading(false); e.target.value = ""; }
  };
  const removeFile = (i) => set("attachments", form.attachments.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!form.classId) return toast.error("Select a class");
    if (!form.title.trim()) return toast.error("Title is required");
    try { await save(form).unwrap(); toast.success("Syllabus saved"); setForm({ ...EMPTY }); }
    catch (e) { toast.error(e?.data?.error || "Failed to save syllabus"); }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create Syllabus" subtitle="Class syllabus content and attachments" icon={<FileText size={18} />}>
        <Button variant="secondary" size="sm" icon={<Plus size={13} />} onClick={() => setForm({ ...EMPTY })}>Create New Syllabus</Button>
        <Button variant="success" size="sm" icon={<Save size={13} />} loading={saving} onClick={submit}>Submit</Button>
      </PageHeader>

      <Card title="Syllabus Content" noPadding>
        <CmFilters sessions={sessions} classes={classes} sections={sections}
          academicYearId={form.academicYearId} classId={form.classId} sectionId={form.sectionId}
          onYear={(v) => setForm((f) => ({ ...f, academicYearId: v, classId: "", sectionId: "" }))}
          onClass={(v) => setForm((f) => ({ ...f, classId: v, sectionId: "" }))}
          onSection={(v) => set("sectionId", v)} />
        <div className="px-5 pb-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Title *" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Enter title" />
          <label className="flex items-center gap-2 text-[13px] text-slate-600 select-none mt-7"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="w-4 h-4 accent-emerald-600" /> Enabled</label>
        </div>
        <div className="px-5 pb-5">
          <label className="block text-[13px] font-medium text-slate-600 mb-1.5">Syllabus Content</label>
          <textarea value={form.content} onChange={(e) => set("content", e.target.value)} rows={10} placeholder="Type something…"
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-400 resize-y" />
        </div>
      </Card>

      <Card title="Syllabus File Attachment" subtitle="jpg, png, pdf accepted · Max 2MB each"
        action={<label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded-lg bg-indigo-600 text-white cursor-pointer hover:bg-indigo-700">
          <Upload size={13} /> {uploading ? "Uploading…" : "Upload Files"}
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" hidden onChange={onUpload} disabled={uploading} />
        </label>}>
        {form.attachments.length === 0 ? (
          <EmptyState icon="📎" title="No attachments" description="Upload syllabus files here (optional)." />
        ) : (
          <div className="divide-y divide-slate-100">
            {form.attachments.map((a, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <a href={a.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate">{a.name}</a>
                <button onClick={() => removeFile(i)} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
