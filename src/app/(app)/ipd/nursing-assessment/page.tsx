import { SimpleIpdPage } from "@/features/ipd/ipd-pages";
import { mockNursingAssessments } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="Nursing Assessment" description="Grouped assessment forms, fall risk, pressure injury risk, and observation scoring placeholders." rows={mockNursingAssessments} />;
}
