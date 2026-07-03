import { SimpleIpdPage } from "@/features/ipd/ipd-pages";
import { mockDischarges } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="Discharge Management" description="Discharge checklist, summary, billing placeholder, approval, delay/LAMA/deceased states, and print." rows={mockDischarges} />;
}
