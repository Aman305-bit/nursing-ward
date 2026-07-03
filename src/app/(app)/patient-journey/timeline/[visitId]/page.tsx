import { PatientJourneyTimelinePage } from "@/features/patient-journey/patient-journey-pages";

export default async function Page({ params }: { params: Promise<{ visitId: string }> }) {
  const { visitId } = await params;
  return <PatientJourneyTimelinePage visitId={visitId} />;
}
