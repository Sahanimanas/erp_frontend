/**
 * Admission → Online Admission List
 * Applicants who have been admitted (end of the admission funnel).
 */
import { usePageTitle } from "../../hooks";
import { GraduationCap } from "lucide-react";
import { EnquiryBoard } from "./_admShared";

export default function AdmissionListPage() {
  usePageTitle("Online Admission List");
  return (
    <EnquiryBoard
      title="Online Admission List"
      subtitle="Applicants admitted to the school"
      icon={<GraduationCap size={18} />}
      statuses={["ADMITTED"]}
      allowAdd={false}
    />
  );
}
