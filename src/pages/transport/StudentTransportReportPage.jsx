/**
 * Transport → Student Transport Report
 * Every student on transport, filterable by route and stop, exportable.
 */
import { useState } from "react";
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Select, DataTable, ExportButton, SummaryCards } from "../../components/ui";
import { ClipboardList } from "lucide-react";
import {
  useGetTransportRoutesQuery,
  useGetStoppagesQuery,
  useGetStudentTransportReportQuery,
} from "../../redux/api/transportApi";

export default function StudentTransportReportPage() {
  usePageTitle("Student Transport Report");

  const { data: routes = [] } = useGetTransportRoutesQuery();
  const { data: stoppages = [] } = useGetStoppagesQuery();

  const [routeId, setRouteId] = useState("");
  const [stoppageId, setStoppageId] = useState("");

  const { data: rows = [], isFetching } = useGetStudentTransportReportQuery({
    ...(routeId ? { routeId } : {}),
    ...(stoppageId ? { stoppageId } : {}),
  });

  const columns = [
    { key: "sl", label: "Sl. No" },
    { key: "studentName", label: "Student Name", render: (v) => <span className="font-semibold text-slate-800">{v || "—"}</span> },
    { key: "phone", label: "Phone", render: (v) => v || "—" },
    { key: "className", label: "Class", render: (v) => v || "—" },
    { key: "registrationNo", label: "Registration No", render: (v) => v || "—" },
    { key: "routeName", label: "Route Name" },
    { key: "stoppageName", label: "Stoppage Name", render: (v) => v || "N/A" },
  ];
  const tableRows = rows.map((r, i) => ({ ...r, sl: i + 1 }));

  const routeCount = new Set(rows.map((r) => r.routeId)).size;
  const stopCount = new Set(rows.map((r) => r.stoppageId)).size;

  return (
    <div className="space-y-4">
      <PageHeader title="Student Transport Report" subtitle="Transport" icon={<ClipboardList size={18} />} />

      <SummaryCards
        cards={[
          { label: "Students On Transport", value: rows.length },
          { label: "Routes Used", value: routeCount },
          { label: "Stoppages Used", value: stopCount },
        ]}
      />

      <Card title="Filter">
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select label="Route Name" value={routeId} onChange={(e) => setRouteId(e.target.value)}
            options={[{ value: "", label: "All routes" }, ...routes.map((r) => ({ value: r.id, label: r.name }))]} />
          <Select label="Stoppage Name" value={stoppageId} onChange={(e) => setStoppageId(e.target.value)}
            options={[{ value: "", label: "All stoppages" }, ...stoppages.map((s) => ({ value: s.id, label: s.name }))]} />
        </div>
      </Card>

      <Card
        noPadding
        title="Student Route Mapping Report"
        action={
          <ExportButton
            filename="student-transport-report.csv"
            rows={tableRows}
            columns={[
              { label: "Sl. No", get: (r) => r.sl },
              { label: "Student Name", get: (r) => r.studentName },
              { label: "Phone", get: (r) => r.phone },
              { label: "Class", get: (r) => r.className },
              { label: "Registration No", get: (r) => r.registrationNo },
              { label: "Route Name", get: (r) => r.routeName },
              { label: "Stoppage Name", get: (r) => r.stoppageName },
            ]}
          />
        }
      >
        <DataTable columns={columns} data={tableRows} loading={isFetching} emptyText="No students assigned to transport yet." />
      </Card>
    </div>
  );
}
