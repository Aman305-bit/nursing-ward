import { SimpleIpdPage } from "@/features/ipd/ipd-pages";
import { mockTransfers } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="Transfer Management" description="Bed, ward, ICU transfer requests with source/target visibility and reason placeholders." rows={mockTransfers} />;
}
