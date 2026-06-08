import { usePageTitle } from "../../hooks";
import { Percent } from "lucide-react";
import { BulkFeeApply } from "./_payShared";
import { useBulkDiscountMutation } from "../../redux/api/paymentsApi";

export default function BulkDiscountPage() {
  usePageTitle("Bulk Discount");
  return (
    <BulkFeeApply
      title="Bulk Discount"
      subtitle="Apply a discount to a whole class"
      icon={<Percent size={18} />}
      amountLabel="Discount Amount"
      actionLabel="Apply Discount"
      mutation={useBulkDiscountMutation}
    />
  );
}
