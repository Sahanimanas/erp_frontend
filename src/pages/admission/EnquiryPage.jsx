/**
 * EnquiryPage.jsx
 * Module : admission
 * Page   : Enquiries
 */
import { usePageTitle } from "../../hooks";
import { PageHeader, Card, Button } from "../../components/ui";

export default function EnquiryPage() {
  usePageTitle("Enquiries");

  return (
    <div>
      <PageHeader
        title="Enquiries"
        subtitle="Admission enquiries"
      >
        <Button size="sm">+ Add New</Button>
      </PageHeader>

      

      <Card title="Enquiries List">
        <div className="p-8 text-center text-slate-400 text-sm">No data available.</div>
      </Card>
    </div>
  );
}
