/**
 * Settings → Classes & Sections
 * ─────────────────────────────────────────────────────────────────────────────
 * Single place for the admin to configure which classes and sections exist for
 * the school. Everything created here is the SAME data every class/section
 * dropdown across the app reads (Add Student, Admission, Upload, Fees,
 * Attendance, Payments…), so adding a class here makes it available everywhere
 * instantly. Bulk import also auto-creates any missing class/section, and those
 * show up in this list too.
 */
import { useState } from "react";
import toast from "react-hot-toast";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Input } from "../../components/ui";
import { School, Plus, Trash2, Layers, ChevronRight } from "lucide-react";
import {
  useGetClassesQuery,
  useCreateClassMutation,
  useDeleteClassMutation,
  useCreateSectionMutation,
  useDeleteSectionMutation,
} from "../../redux/api/attendanceApi";

export default function ManageClassesPage() {
  usePageTitle("Classes & Sections");

  const { data: classes = [], isLoading } = useGetClassesQuery();
  const [createClass, { isLoading: creatingClass }] = useCreateClassMutation();
  const [deleteClass] = useDeleteClassMutation();
  const [createSection, { isLoading: creatingSection }] = useCreateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();

  const [newClass, setNewClass] = useState("");
  const [activeClassId, setActiveClassId] = useState(null);
  const [newSection, setNewSection] = useState("");

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0] || null;
  const activeId = activeClass?.id || null;

  const addClass = async () => {
    const name = newClass.trim();
    if (!name) return toast.error("Enter a class name");
    try {
      const cls = await createClass({ name }).unwrap();
      toast.success(`Class “${name}” added`);
      setNewClass("");
      if (cls?.id) setActiveClassId(cls.id);
    } catch (e) {
      toast.error(e?.data?.error || "Could not add class");
    }
  };

  const removeClass = async (cls) => {
    if (!window.confirm(`Delete class “${cls.name}”? This is blocked if it has students.`)) return;
    try {
      await deleteClass(cls.id).unwrap();
      toast.success("Class deleted");
      if (activeClassId === cls.id) setActiveClassId(null);
    } catch (e) {
      toast.error(e?.data?.error || "Could not delete class");
    }
  };

  const addSection = async () => {
    const name = newSection.trim().toUpperCase();
    if (!activeId) return toast.error("Add or select a class first");
    if (!name) return toast.error("Enter a section name");
    try {
      await createSection({ classId: activeId, name }).unwrap();
      toast.success(`Section “${name}” added to ${activeClass.name}`);
      setNewSection("");
    } catch (e) {
      toast.error(e?.data?.error || "Could not add section");
    }
  };

  const removeSection = async (sec) => {
    if (!window.confirm(`Delete section “${sec.name}”? This is blocked if it has students.`)) return;
    try {
      await deleteSection(sec.id).unwrap();
      toast.success("Section deleted");
    } catch (e) {
      toast.error(e?.data?.error || "Could not delete section");
    }
  };

  const sections = activeClass?.sections || [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Classes & Sections"
        subtitle="Configure the classes and sections for your school. These appear in every class/section dropdown across the app."
        icon={<School size={18} />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ── Classes ──────────────────────────────────────────────────── */}
        <Card title="Classes" subtitle={`${classes.length} configured`}>
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Class 10, Nursery, I SC(PCM)"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addClass()}
                className="flex-1"
              />
              <Button icon={<Plus size={14} />} loading={creatingClass} onClick={addClass}>Add</Button>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-400 py-6 text-center">Loading classes…</p>
            ) : classes.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No classes yet. Add your first class above.</p>
            ) : (
              <ul className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {classes.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <li
                      key={c.id}
                      onClick={() => setActiveClassId(c.id)}
                      className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                        isActive ? "bg-emerald-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <ChevronRight size={14} className={isActive ? "text-emerald-600" : "text-slate-300"} />
                        <span className="text-sm font-medium text-slate-700 truncate">{c.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {(c.sections?.length || 0)} section{(c.sections?.length || 0) === 1 ? "" : "s"}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeClass(c); }}
                        className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50"
                        title="Delete class"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Card>

        {/* ── Sections of the selected class ───────────────────────────── */}
        <Card
          title={activeClass ? `Sections of “${activeClass.name}”` : "Sections"}
          subtitle={activeClass ? `${sections.length} configured` : "Select a class on the left"}
        >
          <div className="p-4 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g. A, B, PCM"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSection()}
                disabled={!activeId}
                className="flex-1"
              />
              <Button icon={<Plus size={14} />} loading={creatingSection} disabled={!activeId} onClick={addSection}>Add</Button>
            </div>

            {!activeClass ? (
              <p className="text-sm text-slate-400 py-6 text-center">Add a class first, then add its sections here.</p>
            ) : sections.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center flex flex-col items-center gap-2">
                <Layers size={22} className="text-slate-300" />
                No sections in this class yet.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-slate-100 text-sm text-slate-700"
                  >
                    {s.name}
                    <button
                      onClick={() => removeSection(s)}
                      className="p-0.5 rounded-full text-slate-400 hover:text-red-500 hover:bg-white"
                      title="Delete section"
                    >
                      <Trash2 size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 text-[12px] text-slate-500 leading-relaxed">
          <b className="text-slate-600">How this stays in sync:</b> classes and sections you add here are stored once
          for the school and read by every class / section dropdown — Add Student, Admission, Upload Student, Fee
          Management, Attendance and Payments. Bulk import (Upload Student / Multiple Import) also auto-creates any
          class or section that appears in your file but isn’t listed here, so it shows up automatically. Deleting is
          blocked while a class or section still has students.
        </div>
      </Card>
    </div>
  );
}
