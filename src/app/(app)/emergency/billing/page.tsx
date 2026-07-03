import { EmergencySimplePage } from "@/features/ipd/ipd-pages";
import { mockEmergencyCharges } from "@/data/ipd";

export default function Page() {
  return <EmergencySimplePage title="Emergency Billing Placeholder" description="Quick emergency charge capture, invoice draft, payment state, and future billing module handoff." rows={mockEmergencyCharges} />;
}
