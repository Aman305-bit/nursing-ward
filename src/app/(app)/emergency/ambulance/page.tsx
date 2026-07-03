import { EmergencySimplePage } from "@/features/ipd/ipd-pages";
import { mockAmbulanceRequests } from "@/data/ipd";

export default function Page() {
  return <EmergencySimplePage title="Ambulance Management" description="Ambulance request, assignment, dispatch, arrival, delayed ETA, and emergency registration handoff placeholders." rows={mockAmbulanceRequests} print={false} />;
}
