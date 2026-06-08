/**
 * Admission → Enquiry
 * Top-of-funnel enquiries with stats, search, add, and stage transitions.
 */
import { usePageTitle } from "../../hooks";
import { MessageSquare } from "lucide-react";
import { EnquiryBoard } from "./_admShared";

export default function EnquiryPage() {
  usePageTitle("Admission Enquiries");
  return (
    <EnquiryBoard
      title="Admission Enquiries"
      subtitle="Capture and track prospective-student enquiries"
      icon={<MessageSquare size={18} />}
      showStats
    />
  );
}
