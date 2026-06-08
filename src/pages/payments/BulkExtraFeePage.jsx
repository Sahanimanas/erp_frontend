import { usePageTitle } from "../../hooks";
import { PlusCircle } from "lucide-react";
import { BulkFeeApply } from "./_payShared";
import { useBulkExtraMutation } from "../../redux/api/paymentsApi";

export default function BulkExtraFeePage() {
  usePageTitle("Bulk Add Extra Fee");
  return (
    <BulkFeeApply
      title="Bulk Add Extra Payment to Existing Fee"
      subtitle="Add an extra charge to a whole class"
      icon={<PlusCircle size={18} />}
      amountLabel="Extra Fee Amount"
      actionLabel="Add Extra Fee"
      mutation={useBulkExtraMutation}
    />
  );
}
