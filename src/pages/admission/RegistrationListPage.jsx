/**
 * Admission → Registration List
 * Enquiries that have progressed to registration (a registration number is
 * auto-allocated when an enquiry is moved to REGISTERED).
 */
import { usePageTitle } from "../../hooks";
import { ClipboardList } from "lucide-react";
import { EnquiryBoard } from "./_admShared";

export default function RegistrationListPage() {
  usePageTitle("Registration List");
  return (
    <EnquiryBoard
      title="Registration List"
      subtitle="Registered applicants in the admission funnel"
      icon={<ClipboardList size={18} />}
      statuses={["REGISTERED"]}
      allowAdd={false}
    />
  );
}
