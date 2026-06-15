/**
 * Employee → Employee ID Print
 * Pick a department and one of the templates designed in the Employee ID Card
 * Editor, then print real staff ID cards.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button, Select, EmptyState, Skeleton } from "../../components/ui";
import { CreditCard as IdCard, Printer, Pencil } from "lucide-react";
import { selectUser } from "../../redux/slices/authSlice";
import apiClient from "../../services/axios";
import { EmpIdCardFace, loadTemplates } from "./_empIdCardShared";

export default function EmployeeIdPrintPage() {
  usePageTitle("Employee ID Print");
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orientation, setOrientation] = useState("vertical");
  const [deptId, setDeptId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [templates] = useState(() => loadTemplates());
  const [templateId, setTemplateId] = useState(() => loadTemplates()[0]?.id || "");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [emp, dep] = await Promise.all([
        apiClient.get("/employees?limit=500"),
        apiClient.get("/employees/departments"),
      ]);
      if (emp.data.success) setEmployees(emp.data.data || []);
      if (dep.data.success) setDepartments(dep.data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const cfg = templates.find((t) => t.id === templateId)?.cfg || null;
  // A saved template can fix the orientation; otherwise honour the dropdown.
  const horizontal = (cfg?.orientation || orientation) === "horizontal";
  const gridCols = horizontal ? "grid-cols-1 md:grid-cols-2" : "grid-cols-2 md:grid-cols-4";
  const rows = deptId ? employees.filter((e) => e.departmentId === deptId) : employees;

  // No templates designed yet → point the admin to the editor.
  if (!templates.length) {
    return (
      <div className="space-y-4">
        <PageHeader title="Employee ID Print" subtitle="Generate printable staff ID cards" icon={<IdCard size={18} />} />
        <EmptyState icon="🪪" title="No ID card templates yet"
          description="Design a template in the Employee ID Card Editor first — it will appear here for printing."
          action={<Button icon={<Pencil size={14} />} onClick={() => navigate("/employee/id-editor")}>Open Employee ID Card Editor</Button>} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <style>{`
        /* Keep background colors/images (header, footer, accents, watermark, barcode)
           when printing — browsers strip them by default. */
        .id-grid, .id-grid * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        @media print {
          .no-print { display:none !important; }
          .id-grid { gap:8px !important; }
          body { background:#fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
      <div className="no-print">
        <PageHeader title="Employee ID Print" subtitle="Generate printable staff ID cards" icon={<IdCard size={18} />}>
          <Button icon={<Printer size={14} />} disabled={!rows.length} onClick={() => window.print()}>Print</Button>
        </PageHeader>

        <Card title="Choose Department & Template">
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select label="Department" value={deptId} onChange={(e) => setDeptId(e.target.value)}
                options={[{ value: "", label: "All Employees" }, ...departments.map((d) => ({ value: d.id, label: d.name }))]} />
              <Select label="Orientation" value={orientation} onChange={(e) => setOrientation(e.target.value)}
                options={[{ value: "vertical", label: "Vertical" }, { value: "horizontal", label: "Horizontal" }]} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Templates (from Employee ID Card Editor)</p>
                <button className="text-[11px] font-semibold text-indigo-600 hover:underline" onClick={() => navigate("/employee/id-editor")}>+ New template</button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {templates.map((t) => (
                  <button key={t.id} onClick={() => setTemplateId(t.id)}
                    className={`rounded-xl border-2 p-2 transition-all text-left ${templateId === t.id ? "border-indigo-500" : "border-slate-200 hover:border-slate-300"}`}>
                    <div className="h-8 rounded-md mb-1 overflow-hidden flex flex-col">
                      <div className="flex-1" style={{ backgroundColor: t.cfg?.headerColor }} />
                      <div className="h-2" style={{ backgroundColor: t.cfg?.footerColor }} />
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 truncate">{t.name}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState icon="🪪" title="No employees" description="Add employees to print ID cards." />
      ) : (
        <div className={`id-grid grid gap-3 ${gridCols}`}>
          {rows.map((e) => <EmpIdCardFace key={e.id} cfg={cfg} employee={e} face="front" logo={user?.schoolLogo} />)}
        </div>
      )}
    </div>
  );
}
