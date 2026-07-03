import { SimpleIpdPage } from "@/features/ipd/ipd-pages";
import { mockIntakeOutput } from "@/data/ipd";

export default function Page() {
  return <SimpleIpdPage title="Intake Output Chart" description="Fluid intake, output, balance summary, status, and print placeholder." rows={mockIntakeOutput} />;
}
