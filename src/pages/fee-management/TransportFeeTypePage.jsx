/**
 * Fee Management → Transport Fee Type
 */
import { usePageTitle } from "../../hooks";
import { Bus } from "lucide-react";
import { FeeTypeManager } from "./_feeShared";

export default function TransportFeeTypePage() {
  usePageTitle("Transport Fee Type");
  return (
    <FeeTypeManager
      title="Manage Transport Fee Type"
      subtitle="Search / Add / Edit transport fee types"
      icon={<Bus size={18} />}
      isTransport
    />
  );
}
