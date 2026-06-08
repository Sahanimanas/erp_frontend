/**
 * Fee Management → Class Fee Type
 */
import { usePageTitle } from "../../hooks";
import { Receipt } from "lucide-react";
import { FeeTypeManager } from "./_feeShared";

export default function ClassFeeTypePage() {
  usePageTitle("Class Fee Type");
  return (
    <FeeTypeManager
      title="Manage Class Fee Type"
      subtitle="Search / Add / Edit class fee types"
      icon={<Receipt size={18} />}
      isTransport={false}
    />
  );
}
