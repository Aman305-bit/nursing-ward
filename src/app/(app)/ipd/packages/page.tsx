import { SimpleIpdPage } from "@/features/ipd/ipd-pages";
import { mockIpdPackages } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="IPD Package Management" description="Package assignment, utilization, excluded charges, nearing-limit warnings, and billing handoff placeholders." rows={mockIpdPackages} />;
}
