import { EmergencySimplePage } from "@/features/ipd/ipd-pages";
import { mockCasualtyCases } from "@/data/ipd";

export default function Page() {
  return <EmergencySimplePage title="Casualty Management" description="Emergency case sheet, stabilization, treatment placeholders, disposition, and IPD/ICU handoff." rows={mockCasualtyCases} />;
}
