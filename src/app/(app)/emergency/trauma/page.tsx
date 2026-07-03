import { EmergencySimplePage } from "@/features/ipd/ipd-pages";
import { mockTraumaCases } from "@/data/ipd";

export default function Page() {
  return <EmergencySimplePage title="Trauma Management" description="Trauma checklist, injury summary, GCS placeholder, bleeding status, imaging advice, and disposition." rows={mockTraumaCases} />;
}
